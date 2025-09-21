-- Comment likes
create table if not exists public.community_comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.community_story_comments(id) on delete cascade,
  user_id uuid not null references public.users_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

alter table public.community_comment_likes enable row level security;

drop policy if exists comment_likes_select_public on public.community_comment_likes;
create policy comment_likes_select_public
on public.community_comment_likes for select
to anon, authenticated using (true);

drop policy if exists comment_likes_insert_self on public.community_comment_likes;
create policy comment_likes_insert_self
on public.community_comment_likes for insert
to authenticated with check (auth.uid() = user_id);

drop policy if exists comment_likes_delete_self on public.community_comment_likes;
create policy comment_likes_delete_self
on public.community_comment_likes for delete
to authenticated using (auth.uid() = user_id);

grant select on public.community_comment_likes to anon, authenticated;

-- Notifications (simple)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profiles(id) on delete cascade,
  type text not null check (type in ('comment_like','comment_reply','story_like','story_comment','follow')),
  payload jsonb not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Ensure the notifications type constraint allows 'follow' even if table existed before
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'notifications') then
    -- drop existing check constraint(s) on notifications
    perform 1 from pg_constraint where conrelid = 'public.notifications'::regclass and contype = 'c';
    if found then
      execute (
        select string_agg(format('alter table public.notifications drop constraint %I;', conname), '\n')
        from pg_constraint
        where conrelid = 'public.notifications'::regclass and contype = 'c'
      );
    end if;
    -- add back named constraint with the new allowed types
    alter table public.notifications add constraint notifications_type_check check (type in ('comment_like','comment_reply','story_like','story_comment','follow'));
  end if;
exception when undefined_table then
  -- table missing, ignore
  null;
end $$;

alter table public.notifications enable row level security;

drop policy if exists notifications_select_self on public.notifications;
create policy notifications_select_self
on public.notifications for select
to authenticated using (auth.uid() = user_id);

drop policy if exists notifications_update_self on public.notifications;
create policy notifications_update_self
on public.notifications for update
to authenticated using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Insert via RPC or server only; if you want client insert, restrict by payload
drop policy if exists notifications_insert_self on public.notifications;
create policy notifications_insert_self
on public.notifications for insert
to authenticated
with check (
  -- Allow the actor to create a notification for someone else
  (payload ? 'actor_id') and ((payload->>'actor_id')::uuid = auth.uid())
);

grant select, insert, update on public.notifications to authenticated;


