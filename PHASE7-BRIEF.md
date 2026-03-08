# Phase 7 — Landing Page → Real App Integration

## Goal
Make the landing page and dashboard feel like one cohesive product. Add sign-in navigation, onboarding wizard, and settings page.

## Current State
- Landing page (`app/page.tsx`) has nav with only "Join Beta" button
- Dashboard (`app/dashboard/page.tsx`) has its own nav with sign out
- Auth works via custom Google OAuth (`app/api/auth/google/route.ts`)
- No onboarding — user goes straight to hardcoded "Tony's Pizzeria" mock data
- No settings page

## Tasks

### 1. Update Landing Page Nav
- Add "Sign In" link next to "Join Beta" in the nav bar
- "Sign In" links to `/api/auth/google` (starts OAuth flow)
- If user is already authenticated (check session cookie), show "Dashboard" link instead of "Sign In"
- Keep "Join Beta" as the primary CTA

### 2. Onboarding Wizard (`app/onboarding/page.tsx`)
- After first Google OAuth sign-in, redirect to `/onboarding` instead of `/dashboard`
- Simple 2-step wizard:
  - **Step 1: Business Info** — Business name (text input), Business type dropdown (Restaurant, Salon, Dentist, Auto Shop, Other)
  - **Step 2: Brand Voice** — Select tone for AI responses: Professional, Friendly, Casual. Optional: custom instructions textarea
- Save to Supabase `businesses` table (create if needed with columns: id, user_id, name, type, voice_tone, custom_instructions, created_at)
- After completing wizard, redirect to `/dashboard`
- If user already has a business set up, skip onboarding and go to dashboard

### 3. Settings Page (`app/settings/page.tsx`)
- Accessible from dashboard nav (add "Settings" link/icon)
- Sections:
  - **Business Profile**: Edit business name, type (from onboarding)
  - **Brand Voice**: Edit tone setting and custom instructions
  - **Notifications**: Toggle email notifications on/off, change notification email
  - **Connected Accounts**: Show Google account status (connected via OAuth)
- Save changes to Supabase `businesses` table
- Same design language as dashboard (dark navy header, amber accents)

### 4. Update Dashboard
- Add "Settings" link to the dashboard header nav (gear icon or text)
- Replace hardcoded "Tony's Pizzeria" with the business name from Supabase
- If no business is set up, redirect to `/onboarding`

### 5. Shared Layout Components
- Extract the nav/header into a shared component used by dashboard, settings, and onboarding
- Consistent branding across all authenticated pages

## Database
If the `businesses` table doesn't exist in Supabase, create a migration SQL file at `supabase/migrations/create_businesses.sql` with the schema. The app should gracefully handle the table not existing yet (show mock data).

## Constraints
- Do NOT break existing auth flow
- Do NOT modify the email/approval routes (Phase 4 & 6)
- Mobile-friendly throughout
- Run `npm run build` to verify before committing
- Commit with conventional commits, push, and create a PR to main
