import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

  // Store session in a cookie (simple JWT-like approach)
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

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
