# Phase 2 Brief — Review Engine + OAuth

## What to Build

### 1. Google OAuth Flow
- NextAuth.js (or similar) for Google OAuth
- Scope: `https://www.googleapis.com/auth/business.manage`
- Callback: `/api/auth/callback/google`
- Store OAuth tokens in Supabase (new `businesses` table)
- Simple "Connect Your Google Business" page at `/dashboard`

### 2. Database Schema (Supabase)
Create these tables:

```sql
-- Businesses table
create table businesses (
  id uuid default gen_random_uuid() primary key,
  owner_email text not null,
  business_name text,
  google_account_id text,
  google_access_token text,
  google_refresh_token text,
  brand_voice text default 'professional and friendly',
  created_at timestamptz default now()
);

-- Reviews table  
create table reviews (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id),
  platform text not null default 'google',
  reviewer_name text,
  rating integer,
  review_text text,
  review_date timestamptz,
  platform_review_id text unique,
  drafted_response text,
  final_response text,
  response_status text default 'pending', -- pending, drafted, approved, sent
  created_at timestamptz default now()
);
```

Enable RLS on both tables.

### 3. Review Response Drafting
- Create `/api/draft-response` endpoint
- Takes a review (text, rating, reviewer name) + brand voice
- Uses Anthropic Claude API to generate a response
- Tone guidelines:
  - 5-star: warm thank you, specific callback to what they mentioned
  - 4-star: thank + acknowledge any concerns
  - 3-star: empathetic, address concerns, invite them back
  - 1-2 star: professional, apologetic, offer to make it right, take offline

### 4. Mock Data for Testing
Create 5-6 sample reviews (mix of ratings) for a fake restaurant "Tony's Pizzeria" so we can test the full flow without needing real Google API access yet.

### 5. Simple Dashboard Page (`/dashboard`)
- If not connected: show "Connect Google Business" button
- If connected: show list of recent reviews with draft responses
- Each review card shows: rating (stars), reviewer name, review text, drafted response, approve/edit buttons
- Keep it simple — no fancy charts yet

## Tech Notes
- Use NextAuth.js for OAuth (`next-auth` package)
- Anthropic SDK for Claude API (`@anthropic-ai/sdk`)
- All env vars are already set in .env.local and Vercel
- Supabase client already configured
- DO NOT touch the landing page — it's shipped and approved

## Environment Variables Available
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY  
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- ANTHROPIC_API_KEY (need to add this — use process.env, will add separately)
