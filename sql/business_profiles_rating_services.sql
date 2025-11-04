-- Add rating and services fields to business_profiles
-- Safe to run multiple times (IF NOT EXISTS)

-- Add services field (array of service names/descriptions)
alter table if exists public.business_profiles
  add column if not exists services jsonb default '[]'::jsonb 
  check (jsonb_typeof(services) = 'array');

-- Add average_rating field (computed from reviews, can be updated via trigger)
alter table if exists public.business_profiles
  add column if not exists average_rating numeric(3,2) default null 
  check (average_rating is null or (average_rating >= 0 and average_rating <= 5));

-- Add total_reviews count
alter table if exists public.business_profiles
  add column if not exists total_reviews integer default 0
  check (total_reviews >= 0);

-- Create index for filtering by rating
create index if not exists idx_business_profiles_rating 
  on public.business_profiles(average_rating) where average_rating is not null;

-- Comments for documentation
comment on column public.business_profiles.services is 'Array of services offered by the business (e.g., ["WiFi", "Parking", "Restaurant"])';
comment on column public.business_profiles.average_rating is 'Average rating from approved reviews (1-5 scale, 2 decimal places)';
comment on column public.business_profiles.total_reviews is 'Total number of approved reviews';

-- Function to update business rating stats when reviews change
create or replace function public.update_business_rating_stats()
returns trigger language plpgsql as $$
begin
  -- Update the business profile's rating stats based on approved reviews
  update public.business_profiles
  set 
    average_rating = (
      select round(avg(rating)::numeric, 2)
      from public.business_reviews
      where business_id = coalesce(new.business_id, old.business_id)
        and status = 'approved'
    ),
    total_reviews = (
      select count(*)
      from public.business_reviews
      where business_id = coalesce(new.business_id, old.business_id)
        and status = 'approved'
    )
  where id = coalesce(new.business_id, old.business_id);
  
  return coalesce(new, old);
end $$;

-- Trigger to auto-update rating stats when reviews are inserted/updated/deleted
drop trigger if exists trg_update_business_rating_stats on public.business_reviews;
create trigger trg_update_business_rating_stats
after insert or update or delete on public.business_reviews
for each row execute function public.update_business_rating_stats();

-- Initialize existing business profiles with current rating stats
update public.business_profiles bp
set 
  average_rating = (
    select round(avg(rating)::numeric, 2)
    from public.business_reviews br
    where br.business_id = bp.id and br.status = 'approved'
  ),
  total_reviews = (
    select count(*)
    from public.business_reviews br
    where br.business_id = bp.id and br.status = 'approved'
  )
where exists (
  select 1 from public.business_reviews br
  where br.business_id = bp.id and br.status = 'approved'
);

