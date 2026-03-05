# Phase 4 — Email Notifications with Resend

## Goal
Replace the mock email notification with real email sending via Resend.

## What Exists
- `app/api/send-notification/route.ts` — fully built HTML email template, currently just logs to console
- `components/DashboardContent.tsx` — calls `/api/send-notification` on simulate
- The email template is polished (ReviewGuard branding, review card, CTA button)

## Tasks

### 1. Install Resend
```bash
npm install resend
```

### 2. Update `app/api/send-notification/route.ts`
- Import Resend and initialize with `RESEND_API_KEY` env var
- Keep the existing `buildEmailHtml` function as-is
- Replace the console.log mock with actual `resend.emails.send()`
- Send from: `ReviewGuard <onboarding@resend.dev>` (Resend's free test domain — works immediately, no custom domain needed)
- Send to: the business owner's email (for now, accept `owner_email` in the request body; fall back to a hardcoded test email `aniket.das2302@gmail.com` if not provided)
- Subject: `New {stars} review from {reviewer_name} — {business_name}`
- Return `{ success: true, mode: "live", emailId: data.id }` on success
- Return `{ success: true, mode: "mock" }` if RESEND_API_KEY is not set (graceful fallback to current mock behavior)

### 3. Update the CTA link
- In `buildEmailHtml`, change the CTA href from `http://localhost:3000/dashboard` to use an environment variable `NEXT_PUBLIC_APP_URL` (default to `https://reviewmill.vercel.app`)

### 4. Update `components/DashboardContent.tsx`
- Update the toast message: if response has `mode: "live"`, show "Email notification sent!"; if "mock", show "Email logged (configure Resend to send)"

### 5. Environment Variables
- Add to `.env.example` with all required env vars listed (no values)
- Do NOT commit `.env.local`

### 6. Update the email footer
- Remove the "Mock Mode — email not actually sent" text from the HTML footer when in live mode
- Keep it when in mock mode (no API key)

## Constraints
- Do NOT modify auth, database, or other existing functionality
- Keep the existing HTML email template — it's already good
- Resend free tier: 100 emails/day, `onboarding@resend.dev` sender
- Run `npm run build` to verify no type errors before committing
- Commit with conventional commits, push to a feature branch, and create a PR to main
