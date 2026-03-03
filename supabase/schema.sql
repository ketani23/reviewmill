-- Businesses table
create table if not exists businesses (
  id uuid default gen_random_uuid() primary key,
  owner_email text not null unique,
  business_name text,
  google_account_id text,
  google_access_token text,
  google_refresh_token text,
  brand_voice text default 'professional and friendly',
  created_at timestamptz default now()
);

-- Reviews table
create table if not exists reviews (
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
  response_status text default 'pending',
  created_at timestamptz default now()
);

-- Enable RLS
alter table businesses enable row level security;
alter table reviews enable row level security;

-- RLS policies: allow server-side anon key to insert/select/update
-- (tighten to authenticated role once you add Supabase Auth integration)
create policy "businesses_insert" on businesses for insert with check (true);
create policy "businesses_select" on businesses for select using (true);
create policy "businesses_update" on businesses for update using (true);

create policy "reviews_all" on reviews for all using (true);
