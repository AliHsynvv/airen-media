-- Follows table
create table if not exists public.user_follows (
  follower_id uuid not null references public.users_profiles(id) on delete cascade,
  following_id uuid not null references public.users_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table public.user_follows enable row level security;

-- Anyone can read follow relationships (for counts and UI)
create policy user_follows_select_public
on public.user_follows for select
to anon, authenticated using (true);

-- Only the authenticated user can follow on their own behalf
create policy user_follows_insert_self
on public.user_follows for insert
to authenticated
with check (auth.uid() = follower_id);

-- Only the follower can unfollow
create policy user_follows_delete_self
on public.user_follows for delete
to authenticated
using (auth.uid() = follower_id);

grant select on public.user_follows to anon, authenticated;
grant insert, delete on public.user_follows to authenticated;


