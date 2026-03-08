# Phase 6 — Approval Flow via Email

## Goal
Let business owners approve or edit AI-drafted responses directly from the notification email, without needing to log in to the dashboard.

## Context
- Phase 3 already has AI response drafting (Claude Haiku) in the dashboard
- Phase 4 sends email notifications with a "View & Respond Now" CTA
- Reviews and responses are stored in Supabase (`reviews` table has `drafted_response` and `response_status` columns)
- Currently all interaction happens in the dashboard — this phase adds an email-driven workflow

## Architecture

### Token-Based Auth
- When a notification email is sent, generate a short-lived JWT token (24h expiry) containing `{ reviewId, businessId }`
- The token is embedded in email links — no login required
- Tokens are signed with a `REVIEW_TOKEN_SECRET` env var

### New Pages & API Routes

#### 1. `app/review/[token]/page.tsx` — Review Action Page
- Decode the JWT token to get reviewId
- Fetch the review from Supabase (or mock data for now)
- Show:
  - The original review (reviewer name, rating, text)
  - The AI-drafted response in an editable textarea
  - Two buttons: "Approve & Post" (green) and "Edit & Save" (blue)
- "Approve & Post" → calls `/api/review/approve` → sets `response_status = "approved"`
- "Edit & Save" → calls `/api/review/approve` with edited text → updates `drafted_response` and sets status to "approved"
- Show success confirmation after approval
- If token is expired/invalid, show a friendly error with link to dashboard

#### 2. `app/api/review/approve/route.ts` — Approve API
- Accepts `{ token, response_text }` 
- Validates JWT token
- Updates the review in Supabase: `drafted_response = response_text`, `response_status = 'approved'`
- Returns success/error
- For now, since we're using mock data in state, this endpoint should work with Supabase if connected, or return a mock success

#### 3. `lib/tokens.ts` — Token utilities
- `generateReviewToken(reviewId: string, businessId: string): string` — creates signed JWT
- `verifyReviewToken(token: string): { reviewId: string, businessId: string } | null` — verifies and decodes
- Use the `jose` library (lightweight, works in Edge/Vercel serverless)

### Update Existing Code

#### 4. Update `app/api/send-notification/route.ts`
- After generating the email, create a review token
- Update the CTA link in the email to point to `/review/{token}` instead of `/dashboard`
- This way the email link goes directly to the review action page

#### 5. Update email template
- Add a second button/link: "Quick Approve" that hits `/api/review/approve` directly with a GET request (one-click approve from email)
- Keep "View & Respond" as the main CTA linking to the review page

## Dependencies
```bash
npm install jose
```

## Design
- The review action page should match the existing ReviewGuard design language (dark navy header, amber accents, clean cards)
- Mobile-friendly — business owners will likely open emails on their phone
- Keep it simple: review card + editable response + action buttons

## Constraints
- Do NOT modify the dashboard or auth flow
- JWT secret must be in env vars (`REVIEW_TOKEN_SECRET`)
- Tokens expire after 24 hours
- No login required — token IS the auth for that specific review
- Run `npm run build` to verify before committing
- Commit with conventional commits, push, and create a PR to main
