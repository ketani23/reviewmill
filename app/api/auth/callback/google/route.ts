import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { upsertBusiness, getBusinessByEmail } from "@/lib/db";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/dashboard?error=auth_failed", req.url)
    );
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: "https://reviewmill.vercel.app/api/auth/callback/google",
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();

  if (!tokens.access_token) {
    return NextResponse.redirect(
      new URL("/dashboard?error=token_exchange_failed", req.url)
    );
  }

  // Get user info
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const user = await userRes.json();

  // Upsert business record (creates on first sign-in, no-ops on subsequent)
  try {
    await upsertBusiness({
      owner_email: user.email,
      business_name: user.name,
      google_account_id: user.id,
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token,
    });
  } catch {
    // Don't block sign-in if DB write fails
  }

  // Store session in cookie
  const sessionData = JSON.stringify({
    email: user.email,
    name: user.name,
    picture: user.picture,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  });

  const cookieStore = await cookies();
  cookieStore.set("rg_session", Buffer.from(sessionData).toString("base64"), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Check if onboarding is needed (business_type not yet set)
  let redirectPath = "/onboarding";
  try {
    const business = await getBusinessByEmail(user.email);
    if (business?.business_type) redirectPath = "/dashboard";
  } catch {
    // DB error — send to dashboard, it will handle fallback
    redirectPath = "/dashboard";
  }

  return NextResponse.redirect(new URL(redirectPath, req.url));
}
