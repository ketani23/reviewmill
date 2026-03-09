import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { upsertBusiness, getBusinessByEmail } from "@/lib/db";
import { createSessionCookieValue } from "@/lib/session";

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

  if (!userRes.ok) {
    console.error("[AUTH] Google userinfo request failed:", userRes.status);
    return NextResponse.redirect(
      new URL("/dashboard?error=userinfo_failed", req.url)
    );
  }

  const user = await userRes.json();

  if (!user.email || typeof user.email !== "string") {
    console.error("[AUTH] Google userinfo returned no email:", user);
    return NextResponse.redirect(
      new URL("/dashboard?error=missing_email", req.url)
    );
  }

  // Upsert business record — only set business_name on first sign-in (insert),
  // not on subsequent logins, to avoid overwriting user-edited names
  try {
    const existing = await getBusinessByEmail(user.email);
    if (existing) {
      // Existing user — only update tokens, not business_name
      await upsertBusiness({
        owner_email: user.email,
        google_account_id: user.id,
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
      });
    } else {
      // New user — set business_name from Google profile as default
      await upsertBusiness({
        owner_email: user.email,
        business_name: user.name,
        google_account_id: user.id,
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
      });
    }
  } catch (err) {
    console.error("[AUTH] upsertBusiness failed — user authenticated but DB record may be missing:", err);
    // For new users, a missing DB record means nothing works — redirect to error
    // For existing users (token refresh failed), we can still proceed
    const existingCheck = await getBusinessByEmail(user.email).catch(() => null);
    if (!existingCheck) {
      return NextResponse.redirect(
        new URL("/dashboard?error=db_setup_failed", req.url)
      );
    }
  }

  // Store signed session in cookie — tokens are NOT included here;
  // they're persisted in the DB (google_access_token / google_refresh_token).
  const sessionValue = createSessionCookieValue({
    email: user.email,
    name: user.name,
    picture: user.picture,
  });

  const cookieStore = await cookies();
  cookieStore.set("rg_session", sessionValue, {
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
