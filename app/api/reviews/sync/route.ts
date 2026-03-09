import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBusinessByEmail, upsertReview } from "@/lib/db";
import {
  getValidAccessToken,
  listReviews,
  starRatingToNumber,
} from "@/lib/google";
import { checkOrigin } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  const originError = checkOrigin(req);
  if (originError) return originError;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await getBusinessByEmail(session.email);
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  if (!business.google_account_id || !business.google_location_id) {
    return NextResponse.json(
      { error: "Google Business location not configured. Go to Settings to connect." },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getValidAccessToken(business.id);

    const googleReviews = await listReviews(
      accessToken,
      `accounts/${business.google_account_id}`,
      `locations/${business.google_location_id}`,
      business.id
    );

    let newCount = 0;
    const newReviewIds: string[] = [];

    for (const gr of googleReviews) {
      const result = await upsertReview({
        business_id: business.id,
        google_review_id: gr.reviewId,
        google_account_id: business.google_account_id,
        google_location_id: business.google_location_id,
        reviewer_name: gr.reviewer?.displayName ?? "Anonymous",
        rating: starRatingToNumber(gr.starRating),
        review_text: gr.comment ?? "",
        review_date: gr.createTime,
      });

      if (result.isNew) {
        newCount++;
        newReviewIds.push(result.id);

        // Auto-generate AI draft for new reviews
        try {
          const draftRes = await fetch(
            new URL("/api/draft-response", req.url).toString(),
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                rating: starRatingToNumber(gr.starRating),
                reviewer_name: gr.reviewer?.displayName ?? "Anonymous",
                review_text: gr.comment ?? "",
                business_name: business.business_name ?? "Our Business",
                brand_voice: business.voice_tone ?? "professional and friendly",
              }),
            }
          );
          if (draftRes.ok) {
            const { draft } = await draftRes.json();
            if (draft) {
              const { createSupabaseClient } = await import(
                "@/lib/supabase-server"
              );
              const supabase = createSupabaseClient();
              await supabase
                .from("reviews")
                .update({ drafted_response: draft, response_status: "drafted" })
                .eq("id", result.id);
            }
          }
        } catch (e) {
          console.warn("[SYNC] Draft generation failed for review:", result.id, e);
        }

        // Send email notification for new reviews
        try {
          await fetch(new URL("/api/send-notification", req.url).toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              business_name: business.business_name ?? "Your Business",
              owner_email: business.notification_email ?? business.owner_email,
              review_id: result.id,
              business_id: business.id,
              review: {
                reviewer_name: gr.reviewer?.displayName ?? "Anonymous",
                rating: starRatingToNumber(gr.starRating),
                review_text: gr.comment ?? "",
                review_date: gr.createTime,
              },
            }),
          });
        } catch (e) {
          console.warn("[SYNC] Notification failed for review:", result.id, e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      total: googleReviews.length,
      newCount,
      newReviewIds,
    });
  } catch (err) {
    console.error("[SYNC] Error:", err);
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
