import { NextRequest, NextResponse } from "next/server";
import { verifyReviewToken } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token } = body as { token?: unknown };

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const claims = await verifyReviewToken(token);
  if (!claims) {
    return NextResponse.json(
      { error: "Token is invalid or expired." },
      { status: 401 }
    );
  }

  return NextResponse.json({ reviewId: claims.reviewId, businessId: claims.businessId });
}
