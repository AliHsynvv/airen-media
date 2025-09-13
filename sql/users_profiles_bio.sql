-- Add bio field to users_profiles
  alter table if exists public.users_profiles
    add column if not exists bio text;

-- RLS: assuming 'users_update_own_profile' exists to allow owners to update their profile
-- If not, uncomment below:
-- create policy users_update_own_profile on public.users_profiles
-- for update to authenticated using (id = auth.uid()) with check (id = auth.uid());


