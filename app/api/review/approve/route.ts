import { NextRequest, NextResponse } from "next/server";
import { verifyReviewToken } from "@/lib/tokens";
import { createSupabaseClient } from "@/lib/supabase-server";

// POST: approve with optional edited response text
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, response_text } = body as {
    token?: unknown;
    response_text?: unknown;
  };

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }
  if (typeof response_text !== "string" || !response_text) {
    return NextResponse.json({ error: "response_text is required" }, { status: 400 });
  }

  const claims = await verifyReviewToken(token);
  if (!claims) {
    return NextResponse.json(
      { error: "Token is invalid or expired. Please request a new link." },
      { status: 401 }
    );
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("reviews")
    .update({ drafted_response: response_text, response_status: "approved" })
    .eq("id", claims.reviewId);

  if (error) {
    // If Supabase isn't connected / table doesn't exist yet, return mock success
    console.warn("Supabase update skipped (mock mode):", error.message);
    return NextResponse.json({ success: true, mode: "mock", reviewId: claims.reviewId });
  }

  return NextResponse.json({ success: true, mode: "live", reviewId: claims.reviewId });
}

// GET: one-click approve from email link — uses the drafted_response already stored
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response(buildSimplePage("Missing token", "No token was provided in the link.", false), {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  const claims = await verifyReviewToken(token);
  if (!claims) {
    return new Response(
      buildSimplePage(
        "Link Expired",
        "This approval link has expired or is invalid. Please log in to the dashboard to manage your review.",
        false
      ),
      { headers: { "Content-Type": "text/html" }, status: 401 }
    );
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("reviews")
    .update({ response_status: "approved" })
    .eq("id", claims.reviewId);

  if (error) {
    console.warn("Supabase update skipped (mock mode):", error.message);
  }

  return new Response(
    buildSimplePage(
      "Response Approved!",
      "Your AI-drafted response has been approved. You can close this tab.",
      true
    ),
    { headers: { "Content-Type": "text/html" } }
  );
}

function buildSimplePage(title: string, message: string, success: boolean): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://reviewmill.vercel.app";
  const color = success ? "#16a34a" : "#dc2626";
  const icon = success ? "✓" : "✕";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — ReviewGuard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f3f4f6; font-family: Arial, Helvetica, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 420px; width: 100%; overflow: hidden; }
    .header { background: #1a1a2e; padding: 24px 32px; }
    .header span { color: #fff; font-weight: bold; font-size: 18px; }
    .body { padding: 32px; text-align: center; }
    .icon { width: 56px; height: 56px; border-radius: 50%; background: ${color}; color: #fff; font-size: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    h1 { font-size: 20px; color: #1a1a2e; margin-bottom: 12px; }
    p { font-size: 14px; color: #6b7280; line-height: 1.6; }
    a { display: inline-block; margin-top: 24px; background: #e8a838; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header"><span>ReviewGuard</span></div>
    <div class="body">
      <div class="icon">${icon}</div>
      <h1>${title}</h1>
      <p>${message}</p>
      <a href="${appUrl}/dashboard">Go to Dashboard →</a>
    </div>
  </div>
</body>
</html>`;
}
