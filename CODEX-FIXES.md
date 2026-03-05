# Codex Review Fixes — PR #2

Address ALL of the following findings from Codex code review. These are security and correctness issues.

## 1. Hardcoded fallback email (HIGH)
**File:** `app/api/send-notification/route.ts`
- Remove hardcoded `aniket.das2302@gmail.com` fallback
- Require `owner_email` in the request body
- Return 400 error if `owner_email` is missing in live mode (when RESEND_API_KEY is set)
- In mock mode, use `test@example.com` as the logged address

## 2. Unprotected review fetch endpoint (HIGH)
**File:** `app/api/review/get/route.ts`
- Require `token` query param instead of raw `reviewId`
- Verify the JWT token server-side
- Extract `reviewId` and `businessId` from verified claims
- Scope the Supabase query by both `id` AND `business_id`

## 3. Supabase client crash on missing env vars (MEDIUM)
**Files:** `app/api/review/get/route.ts`, `app/api/review/approve/route.ts`
- Wrap `createSupabaseClient()` calls in try/catch
- If Supabase env vars are missing, return mock response instead of crashing

## 4. JWT secret fallback in production (HIGH)
**File:** `lib/tokens.ts`
- Throw error when `REVIEW_TOKEN_SECRET` is unset AND `NODE_ENV === "production"`
- Keep dev fallback for local development only

## 5. GET approve endpoint risks (HIGH)
**File:** `app/api/review/approve/route.ts`
- Change GET handler: instead of auto-approving, render a confirmation page
- The confirmation page should POST to the same endpoint to actually approve
- This prevents email client prefetch from triggering approvals

## 6. Approve query should scope by business_id (MEDIUM)
**File:** `app/api/review/approve/route.ts`
- Add `business_id` constraint to the update query from JWT claims
- Handle 0 rows updated as 404

## 7. Rating validation (LOW)
**File:** `app/api/send-notification/route.ts`
- Clamp `review.rating` to 0-5 range before building stars string

## 8. Notification error handling in dashboard (LOW)
**File:** `components/DashboardContent.tsx`
- Check `notifRes.ok` before reading response
- Show error toast on notification failure

## 9. Review fetch should use token (MEDIUM)
**File:** `app/review/[token]/page.tsx`
- Pass token to `/api/review/get` (as query param or header)
- Update the fetch call accordingly

## 10. Fix misleading comment
**File:** `app/review/[token]/page.tsx`
- Update comment about token validation to reflect actual flow (uses `/api/review/decode`)

## Constraints
- Run `npm run build` after all fixes
- Commit as `fix(security): address codex review findings`
- Push to same branch (feat/phase6-email-approval)
