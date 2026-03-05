-- Add Stripe billing columns to businesses table
alter table businesses
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists plan text not null default 'free',
  add column if not exists trial_ends_at timestamptz;
