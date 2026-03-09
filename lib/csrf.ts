import { NextRequest, NextResponse } from "next/server";

/**
 * Validates the Origin header on mutating requests against NEXT_PUBLIC_APP_URL.
 * Returns a 403 response if the origin is invalid, or null if the check passes.
 */
export function checkOrigin(req: NextRequest): NextResponse | null {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origin = req.headers.get("origin");

  // In dev without APP_URL set, allow localhost origins
  if (!appUrl) {
    if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
      return null;
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Normalise: strip trailing slash
  const allowed = appUrl.replace(/\/$/, "");

  if (!origin || origin !== allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
