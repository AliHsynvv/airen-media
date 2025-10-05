-- Business Profiles feature schema
-- Safe to run multiple times (IF NOT EXISTS / idempotent drops)

-- =============================
-- CORE: business_profiles
-- =============================
create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users_profiles(id) on delete cascade,
  name text not null,
  category text,
  description text,
  website text,
  email text,
  phone text,
  location text,
  latitude double precision,
  longitude double precision,
  profile_image_url text,
  cover_image_url text,
  social_instagram text,
  social_tiktok text,
  social_facebook text,
  social_youtube text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_business_profiles_owner on public.business_profiles(owner_id);
create index if not exists idx_business_profiles_active on public.business_profiles(is_active);
create index if not exists idx_business_profiles_category on public.business_profiles(category);
create index if not exists idx_business_profiles_location on public.business_profiles(location);

-- updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_business_profiles_updated_at on public.business_profiles;
create trigger trg_business_profiles_updated_at
before update on public.business_profiles
for each row execute function public.tg_set_updated_at();

-- =============================
-- MEDIA: business_media (internal photos/videos)
-- =============================
create table if not exists public.business_media (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  storage_path text not null, -- points to Supabase Storage object path
  url text not null,
  media_type text not null check (media_type in ('image','video')),
  title text,
  description text,
  position int not null default 0, -- for reordering
  created_by uuid not null references public.users_profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_business_media_business on public.business_media(business_id);
create index if not exists idx_business_media_position on public.business_media(business_id, position);

-- =============================
-- POSTS: business_posts (scheduled content)
-- =============================
create table if not exists public.business_posts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  title text not null,
  content text,
  scheduled_at timestamptz,
  published_at timestamptz,
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  created_by uuid not null references public.users_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_business_posts_business on public.business_posts(business_id);
create index if not exists idx_business_posts_status on public.business_posts(status);
create index if not exists idx_business_posts_schedule on public.business_posts(scheduled_at);

drop trigger if exists trg_business_posts_updated_at on public.business_posts;
create trigger trg_business_posts_updated_at
before update on public.business_posts
for each row execute function public.tg_set_updated_at();

-- link post to media (many-to-many with order)
create table if not exists public.business_post_media (
  post_id uuid not null references public.business_posts(id) on delete cascade,
  media_id uuid not null references public.business_media(id) on delete cascade,
  position int not null default 0,
  primary key (post_id, media_id)
);

create index if not exists idx_business_post_media_post on public.business_post_media(post_id, position);

-- =============================
-- REVIEWS: ratings and comments
-- =============================
create table if not exists public.business_reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  user_id uuid not null references public.users_profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_business_reviews_business on public.business_reviews(business_id);
create index if not exists idx_business_reviews_user on public.business_reviews(user_id);
create index if not exists idx_business_reviews_status on public.business_reviews(status);

drop trigger if exists trg_business_reviews_updated_at on public.business_reviews;
create trigger trg_business_reviews_updated_at
before update on public.business_reviews
for each row execute function public.tg_set_updated_at();

-- =============================
-- ANALYTICS: simple events table + daily aggregates view
-- =============================
create table if not exists public.business_analytics_events (
  id bigserial primary key,
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  event_type text not null check (event_type in ('view','click','review','post_engagement')),
  post_id uuid references public.business_posts(id) on delete set null,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists idx_biz_analytics_business on public.business_analytics_events(business_id);
create index if not exists idx_biz_analytics_event_type on public.business_analytics_events(event_type);
create index if not exists idx_biz_analytics_post on public.business_analytics_events(post_id);
create index if not exists idx_biz_analytics_created_at on public.business_analytics_events(created_at);

create or replace view public.business_analytics_daily as
select
  business_id,
  date_trunc('day', created_at) as day,
  sum(case when event_type = 'view' then 1 else 0 end) as views,
  sum(case when event_type = 'click' then 1 else 0 end) as clicks,
  sum(case when event_type = 'review' then 1 else 0 end) as reviews,
  sum(case when event_type = 'post_engagement' then 1 else 0 end) as post_engagements
from public.business_analytics_events
group by business_id, date_trunc('day', created_at);

-- =============================
-- RLS: enable and set policies
-- =============================
alter table if exists public.business_profiles enable row level security;
alter table if exists public.business_media enable row level security;
alter table if exists public.business_posts enable row level security;
alter table if exists public.business_post_media enable row level security;
alter table if exists public.business_reviews enable row level security;
alter table if exists public.business_analytics_events enable row level security;

-- Helper: admin check via users_profiles.role = 'admin'
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.users_profiles p where p.id = uid and p.role = 'admin'
  );
$$;

-- business_profiles
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_profiles' and policyname='Business public read active'
  ) then
    create policy "Business public read active" on public.business_profiles for select using (coalesce(is_active,true));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_profiles' and policyname='Business owner/admin insert'
  ) then
    create policy "Business owner/admin insert" on public.business_profiles
      for insert with check ((select auth.uid()) = owner_id or public.is_admin((select auth.uid())));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_profiles' and policyname='Business owner/admin update'
  ) then
    create policy "Business owner/admin update" on public.business_profiles
      for update using ((select auth.uid()) = owner_id or public.is_admin((select auth.uid())))
      with check ((select auth.uid()) = owner_id or public.is_admin((select auth.uid())));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_profiles' and policyname='Business owner/admin delete'
  ) then
    create policy "Business owner/admin delete" on public.business_profiles
      for delete using ((select auth.uid()) = owner_id or public.is_admin((select auth.uid())));
  end if;
end $$;

-- business_media: owner or admin of the business can manage; public can view urls
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_media' and policyname='Business media public read'
  ) then
    create policy "Business media public read" on public.business_media for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_media' and policyname='Business media owner/admin modify'
  ) then
    create policy "Business media owner/admin insert" on public.business_media
      for insert with check (
        (select auth.uid()) = created_by and (
          exists (select 1 from public.business_profiles b where b.id = business_id and b.owner_id = (select auth.uid()))
          or public.is_admin((select auth.uid()))
        )
      );
    create policy "Business media owner/admin update" on public.business_media
      for update using (
        (select auth.uid()) = created_by or (
          exists (select 1 from public.business_profiles b where b.id = business_id and b.owner_id = (select auth.uid()))
        ) or public.is_admin((select auth.uid()))
      ) with check (
        (select auth.uid()) = created_by or (
          exists (select 1 from public.business_profiles b where b.id = business_id and b.owner_id = (select auth.uid()))
        ) or public.is_admin((select auth.uid()))
      );
    create policy "Business media owner/admin delete" on public.business_media
      for delete using (
        (select auth.uid()) = created_by or (
          exists (select 1 from public.business_profiles b where b.id = business_id and b.owner_id = (select auth.uid()))
        ) or public.is_admin((select auth.uid()))
      );
  end if;
end $$;

-- business_posts and post_media: only owner/admin manage; public read for published
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_posts' and policyname='Business posts public read published'
  ) then
    create policy "Business posts public read published" on public.business_posts for select using (status = 'published');
  end if;
end $$;

-- allow owners/admins to read all their posts (draft/scheduled/published)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_posts' and policyname='Business posts owner/admin read'
  ) then
    create policy "Business posts owner/admin read" on public.business_posts
      for select using (
        (select auth.uid()) = created_by or exists (
          select 1 from public.business_profiles b where b.id = business_id and b.owner_id = (select auth.uid())
        ) or public.is_admin((select auth.uid()))
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_posts' and policyname='Business posts owner/admin modify'
  ) then
    create policy "Business posts owner/admin insert" on public.business_posts
      for insert with check (
        (select auth.uid()) = created_by and (
          exists (select 1 from public.business_profiles b where b.id = business_id and b.owner_id = (select auth.uid()))
          or public.is_admin((select auth.uid()))
        )
      );
    create policy "Business posts owner/admin update" on public.business_posts
      for update using (
        (select auth.uid()) = created_by or (
          exists (select 1 from public.business_profiles b where b.id = business_id and b.owner_id = (select auth.uid()))
        ) or public.is_admin((select auth.uid()))
      ) with check (
        (select auth.uid()) = created_by or (
          exists (select 1 from public.business_profiles b where b.id = business_id and b.owner_id = (select auth.uid()))
        ) or public.is_admin((select auth.uid()))
      );
    create policy "Business posts owner/admin delete" on public.business_posts
      for delete using (
        (select auth.uid()) = created_by or (
          exists (select 1 from public.business_profiles b where b.id = business_id and b.owner_id = (select auth.uid()))
        ) or public.is_admin((select auth.uid()))
      );
  end if;
end $$;

-- post_media: manage by same rule as posts
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_post_media' and policyname='Business post media owner/admin modify'
  ) then
    create policy "Business post media owner/admin insert" on public.business_post_media
      for insert with check (
        exists (
          select 1 from public.business_posts p
          join public.business_profiles b on b.id = p.business_id
          where p.id = post_id and (p.created_by = (select auth.uid()) or b.owner_id = (select auth.uid()) or public.is_admin((select auth.uid())))
        )
      );
    create policy "Business post media owner/admin update" on public.business_post_media
      for update using (
        exists (
          select 1 from public.business_posts p
          join public.business_profiles b on b.id = p.business_id
          where p.id = post_id and (p.created_by = (select auth.uid()) or b.owner_id = (select auth.uid()) or public.is_admin((select auth.uid())))
        )
      ) with check (
        exists (
          select 1 from public.business_posts p
          join public.business_profiles b on b.id = p.business_id
          where p.id = post_id and (p.created_by = (select auth.uid()) or b.owner_id = (select auth.uid()) or public.is_admin((select auth.uid())))
        )
      );
    create policy "Business post media owner/admin delete" on public.business_post_media
      for delete using (
        exists (
          select 1 from public.business_posts p
          join public.business_profiles b on b.id = p.business_id
          where p.id = post_id and (p.created_by = (select auth.uid()) or b.owner_id = (select auth.uid()) or public.is_admin((select auth.uid())))
        )
      );
  end if;
end $$;

-- reviews: public can insert (authenticated), owners/admin can moderate; public read only approved
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_reviews' and policyname='Business reviews public read approved'
  ) then
    create policy "Business reviews public read approved" on public.business_reviews for select using (status = 'approved');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_reviews' and policyname='Business reviews user insert'
  ) then
    create policy "Business reviews user insert" on public.business_reviews
      for insert to authenticated with check ((select auth.uid()) = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_reviews' and policyname='Business reviews owner/admin update'
  ) then
    create policy "Business reviews owner/admin update" on public.business_reviews
      for update using (
        exists (
          select 1 from public.business_profiles b where b.id = business_id and (b.owner_id = (select auth.uid()) or public.is_admin((select auth.uid())))
        )
      ) with check (
        exists (
          select 1 from public.business_profiles b where b.id = business_id and (b.owner_id = (select auth.uid()) or public.is_admin((select auth.uid())))
        )
      );
  end if;
end $$;

-- analytics events: public insert allowed via edge function or server; restrict client to self if needed
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_analytics_events' and policyname='Business analytics select admin/owner'
  ) then
    create policy "Business analytics select admin/owner" on public.business_analytics_events
      for select using (
        public.is_admin((select auth.uid())) or exists (
          select 1 from public.business_profiles b where b.id = business_id and b.owner_id = (select auth.uid())
        )
      );
  end if;
end $$;

-- Optional: allow insert from authenticated (client-side) for basic events
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='business_analytics_events' and policyname='Business analytics insert authenticated'
  ) then
    create policy "Business analytics insert authenticated" on public.business_analytics_events
      for insert to authenticated with check (true);
  end if;
end $$;

-- Grants (keep consistent with existing project style)
grant select on public.business_profiles to anon, authenticated;
grant select on public.business_media to anon, authenticated;
grant select on public.business_posts to anon, authenticated;
grant select on public.business_post_media to anon, authenticated;
grant select on public.business_reviews to anon, authenticated;
grant select on public.business_analytics_events to authenticated;


