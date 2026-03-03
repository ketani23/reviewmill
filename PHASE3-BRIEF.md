# Phase 3 Brief — Full Product Loop

## What to Build

Build the complete ReviewGuard product loop using mock data. When done, a business owner should be able to:
1. Log in via Google OAuth (already working)
2. See their reviews on the dashboard (mock data, already working)
3. Click "Generate Response" on any review → Claude drafts a response in real-time
4. See the draft on the review card, edit it if they want
5. Click "Approve & Send" (mock send for now, just updates status)
6. Get email notifications when new reviews come in (simulated via a "Simulate New Review" button on the dashboard)

## 1. Claude Response Drafting (Real AI)

Update `/api/draft-response` to use the Anthropic API (key is in env as ANTHROPIC_API_KEY).

Use `@anthropic-ai/sdk` package. Install it.

Prompt engineering for responses:
- Input: review text, rating (1-5), reviewer name, business name, brand voice
- Output: a professional response (2-4 sentences)
- Tone varies by rating:
  - 5 stars: warm gratitude, reference specifics from the review
  - 4 stars: thank + gently acknowledge any concerns
  - 3 stars: empathetic, address concerns, invite back
  - 1-2 stars: professional, apologetic, offer to resolve offline
- Use Claude Haiku (claude-3-5-haiku-20241022) to keep costs low
- Response should feel human, not corporate

Wire this into the dashboard: each review card gets a "Generate Response" button that calls the API and displays the draft.

## 2. Interactive Review Cards

Update ReviewCard component:
- Show review text, rating (stars), reviewer name, date
- "Generate Response" button → calls /api/draft-response → shows loading spinner → displays draft
- Draft response is editable (textarea)
- "Approve" button → updates status to "approved" (local state for now)
- Status badges: Pending (yellow), Drafted (blue), Approved (green), Sent (green check)
- Make it feel snappy — optimistic UI updates

## 3. Email Notifications (Resend)

Install `resend` package. Create a Resend account at resend.com (free tier: 3k emails/mo).

Actually — we can't create a Resend account programmatically. Instead:
- Build the email template and API endpoint (`/api/send-notification`)
- Use a mock mode that logs the email to console instead of sending
- The email should contain: business name, reviewer name, star rating, review snippet, and a "View & Respond" link to the dashboard
- Make the email HTML beautiful — match the ReviewGuard branding (navy + gold)

## 4. "Simulate New Review" Feature

Add a button on the dashboard: "Simulate New Review"
- Generates a random review (random name, rating, realistic review text from a pool)
- Adds it to the review list with "Pending" status
- Triggers the mock email notification
- This lets us demo the full flow without real Google data

## 5. Polish

- Add a toast/notification system for feedback ("Response generated!", "Response approved!")
- Loading states for all async operations  
- Mobile responsive (the dashboard should work on phone)
- Remove the debug-env endpoint

## Tech Notes
- Anthropic SDK: `@anthropic-ai/sdk` 
- Keep using mock data in Supabase-free mode (local state / React state)
- Don't touch the landing page
- Don't add Stripe yet
- Don't try to connect real Google Business API yet

## Environment Variables Available
- ANTHROPIC_API_KEY (set in Vercel + .env.local)
- All Google/Supabase vars from before

When completely finished:
1. Make sure `npm run build` passes
2. Run: openclaw system event --text "Done: Phase 3 complete — Claude drafting, interactive review cards, email templates, simulate flow" --mode now
