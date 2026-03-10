# Final Security Fix Pass — PRs #3 and #5

Fix ALL findings below. This is the last round before merge.

## PR #3 Findings

### MEDIUM: Onboarding stuck when business row missing
- Dashboard redirects to /onboarding when no business exists
- But /api/business/save only does UPDATE (returns 404 if no row)
- Onboarding wizard calls /api/business/save, gets 404, user is trapped
- **Fix:** In `app/api/business/save/route.ts`, if the update returns 0 rows AND it looks like an onboarding save (has business_name + business_type), do an INSERT instead of failing. Use Supabase upsert with onConflict on owner_email. This way first-time saves create the row.

### LOW: HTML injection in business_name in emails
- business_name is user-controlled and interpolated into email HTML
- **Fix:** Create a simple `escapeHtml` helper (replace &, <, >, ", '). Apply it to business_name before interpolation in `app/api/send-notification/route.ts` `buildEmailHtml` function. Also apply to reviewer_name and review_text since those will be user-controlled when real reviews come in.

## PR #5 Findings

### MEDIUM: Unauthenticated checkout redirect uses wrong status
- `NextResponse.redirect(new URL("/api/auth/google", req.url))` defaults to 307 for POST
- **Fix:** Return a 401 JSON response instead: `{ error: "Unauthorized", redirect: "/api/auth/google" }`. Let the client handle the redirect. This is cleaner for a POST endpoint.

### MEDIUM: Webhook acknowledges missing business (billing desync)
- Returns 200 when no business row found, Stripe won't retry
- **Fix:** Return 202 with a warning that the event was received but not fully processed. Log prominently. This is a pragmatic middle ground — 4xx/5xx would cause infinite retries for genuinely missing rows, but 200 hides the problem. Actually, the best fix: attempt to create the business row on the fly from Stripe customer email if it doesn't exist (a lightweight "ensure business exists" before the update). Use upsert with just owner_email and the stripe fields.

### LOW: Webhook error message leaks details
- **Fix:** Return generic "Invalid webhook signature" message, keep details in server log only.

### LOW: Portal route missing DB error handling
- **Fix:** Wrap `getBusinessByEmail` in try/catch, return 500 with controlled message.

## Constraints
- MUST run `npm run build` and verify it passes (zero type errors)
- Commit all changes as one commit per branch
- Push to both branches: feat/phase7-app-integration (PR #3 fixes) and feat/phase8-stripe (PR #5 fixes)
- feat/phase8-stripe should merge feat/phase7-app-integration first since shared code
