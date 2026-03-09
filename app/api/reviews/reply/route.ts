import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBusinessByEmail, getReviewById, updateReviewStatus } from "@/lib/db";
import { getValidAccessToken, replyToReview } from "@/lib/google";
import { checkOrigin } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  const originError = checkOrigin(req);
  if (originError) return originError;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { reviewId, response_text } = body as {
    reviewId?: string;
    response_text?: string;
  };

  if (!reviewId || !response_text) {
    return NextResponse.json(
      { error: "reviewId and response_text are required" },
      { status: 400 }
    );
  }

  const business = await getBusinessByEmail(session.email);
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const review = await getReviewById(reviewId);
  if (!review || review.business_id !== business.id) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  if (!review.google_review_id || !review.google_account_id || !review.google_location_id) {
    // No Google IDs — just mark as responded locally
    await updateReviewStatus(reviewId, "responded", response_text);
    return NextResponse.json({ success: true, posted: false });
  }

  try {
    const accessToken = await getValidAccessToken(business.id);

    await replyToReview(
      accessToken,
      `accounts/${review.google_account_id}`,
      `locations/${review.google_location_id}`,
      review.google_review_id,
      response_text,
      business.id
    );

    await updateReviewStatus(reviewId, "responded", response_text);

    return NextResponse.json({ success: true, posted: true });
  } catch (err) {
    console.error("[REPLY] Error:", err);
    const message = err instanceof Error ? err.message : "Reply failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
