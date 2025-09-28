-- Articles: only admins can INSERT/UPDATE/DELETE, public can SELECT published
-- If you don't have an is_admin flag on users_profiles, create it first:
-- alter table public.users_profiles add column if not exists is_admin boolean not null default false;

alter table if exists public.articles enable row level security;

-- Clean up old, overlapping policies (safe if they don't exist)
drop policy if exists "Articles: admin manage" on public.articles;
drop policy if exists "Articles: author insert" on public.articles;
drop policy if exists "Articles: author update" on public.articles;
drop policy if exists "Articles public read" on public.articles;
drop policy if exists "Articles: public read published" on public.articles;
drop policy if exists "Articles: admin insert" on public.articles;
drop policy if exists "Articles: admin update" on public.articles;
drop policy if exists "Articles: admin delete" on public.articles;

-- Single public read for published content
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='articles' and policyname='Articles: public read published'
  ) then
    create policy "Articles: public read published" on public.articles
      for select using (status = 'published');
  end if;
end $$;

-- Admin means current user has users_profiles.is_admin = true
-- INSERT: only admin
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='articles' and policyname='Articles: admin insert'
  ) then
    create policy "Articles: admin insert" on public.articles
      for insert with check (
        exists (
          select 1 from public.users_profiles p
          where p.id = (select auth.uid()) and p.role = 'admin'
        )
      );
  end if;
end $$;

-- UPDATE: only admin
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='articles' and policyname='Articles: admin update'
  ) then
    create policy "Articles: admin update" on public.articles
      for update using (
        exists (
          select 1 from public.users_profiles p
          where p.id = (select auth.uid()) and p.role = 'admin'
        )
      ) with check (
        exists (
          select 1 from public.users_profiles p
          where p.id = (select auth.uid()) and p.role = 'admin'
        )
      );
  end if;
end $$;

-- DELETE: only admin
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='articles' and policyname='Articles: admin delete'
  ) then
    create policy "Articles: admin delete" on public.articles
      for delete using (
        exists (
          select 1 from public.users_profiles p
          where p.id = (select auth.uid()) and p.role = 'admin'
        )
      );
  end if;
end $$;


