# Phase 5 — Google Business API (Real Reviews)

## Goal
Pull real Google reviews for a business, store them in Supabase, poll for new ones, and post approved responses back via the API.

## Context
- OAuth already stores `google_access_token` and `google_refresh_token` in `businesses` table
- Dashboard currently shows mock data from `lib/mockData.ts`
- AI response drafting (Claude Haiku) already works in Phase 3
- Email notification + approval flow already built (Phases 4 & 6)
- Test business: "Tony's Test Pizzeria", location ID: `03875586928425881301`
- The Google Business Profile API (My Business) uses the Account/Location model
- Business is not yet publicly verified but API access should still work

## Google Business Profile API

### Key Endpoints
- `GET https://mybusinessbusinessinformation.googleapis.com/v1/accounts` — list accounts
- `GET https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations` — list locations
- `GET https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews` — list reviews
- `POST https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply` — post reply

### OAuth Scope
The OAuth flow needs `https://www.googleapis.com/auth/business.manage` scope.

## Tasks

### 1. Update OAuth Scope
**File:** `app/api/auth/google/route.ts`
- Add `https://www.googleapis.com/auth/business.manage` to the OAuth scope
- Keep existing scopes (email, profile)

### 2. Token Refresh Helper
**File:** `lib/google.ts` (new)
- `refreshAccessToken(refreshToken: string): Promise<string>` — uses OAuth2 token endpoint
- `getValidAccessToken(business: Business): Promise<string>` — checks if token is expired, refreshes if needed, updates DB
- For MVP: always try the stored token first, refresh on 401

### 3. Google Business API Client
**File:** `lib/google.ts`
- `listAccounts(accessToken: string): Promise<Account[]>`
- `listLocations(accessToken: string, accountId: string): Promise<Location[]>`
- `listReviews(accessToken: string, accountId: string, locationId: string): Promise<Review[]>`
- `replyToReview(accessToken: string, accountId: string, locationId: string, reviewId: string, comment: string): Promise<void>`
- Handle pagination for reviews (nextPageToken)
- Handle API errors gracefully

### 4. Review Sync Job
**File:** `app/api/reviews/sync/route.ts` (new)
- POST endpoint (called by cron or manually from dashboard)
- For a given business: fetch all reviews from Google, upsert into Supabase `reviews` table
- New reviews (not seen before) trigger email notification via `/api/send-notification`
- Auto-generate AI draft response for new reviews using existing `/api/draft-response` endpoint
- Store `google_review_id` to track which reviews we've seen

### 5. Supabase Schema Updates
**File:** `supabase/migrations/add_google_review_fields.sql` (new)
- Add to `reviews` table: `google_review_id` (text, unique), `google_account_id` (text), `google_location_id` (text), `business_id` (uuid, FK to businesses)
- If `reviews` table doesn't exist yet, create it with all needed columns:
  - id (uuid, PK), business_id (uuid, FK), google_review_id (text, unique), reviewer_name (text), rating (int), review_text (text), review_date (timestamptz), drafted_response (text), response_status (text, default 'pending'), google_account_id (text), google_location_id (text), created_at (timestamptz)

### 6. Post Approved Response
**File:** `app/api/reviews/reply/route.ts` (new)
- POST endpoint: takes `reviewId` and `response_text`
- Fetches the review from Supabase to get google IDs
- Calls `replyToReview` to post to Google
- Updates review status to `responded` in Supabase
- Requires auth (session check)

### 7. Update Dashboard to Use Real Data
**File:** `components/DashboardContent.tsx`
- Fetch reviews from Supabase instead of mock data
- Keep mock data as fallback when no real reviews exist
- Add "Sync Reviews" button that calls `/api/reviews/sync`
- Show sync status/last synced time
- When approving a response, also call `/api/reviews/reply` to post to Google

### 8. Update Review Card
**File:** `components/ReviewCard.tsx`
- Add "Post to Google" button for approved responses that haven't been posted yet
- Show status: pending → drafted → approved → responded (posted to Google)

### 9. Settings: Connected Google Account
**File:** `components/SettingsContent.tsx`
- Show connected Google Business Profile info (account name, location)
- Add "Reconnect" button if token is stale
- Show location selection if multiple locations found

### 10. Location Setup
**File:** `app/api/business/locations/route.ts` (new)
- GET: list available Google Business locations for the authenticated user
- POST: save selected location ID to businesses table
- Add `google_location_id` and `google_account_id` to businesses table

## Environment Variables
- No new env vars needed — uses existing Google OAuth credentials
- Location ID can be stored per-business in DB

## Constraints
- Handle token expiry gracefully (refresh + retry once)
- Handle API rate limits (Google allows ~60 req/min for GBP API)
- Handle unverified businesses (API may return limited data)
- Do NOT break existing mock/demo mode — if no Google connection, show mock data
- Run `npm run build` to verify
- Commit with conventional commits, push, create PR to main
- Apply CSRF check on all new POST endpoints
