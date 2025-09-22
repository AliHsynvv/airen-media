-- Profile performance optimizations: RPC, indexes, and optional counters

-- 1) RPC: get_profile_payload
create or replace function public.get_profile_payload(p_user uuid)
returns jsonb
language sql
stable
as $$
with
  prof as (
    select full_name, username, avatar_url, bio
    from users_profiles
    where id = p_user
  ),
  stories as (
    select id, title, slug, status, created_at, image_url
    from user_stories
    where user_id = p_user
    order by created_at desc
    limit 12
  ),
  followers as (
    select count(*)::int as ct from user_follows where following_id = p_user
  ),
  following as (
    select count(*)::int as ct from user_follows where follower_id = p_user
  )
select jsonb_build_object(
  'profile', (select to_jsonb(prof) from prof),
  'stories', (select coalesce(jsonb_agg(stories), '[]'::jsonb) from stories),
  'followers', (select ct from followers),
  'following', (select ct from following)
);
$$;

-- 2) Helpful indexes for common filters/orders
create index if not exists idx_user_stories_user_status_created
  on public.user_stories (user_id, status, created_at desc);

create index if not exists idx_notifications_user_read
  on public.notifications (user_id, is_read)
  where is_read = false;

create index if not exists idx_user_follows_following
  on public.user_follows (following_id);

create index if not exists idx_user_follows_follower
  on public.user_follows (follower_id);

create index if not exists idx_article_bookmarks_user
  on public.article_bookmarks (user_id, article_id);

create index if not exists idx_article_likes_user
  on public.article_likes (user_id, article_id);

create index if not exists idx_article_comments_user_created
  on public.article_comments (user_id, created_at desc);

create index if not exists idx_article_comments_article
  on public.article_comments (article_id);

create index if not exists idx_country_bookmarks_user
  on public.country_bookmarks (user_id, country_id);

create index if not exists idx_country_favorites_user
  on public.country_favorites (user_id, country_id);

create index if not exists idx_country_reviews_user_created
  on public.country_reviews (user_id, created_at desc);

create index if not exists idx_country_reviews_country
  on public.country_reviews (country_id);

-- 3) Optional: denormalized counters on users_profiles
-- Adds columns
alter table public.users_profiles
  add column if not exists followers_count integer default 0 not null,
  add column if not exists following_count integer default 0 not null;

-- Triggers to keep counts in sync
create or replace function public.trg_user_follows_update_counts()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.users_profiles set followers_count = followers_count + 1 where id = new.following_id;
    update public.users_profiles set following_count = following_count + 1 where id = new.follower_id;
  elsif tg_op = 'DELETE' then
    update public.users_profiles set followers_count = greatest(0, followers_count - 1) where id = old.following_id;
    update public.users_profiles set following_count = greatest(0, following_count - 1) where id = old.follower_id;
  end if;
  return null;
end$$;

drop trigger if exists trg_user_follows_counts_ins on public.user_follows;
drop trigger if exists trg_user_follows_counts_del on public.user_follows;

create trigger trg_user_follows_counts_ins
after insert on public.user_follows
for each row execute function public.trg_user_follows_update_counts();

create trigger trg_user_follows_counts_del
after delete on public.user_follows
for each row execute function public.trg_user_follows_update_counts();

-- Backfill counts once (idempotent)
update public.users_profiles up
set followers_count = sub.ct
from (
  select following_id as id, count(*)::int as ct
  from public.user_follows
  group by following_id
) sub
where up.id = sub.id;

update public.users_profiles up
set following_count = sub.ct
from (
  select follower_id as id, count(*)::int as ct
  from public.user_follows
  group by follower_id
) sub
where up.id = sub.id;


