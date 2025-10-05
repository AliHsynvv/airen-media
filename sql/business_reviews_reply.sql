-- Allow owners to reply to reviews
alter table if exists public.business_reviews
  add column if not exists owner_reply text,
  add column if not exists owner_reply_at timestamptz;


