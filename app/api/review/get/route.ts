import { NextRequest, NextResponse } from "next/server";
import { verifyReviewToken } from "@/lib/tokens";
import { createSupabaseClient } from "@/lib/supabase-server";
import { mockReviews } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const claims = await verifyReviewToken(token);
  if (!claims) {
    return NextResponse.json(
      { error: "Token is invalid or expired" },
      { status: 401 }
    );
  }

  const { reviewId, businessId } = claims;

  let supabase;
  try {
    supabase = createSupabaseClient();
  } catch {
    // Supabase env vars missing — fall back to mock data
    const mock = mockReviews.find((r) => r.id === reviewId);
    if (mock) {
      return NextResponse.json({ review: mock });
    }
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("id, reviewer_name, rating, review_text, review_date, drafted_response, response_status")
    .eq("id", reviewId)
    .eq("business_id", businessId)
    .single();

  if (error || !data) {
    // Fall back to mock data
    const mock = mockReviews.find((r) => r.id === reviewId);
    if (mock) {
      return NextResponse.json({ review: mock });
    }
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  return NextResponse.json({ review: data });
}
