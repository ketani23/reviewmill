import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase-server";
import { mockReviews } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reviewId = searchParams.get("reviewId");

  if (!reviewId) {
    return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, reviewer_name, rating, review_text, review_date, drafted_response, response_status")
    .eq("id", reviewId)
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
