-- Comment likes
create table if not exists public.community_comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.community_story_comments(id) on delete cascade,
  user_id uuid not null references public.users_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

alter table public.community_comment_likes enable row level security;

create policy comment_likes_select_public
on public.community_comment_likes for select
to anon, authenticated using (true);

create policy comment_likes_insert_self
on public.community_comment_likes for insert
to authenticated with check (auth.uid() = user_id);

create policy comment_likes_delete_self
on public.community_comment_likes for delete
to authenticated using (auth.uid() = user_id);

grant select on public.community_comment_likes to anon, authenticated;

-- Notifications (simple)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profiles(id) on delete cascade,
  type text not null check (type in ('comment_like')),
  payload jsonb not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy notifications_select_self
on public.notifications for select
to authenticated using (auth.uid() = user_id);

create policy notifications_update_self
on public.notifications for update
to authenticated using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Insert via RPC or server only; if you want client insert, restrict by payload
create policy notifications_insert_self
on public.notifications for insert
to authenticated with check (auth.uid() = user_id);

grant select, insert, update on public.notifications to authenticated;


