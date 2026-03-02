# ReviewMill — Build Brief

## What to Build (Phase 1: Landing Page + Waitlist)

A Next.js landing page for ReviewMill — an AI-powered review monitoring and response service for local businesses.

## Design Direction
- Clean, professional, trustworthy — this is for small business owners, not developers
- Think: Mailchimp or Square marketing pages — friendly, simple, clear value
- Color palette: Deep navy (#1a1a2e) + warm gold (#e8a838) + white
- Mobile-first responsive design

## Page Structure

### Hero Section
- Headline: "Never Miss a Customer Review Again"
- Subhead: "AI monitors your reviews 24/7 and drafts perfect responses in seconds. You just approve."
- CTA: "Join the Beta — Free" → email capture
- Social proof: "Built for local businesses in Bergen County, NJ"

### How It Works (3 steps)
1. "We watch your reviews" — Monitor Google, Yelp, Facebook 24/7
2. "We draft your response" — Professional, on-brand replies in seconds
3. "You approve with one tap" — Review and send from your phone

### Pricing Section
- Monitor & Alert: $29/mo
- Monitor + Draft: $49/mo (POPULAR badge)
- Full Autopilot: $99/mo
- All tiers: "Free during beta"

### FAQ Section
- "How does it work?"
- "Is it safe to connect my business accounts?"
- "What platforms do you support?"
- "Can I edit the responses before they go out?"
- "How is this different from just using ChatGPT?"

### Footer
- "ReviewMill — AI Review Management"
- Email: hello@rook.xyz
- "Powered by Rook AI"

## Email Capture
- Store signups in Supabase
- Fields: business name, owner email, primary platform (Google/Yelp/both)
- Show "You're on the list! We'll reach out soon." confirmation

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Supabase for waitlist storage
- Deploy to Vercel

## Supabase Setup
- Create a `waitlist` table: id, business_name, email, platform, created_at
- Use the Supabase JS client with anon key (RLS enabled, insert-only policy)

## DO NOT
- Don't add authentication
- Don't add Stripe yet (Phase 4)
- Don't build any backend/API beyond the waitlist insert
- Don't use heavy animation libraries
- Keep it simple and fast
