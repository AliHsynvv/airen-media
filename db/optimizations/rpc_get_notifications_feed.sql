-- Create RPC to fetch enriched notifications in a single call
-- Safe via RLS (security invoker). Returns notifications for the current user only.

create or replace function public.get_notifications_feed(
  p_user uuid,
  p_limit integer default 100
)
returns table (
  id uuid,
  type text,
  payload jsonb,
  created_at timestamptz,
  is_read boolean,
  liker jsonb,
  actor jsonb,
  story jsonb,
  comment jsonb
)
language sql
as $$
  with base as (
    select n.id, n.type, n.payload, n.created_at, n.is_read
    from public.notifications n
    where n.user_id = p_user
    order by n.created_at desc
    limit coalesce(p_limit, 100)
  ),
  liker as (
    select b.id,
           jsonb_build_object('id', up.id, 'full_name', up.full_name, 'username', up.username, 'avatar_url', up.avatar_url) as liker
    from base b
    join public.users_profiles up on up.id = (b.payload->>'liker_id')::uuid
    where b.payload ? 'liker_id'
  ),
  actor as (
    select b.id,
           jsonb_build_object('id', up.id, 'full_name', up.full_name, 'username', up.username, 'avatar_url', up.avatar_url) as actor
    from base b
    join public.users_profiles up on up.id = coalesce((b.payload->>'actor_id')::uuid, (b.payload->>'follower_id')::uuid)
    where (b.payload ? 'actor_id') or (b.payload ? 'follower_id')
  ),
  story as (
    select b.id,
           jsonb_build_object('id', s.id, 'slug', s.slug, 'title', s.title) as story
    from base b
    join public.user_stories s on s.id = (b.payload->>'story_id')::uuid
    where b.payload ? 'story_id'
  ),
  comment as (
    select b.id,
           jsonb_build_object('id', c.id, 'content', c.content) as comment
    from base b
    join public.community_story_comments c on c.id = (b.payload->>'comment_id')::uuid
    where b.payload ? 'comment_id'
  )
  select b.id, b.type, b.payload, b.created_at, b.is_read,
         l.liker, a.actor, s.story, c.comment
  from base b
  left join liker l using(id)
  left join actor a using(id)
  left join story s using(id)
  left join comment c using(id)
  order by b.created_at desc;
$$;


