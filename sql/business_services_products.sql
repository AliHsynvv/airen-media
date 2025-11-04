-- Business Services/Products System
-- Full-featured product management with category-specific fields and booking capabilities
-- Safe to run multiple times (IF NOT EXISTS)

-- =============================
-- CORE: business_services (products/offerings)
-- =============================
create table if not exists public.business_services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  
  -- Basic info
  name text not null,
  description text,
  category text not null check (category in (
    'rentecar', 'turizm', 'hotel', 'apartment', 'restoran', 
    'xestexana', 'sigorta', 'aviacompany', 'attraction', 'guides'
  )),
  
  -- Pricing
  price numeric(10,2) not null check (price >= 0),
  currency text default 'AZN'::text,
  discount_percentage numeric(5,2) default 0 check (discount_percentage >= 0 and discount_percentage <= 100),
  discounted_price numeric(10,2) generated always as (
    case when discount_percentage > 0 
    then price - (price * discount_percentage / 100)
    else price end
  ) stored,
  
  -- Booking/Availability
  is_bookable boolean default true,
  is_available boolean default true,
  max_capacity integer,
  min_booking_days integer default 1,
  
  -- Images
  image_urls jsonb default '[]'::jsonb,
  
  -- Category-specific fields (JSONB for flexibility)
  -- Each category has its own structure
  category_data jsonb default '{}'::jsonb,
  
  -- Metadata
  created_by uuid not null references public.users_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Search optimization
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) stored
);

create index if not exists idx_business_services_business on public.business_services(business_id);
create index if not exists idx_business_services_category on public.business_services(category);
create index if not exists idx_business_services_available on public.business_services(is_available) where is_available = true;
create index if not exists idx_business_services_bookable on public.business_services(is_bookable) where is_bookable = true;
create index if not exists idx_business_services_search on public.business_services using gin(search_vector);

-- updated_at trigger
drop trigger if exists trg_business_services_updated_at on public.business_services;
create trigger trg_business_services_updated_at
before update on public.business_services
for each row execute function public.tg_set_updated_at();

comment on table public.business_services is 'Products and services offered by businesses with category-specific fields';
comment on column public.business_services.category_data is 'Category-specific fields stored as JSON. Structure varies by category.';

-- Example category_data structures:
-- 
-- RENTECAR: {
--   "vehicle_type": "sedan|suv|luxury|minivan",
--   "brand": "Mercedes",
--   "model": "E-Class",
--   "year": 2023,
--   "seats": 5,
--   "transmission": "automatic|manual",
--   "fuel_type": "petrol|diesel|electric|hybrid",
--   "features": ["GPS", "Child Seat", "Insurance"]
-- }
--
-- HOTEL/APARTMENT: {
--   "room_type": "single|double|suite|apartment",
--   "beds": 2,
--   "bathrooms": 1,
--   "size_sqm": 45,
--   "floor": 3,
--   "view": "sea|city|mountain",
--   "amenities": ["WiFi", "TV", "AC", "Kitchen", "Balcony"]
-- }
--
-- RESTORAN: {
--   "cuisine_type": "azerbaijani|turkish|italian|etc",
--   "meal_type": "breakfast|lunch|dinner|all",
--   "serves": 4,
--   "spicy_level": 0-5,
--   "dietary": ["vegetarian", "halal", "gluten-free"]
-- }
--
-- TURIZM (Tour): {
--   "tour_type": "city|nature|adventure|cultural",
--   "duration_hours": 4,
--   "includes": ["Guide", "Transport", "Meals"],
--   "difficulty": "easy|moderate|hard",
--   "languages": ["az", "en", "ru", "tr"]
-- }
--
-- XESTEXANA (Medical): {
--   "treatment_type": "spa|therapy|checkup|surgery",
--   "duration_days": 7,
--   "doctor_specialty": "cardiology|orthopedics|etc",
--   "includes": ["Consultation", "Tests", "Medication"]
-- }
--
-- SIGORTA (Insurance): {
--   "insurance_type": "travel|health|vehicle|property",
--   "coverage_amount": 50000,
--   "duration_days": 30,
--   "covers": ["Medical", "Luggage", "Cancellation"]
-- }
--
-- AVIACOMPANY: {
--   "flight_type": "domestic|international",
--   "class": "economy|business|first",
--   "baggage_kg": 20,
--   "route": "BAK-IST",
--   "duration_hours": 2.5
-- }
--
-- ATTRACTION: {
--   "attraction_type": "museum|park|monument|entertainment",
--   "duration_hours": 2,
--   "age_restriction": "0+|6+|12+|18+",
--   "includes": ["Guide", "Audio Guide", "Souvenirs"]
-- }
--
-- GUIDES: {
--   "guide_type": "tour|translator|driver",
--   "languages": ["az", "en", "ru"],
--   "experience_years": 5,
--   "specialization": "history|nature|food|adventure",
--   "available_days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
-- }

-- =============================
-- BOOKINGS: service bookings
-- =============================
create table if not exists public.business_service_bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.business_services(id) on delete cascade,
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  user_id uuid not null references public.users_profiles(id) on delete cascade,
  
  -- Booking details
  start_date date not null,
  end_date date,
  guests_count integer default 1 check (guests_count > 0),
  
  -- Pricing snapshot (at time of booking)
  price_per_unit numeric(10,2) not null,
  total_price numeric(10,2) not null,
  currency text default 'AZN'::text,
  
  -- Status
  status text not null default 'pending' check (status in (
    'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
  )),
  
  -- Contact details
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  special_requests text,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz
);

create index if not exists idx_bookings_service on public.business_service_bookings(service_id);
create index if not exists idx_bookings_business on public.business_service_bookings(business_id);
create index if not exists idx_bookings_user on public.business_service_bookings(user_id);
create index if not exists idx_bookings_status on public.business_service_bookings(status);
create index if not exists idx_bookings_dates on public.business_service_bookings(start_date, end_date);

drop trigger if exists trg_bookings_updated_at on public.business_service_bookings;
create trigger trg_bookings_updated_at
before update on public.business_service_bookings
for each row execute function public.tg_set_updated_at();

-- =============================
-- RLS: Row Level Security
-- =============================
alter table if exists public.business_services enable row level security;
alter table if exists public.business_service_bookings enable row level security;

-- business_services: public read, owner/admin manage
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_services' and policyname='Services public read available'
  ) then
    create policy "Services public read available" on public.business_services
      for select using (is_available = true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_services' and policyname='Services owner read all'
  ) then
    create policy "Services owner read all" on public.business_services
      for select using (
        exists (
          select 1 from public.business_profiles b 
          where b.id = business_id and b.owner_id = (select auth.uid())
        ) or public.is_admin((select auth.uid()))
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_services' and policyname='Services owner manage'
  ) then
    create policy "Services owner insert" on public.business_services
      for insert with check (
        (select auth.uid()) = created_by and exists (
          select 1 from public.business_profiles b 
          where b.id = business_id and b.owner_id = (select auth.uid())
        )
      );
    create policy "Services owner update" on public.business_services
      for update using (
        exists (
          select 1 from public.business_profiles b 
          where b.id = business_id and b.owner_id = (select auth.uid())
        ) or public.is_admin((select auth.uid()))
      );
    create policy "Services owner delete" on public.business_services
      for delete using (
        exists (
          select 1 from public.business_profiles b 
          where b.id = business_id and b.owner_id = (select auth.uid())
        ) or public.is_admin((select auth.uid()))
      );
  end if;
end $$;

-- bookings: users can create and view their own, business owners can view all for their services
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_service_bookings' and policyname='Bookings user create'
  ) then
    create policy "Bookings user create" on public.business_service_bookings
      for insert to authenticated with check ((select auth.uid()) = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_service_bookings' and policyname='Bookings user read own'
  ) then
    create policy "Bookings user read own" on public.business_service_bookings
      for select using ((select auth.uid()) = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_service_bookings' and policyname='Bookings business owner read'
  ) then
    create policy "Bookings business owner read" on public.business_service_bookings
      for select using (
        exists (
          select 1 from public.business_profiles b 
          where b.id = business_id and b.owner_id = (select auth.uid())
        ) or public.is_admin((select auth.uid()))
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_service_bookings' and policyname='Bookings business owner update'
  ) then
    create policy "Bookings business owner update" on public.business_service_bookings
      for update using (
        exists (
          select 1 from public.business_profiles b 
          where b.id = business_id and b.owner_id = (select auth.uid())
        ) or public.is_admin((select auth.uid()))
      );
  end if;
end $$;

-- Grants
grant select on public.business_services to anon, authenticated;
grant select on public.business_service_bookings to authenticated;

-- Remove old services column if migrating
-- alter table if exists public.business_profiles drop column if exists services;

