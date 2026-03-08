-- Phase 7: add business profile columns to existing businesses table
alter table businesses
  add column if not exists business_type text,
  add column if not exists voice_tone text,
  add column if not exists custom_instructions text,
  add column if not exists notifications_enabled boolean not null default true,
  add column if not exists notification_email text;
