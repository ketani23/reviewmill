import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateReviewToken } from "@/lib/tokens";

type ReviewPayload = {
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_date: string;
};

function buildEmailHtml(
  businessName: string,
  review: ReviewPayload,
  liveMode: boolean,
  reviewToken: string | null
): string {
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  const snippet =
    review.review_text.length > 180
      ? review.review_text.slice(0, 180) + "…"
      : review.review_text;
  const ratingLabel =
    review.rating === 5
      ? "Excellent"
      : review.rating === 4
      ? "Good"
      : review.rating === 3
      ? "Average"
      : review.rating === 2
      ? "Poor"
      : "Critical";
  const ratingColor =
    review.rating >= 4
      ? "#16a34a"
      : review.rating === 3
      ? "#d97706"
      : "#dc2626";

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://reviewmill.vercel.app";

  // Use token-based deep links when a token is available
  const reviewPageUrl = reviewToken
    ? `${appUrl}/review/${reviewToken}`
    : `${appUrl}/dashboard`;
  const quickApproveUrl = reviewToken
    ? `${appUrl}/api/review/approve?token=${reviewToken}`
    : `${appUrl}/dashboard`;

  const footerNote = liveMode
    ? "ReviewGuard · AI-powered review management"
    : 'ReviewGuard · AI-powered review management · <strong style="color:#6b7280;">Mock Mode — email not actually sent</strong>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Review Alert — ${businessName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="background-color:#f3f4f6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:580px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e;padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:bold;color:#ffffff;letter-spacing:-0.5px;">ReviewGuard</span>
                    <span style="font-size:13px;color:#e8a838;margin-left:10px;font-weight:500;">New Review Alert</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alert banner -->
          <tr>
            <td style="background-color:#e8a838;padding:12px 32px;">
              <p style="margin:0;font-size:13px;font-weight:600;color:#1a1a2e;text-transform:uppercase;letter-spacing:0.5px;">
                ⚡ Action Required — New review needs a response
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:15px;color:#374151;">
                A new review was posted for <strong style="color:#1a1a2e;">${businessName}</strong>.
                Businesses that respond quickly see higher trust and better rankings.
              </p>

              <!-- Review card -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="margin-top:24px;background-color:#f9fafb;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

                <!-- Review header -->
                <tr>
                  <td style="padding:18px 20px 12px;border-bottom:1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td>
                          <span style="font-size:20px;color:#e8a838;letter-spacing:2px;">${stars}</span>
                          <span style="font-size:13px;font-weight:600;color:${ratingColor};margin-left:8px;">${ratingLabel}</span>
                        </td>
                        <td align="right">
                          <span style="font-size:12px;color:#9ca3af;">${new Date(review.review_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:6px 0 0;font-size:14px;font-weight:600;color:#1a1a2e;">${review.reviewer_name}</p>
                  </td>
                </tr>

                <!-- Review text -->
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:14px;color:#4b5563;line-height:1.65;font-style:italic;">
                      &ldquo;${snippet}&rdquo;
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA buttons -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;">
                <tr>
                  <td style="border-radius:10px;overflow:hidden;padding-right:12px;">
                    <a href="${reviewPageUrl}"
                      style="display:inline-block;background-color:#e8a838;color:#ffffff;text-decoration:none;padding:14px 28px;font-size:14px;font-weight:700;border-radius:10px;letter-spacing:0.2px;">
                      View &amp; Respond Now →
                    </a>
                  </td>
                  ${
                    reviewToken
                      ? `<td style="border-radius:10px;overflow:hidden;">
                    <a href="${quickApproveUrl}"
                      style="display:inline-block;background-color:#16a34a;color:#ffffff;text-decoration:none;padding:14px 28px;font-size:14px;font-weight:700;border-radius:10px;letter-spacing:0.2px;">
                      ✓ Quick Approve
                    </a>
                  </td>`
                      : ""
                  }
                </tr>
              </table>

              <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">
                <strong>View &amp; Respond</strong> opens the review page where you can edit the AI draft before approving.
                ${reviewToken ? '<br/><strong>Quick Approve</strong> immediately approves the AI-drafted response — no login required.' : ''}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
                ${footerNote}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { business_name, review, owner_email, review_id, business_id } = body as {
    business_name?: string;
    review?: ReviewPayload;
    owner_email?: string;
    review_id?: string;
    business_id?: string;
  };

  if (!business_name || !review) {
    return NextResponse.json(
      { error: "business_name and review are required" },
      { status: 400 }
    );
  }

  // Generate a review token when review_id and business_id are provided
  let reviewToken: string | null = null;
  if (review_id && business_id) {
    try {
      reviewToken = await generateReviewToken(review_id, business_id);
    } catch (err) {
      console.warn("Token generation failed:", err);
    }
  }

  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  const subject = `New ${stars} review from ${review.reviewer_name} — ${business_name}`;
  const toEmail = owner_email ?? "aniket.das2302@gmail.com";

  if (!process.env.RESEND_API_KEY) {
    const emailHtml = buildEmailHtml(business_name, review, false, reviewToken);
    console.log("\n");
    console.log("═══════════════════════════════════════════════════════");
    console.log("  📧  REVIEWGUARD — MOCK EMAIL NOTIFICATION");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`  To:      ${toEmail}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Mode:    MOCK (not sent — configure Resend to enable)`);
    console.log("───────────────────────────────────────────────────────");
    console.log(`  Reviewer: ${review.reviewer_name}`);
    console.log(`  Rating:   ${stars} (${review.rating}/5)`);
    console.log(`  Excerpt:  "${review.review_text.slice(0, 100)}${review.review_text.length > 100 ? "…" : ""}"`);
    if (reviewToken) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://reviewmill.vercel.app";
      console.log(`  Review URL:      ${appUrl}/review/${reviewToken}`);
      console.log(`  Quick Approve:   ${appUrl}/api/review/approve?token=${reviewToken}`);
    }
    console.log("───────────────────────────────────────────────────────");
    console.log("  [HTML email rendered — see below for template preview]");
    console.log(emailHtml.slice(0, 200) + "...");
    console.log("═══════════════════════════════════════════════════════\n");

    return NextResponse.json({ success: true, mode: "mock" });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const emailHtml = buildEmailHtml(business_name, review, true, reviewToken);

  const { data, error } = await resend.emails.send({
    from: "ReviewGuard <onboarding@resend.dev>",
    to: toEmail,
    subject,
    html: emailHtml,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true, mode: "live", emailId: data?.id });
}
