# Phase 8 — Payments (Stripe)

## Goal
Add Stripe billing with a 14-day free trial. Three pricing tiers. Test mode only for now.

## Pricing Tiers
| Plan | Price | Features |
|------|-------|----------|
| Starter | $29/mo | 1 location, 50 reviews/mo, email notifications |
| Growth | $79/mo | 3 locations, unlimited reviews, priority AI responses, analytics |
| Scale | $199/mo | 10 locations, unlimited reviews, custom brand voice, dedicated support, API access |

All plans include a 14-day free trial.

## Tasks

### 1. Install Stripe
```bash
npm install stripe @stripe/stripe-js
```

### 2. Pricing Page (`app/pricing/page.tsx`)
- Beautiful pricing cards with the three tiers above
- Current plan highlighted if user is logged in
- "Start Free Trial" button on each plan
- Links to Stripe Checkout
- Match ReviewGuard design language
- Add "Pricing" link to both landing page nav and app header

### 3. Stripe Checkout API (`app/api/stripe/checkout/route.ts`)
- Create a Stripe Checkout session with:
  - `mode: 'subscription'`
  - `subscription_data.trial_period_days: 14`
  - The selected price ID
  - `success_url` → `/dashboard?upgraded=true`
  - `cancel_url` → `/pricing`
- Price IDs will come from env vars: `STRIPE_STARTER_PRICE_ID`, `STRIPE_GROWTH_PRICE_ID`, `STRIPE_SCALE_PRICE_ID`
- Requires `STRIPE_SECRET_KEY` env var

### 4. Stripe Webhook (`app/api/stripe/webhook/route.ts`)
- Handle `checkout.session.completed` → update `businesses` table with `stripe_customer_id`, `plan`, `trial_ends_at`
- Handle `customer.subscription.updated` → update plan status
- Handle `customer.subscription.deleted` → downgrade to free
- Verify webhook signature with `STRIPE_WEBHOOK_SECRET`
- Export config to disable body parsing: `export const config = { api: { bodyParser: false } }` — actually for App Router, use `export const runtime = 'nodejs'` and read raw body

### 5. Billing Settings (`app/settings/billing/page.tsx`)
- Show current plan, trial status, next billing date
- "Manage Subscription" button → Stripe Customer Portal
- Add Stripe portal API route (`app/api/stripe/portal/route.ts`)

### 6. Plan Gate Middleware
- Create `lib/plans.ts` with plan limits:
  - `canAddLocation(plan, currentCount): boolean`
  - `getReviewLimit(plan): number`
  - `isPlanActive(business): boolean` (checks trial or active subscription)
- Don't enforce yet (we're in beta), but wire up the functions so we can flip the switch later

### 7. Update Supabase Schema
- Add to `businesses` table: `stripe_customer_id`, `stripe_subscription_id`, `plan` (text, default 'free'), `trial_ends_at` (timestamptz)
- Create migration file at `supabase/migrations/add_stripe_columns.sql`

## Env Vars Needed
- `STRIPE_SECRET_KEY` — Stripe test mode secret key
- `STRIPE_WEBHOOK_SECRET` — webhook endpoint signing secret  
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — test mode publishable key
- `STRIPE_STARTER_PRICE_ID`, `STRIPE_GROWTH_PRICE_ID`, `STRIPE_SCALE_PRICE_ID`

## Constraints
- ALL Stripe in TEST MODE — no real charges
- Gracefully handle missing Stripe env vars (show pricing but disable checkout buttons)
- Do NOT break existing auth, email, or approval flows
- Mobile-friendly pricing page
- Run `npm run build` to verify before committing
- Commit with conventional commits, push, and create a PR to main
