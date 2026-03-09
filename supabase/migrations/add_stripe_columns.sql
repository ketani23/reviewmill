-- Add Stripe billing columns to businesses table
alter table businesses
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists plan text not null default 'free',
  add column if not exists trial_ends_at timestamptz;

-- Ensure one-to-one mapping between Stripe customers and businesses
create unique index if not exists idx_businesses_stripe_customer_id
  on businesses (stripe_customer_id) where stripe_customer_id is not null;
create unique index if not exists idx_businesses_stripe_subscription_id
  on businesses (stripe_subscription_id) where stripe_subscription_id is not null;
