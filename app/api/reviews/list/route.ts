import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBusinessByEmail, getReviewsByBusiness } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId is required" }, { status: 400 });
  }

  const business = await getBusinessByEmail(session.email);
  if (!business || business.id !== businessId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const reviews = await getReviewsByBusiness(businessId);
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("[REVIEWS/LIST] Error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
