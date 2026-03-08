# Security Fixes — PRs #3 and #5

Fix ALL findings below. These span both branches but share code.

## 1. HIGH: Session cookie is forgeable (base64 JSON, no signature)
**File:** `lib/session.ts` + `app/api/auth/callback/google/route.ts`
- Sign the session cookie using HMAC-SHA256 with a `SESSION_SECRET` env var
- Format: `base64payload.signature`
- `getSession()` must verify the signature before parsing
- `setSession()` (in the OAuth callback where the cookie is set) must sign it
- Throw in production if `SESSION_SECRET` is unset (same pattern as REVIEW_TOKEN_SECRET)
- This is critical — without it, anyone can forge sessions and access other users' Stripe portals

## 2. HIGH: business_type enum mismatch breaks onboarding
**File:** `app/api/business/save/route.ts` + `components/OnboardingWizard.tsx` + `components/SettingsContent.tsx`
- The API validates against lowercase (`restaurant`, `auto_shop`)
- The frontend sends title-case (`Restaurant`, `Auto Shop`)
- Fix: normalize to lowercase in the API before validation: `business_type?.toLowerCase().replace(/\s+/g, '_')`
- This way both sides work regardless of casing

## 3. MEDIUM: JSON parse not guarded
**File:** `app/api/business/save/route.ts`
- Wrap `await req.json()` in try/catch
- Return 400 on parse failure

## 4. MEDIUM: Save reports success with 0 rows updated
**File:** `lib/db.ts` (updateBusinessProfile function)
- After the Supabase update, check if any rows were affected
- If 0 rows updated, throw an error or return a flag
- The API route should return 404 if the business doesn't exist

## 5. MEDIUM: OAuth callback swallows upsertBusiness failures
**File:** `app/api/auth/callback/google/route.ts`
- Don't swallow the error — if upsert fails, log it and still proceed with auth (since the user authenticated), but set a flag or log prominently

## Constraints
- Run `npm run build` to verify
- Commit as `fix(security): address codex review HIGH/MEDIUM findings`
- Push to feat/phase7-app-integration branch
