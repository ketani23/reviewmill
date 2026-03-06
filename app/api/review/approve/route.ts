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

  let supabase;
  try {
    supabase = createSupabaseClient();
  } catch {
    // Supabase env vars missing — return mock success
    return NextResponse.json({ success: true, mode: "mock", reviewId: claims.reviewId });
  }

  const { data, error } = await supabase
    .from("reviews")
    .update({ drafted_response: response_text, response_status: "approved" })
    .eq("id", claims.reviewId)
    .eq("business_id", claims.businessId)
    .select("id");

  if (error) {
    // If Supabase isn't connected / table doesn't exist yet, return mock success
    console.warn("Supabase update skipped (mock mode):", error.message);
    return NextResponse.json({ success: true, mode: "mock", reviewId: claims.reviewId });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, mode: "live", reviewId: claims.reviewId });
}

// GET: show a confirmation page — prevents email client prefetch from auto-approving
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

  // Fetch the existing drafted response to pre-fill the confirmation form
  let draftedResponse = "";
  try {
    const supabase = createSupabaseClient();
    const { data } = await supabase
      .from("reviews")
      .select("drafted_response")
      .eq("id", claims.reviewId)
      .eq("business_id", claims.businessId)
      .single();
    if (data?.drafted_response) {
      draftedResponse = data.drafted_response;
    }
  } catch {
    // Supabase not available; proceed with empty draft
  }

  return new Response(buildConfirmPage(token, draftedResponse), {
    headers: { "Content-Type": "text/html" },
  });
}

function buildConfirmPage(token: string, draftedResponse: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://reviewmill.vercel.app";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm Approval — ReviewGuard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f3f4f6; font-family: Arial, Helvetica, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 480px; width: 100%; overflow: hidden; }
    .header { background: #1a1a2e; padding: 24px 32px; }
    .header span { color: #fff; font-weight: bold; font-size: 18px; }
    .body { padding: 32px; }
    .icon { width: 56px; height: 56px; border-radius: 50%; background: #fef3c7; color: #e8a838; font-size: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    h1 { font-size: 20px; color: #1a1a2e; margin-bottom: 12px; text-align: center; }
    p { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 16px; }
    .draft { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; font-size: 14px; color: #374151; line-height: 1.65; font-style: italic; margin-bottom: 24px; max-height: 160px; overflow-y: auto; }
    .btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-approve { flex: 1; background: #16a34a; color: #fff; border: none; padding: 14px 24px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; }
    .btn-approve:hover { background: #15803d; }
    .btn-cancel { flex: 1; background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; padding: 14px 24px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; }
    #status { margin-top: 16px; font-size: 14px; color: #6b7280; text-align: center; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header"><span>ReviewGuard</span></div>
    <div class="body">
      <div class="icon">?</div>
      <h1>Confirm Approval</h1>
      <p>You are about to approve the following AI-drafted response. Click <strong>Confirm Approval</strong> to post it.</p>
      ${draftedResponse ? `<div class="draft">&ldquo;${escapeHtml(draftedResponse)}&rdquo;</div>` : ""}
      <div class="btn-row">
        <button class="btn-approve" onclick="approve()">&#10003; Confirm Approval</button>
        <a class="btn-cancel" href="${appUrl}/dashboard">Cancel</a>
      </div>
      <div id="status"></div>
    </div>
  </div>
  <script>
    var TOKEN = ${JSON.stringify(token)};
    var RESPONSE_TEXT = ${JSON.stringify(draftedResponse)};
    function approve() {
      var btn = document.querySelector('.btn-approve');
      var status = document.getElementById('status');
      btn.disabled = true;
      btn.textContent = 'Approving\u2026';
      status.style.display = 'block';
      status.textContent = 'Saving\u2026';
      fetch('/api/review/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: TOKEN, response_text: RESPONSE_TEXT || 'Approved.' })
      })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.success) {
          document.querySelector('.body').innerHTML =
            '<div class="icon" style="background:#dcfce7;color:#16a34a;">&#10003;</div>' +
            '<h1>Response Approved!</h1>' +
            '<p style="text-align:center;">Your AI-drafted response has been approved. You can close this tab.</p>' +
            '<div style="text-align:center;margin-top:24px;"><a href="${appUrl}/dashboard" style="background:#e8a838;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;">Go to Dashboard &rarr;</a></div>';
        } else {
          status.textContent = d.error || 'Failed to approve. Please try again.';
          btn.disabled = false;
          btn.textContent = '&#10003; Confirm Approval';
        }
      })
      .catch(function() {
        status.textContent = 'Network error. Please try again.';
        btn.disabled = false;
        btn.textContent = '&#10003; Confirm Approval';
      });
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
