-- Consolidate RLS: replace broad "owner write (for all)" with action-specific owner modify policies
-- and remove duplicate "select" policies. Safe to run multiple times.

-- Helper: drop policy if exists by name
-- (Postgres requires explicit policy name and table)

-- =============================
-- ARTICLE_BOOKMARKS
-- =============================
alter table if exists public.article_bookmarks enable row level security;
-- Drop broad/duplicate policies
drop policy if exists "Article bookmarks owner write" on public.article_bookmarks;
drop policy if exists "Article bookmarks: insert own" on public.article_bookmarks;
drop policy if exists "Article bookmarks: delete own" on public.article_bookmarks;
drop policy if exists "Article bookmarks: select own" on public.article_bookmarks;
-- Ensure single public read policy
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='article_bookmarks' and policyname='Article bookmarks public read'
  ) then
    create policy "Article bookmarks public read" on public.article_bookmarks for select using (true);
  end if;
end $$;
-- Create owner-only modify (I/U/D)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='article_bookmarks' and policyname='Article bookmarks owner modify'
  ) then
    create policy "Article bookmarks owner modify" on public.article_bookmarks
      for insert with check ((select auth.uid()) = user_id);
    create policy "Article bookmarks owner update" on public.article_bookmarks
      for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
    create policy "Article bookmarks owner delete" on public.article_bookmarks
      for delete using ((select auth.uid()) = user_id);
  end if;
end $$;

-- =============================
-- ARTICLE_LIKES
-- =============================
alter table if exists public.article_likes enable row level security;
drop policy if exists "Article likes owner write" on public.article_likes;
drop policy if exists "ArticleLikes: user insert own" on public.article_likes;
drop policy if exists "ArticleLikes: user delete own" on public.article_likes;
drop policy if exists "ArticleLikes: public read" on public.article_likes;
-- Keep exactly one public read
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='article_likes' and policyname='Article likes public read'
  ) then
    create policy "Article likes public read" on public.article_likes for select using (true);
  end if;
end $$;
-- Owner modify
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='article_likes' and policyname='Article likes owner insert'
  ) then
    create policy "Article likes owner insert" on public.article_likes for insert with check ((select auth.uid()) = user_id);
    create policy "Article likes owner delete" on public.article_likes for delete using ((select auth.uid()) = user_id);
  end if;
end $$;

-- =============================
-- ARTICLE_COMMENTS
-- =============================
alter table if exists public.article_comments enable row level security;
drop policy if exists "Article comments owner write" on public.article_comments;
drop policy if exists "Article comments: insert own" on public.article_comments;
drop policy if exists "Article comments: update own" on public.article_comments;
drop policy if exists "Article comments: delete own" on public.article_comments;
drop policy if exists "Article comments: public read" on public.article_comments;
-- Single public read
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='article_comments' and policyname='Article comments public read'
  ) then
    create policy "Article comments public read" on public.article_comments for select using (true);
  end if;
end $$;
-- Owner modify
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='article_comments' and policyname='Article comments owner insert'
  ) then
    create policy "Article comments owner insert" on public.article_comments for insert with check ((select auth.uid()) = user_id);
    create policy "Article comments owner update" on public.article_comments for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
    create policy "Article comments owner delete" on public.article_comments for delete using ((select auth.uid()) = user_id);
  end if;
end $$;

-- =============================
-- COMMUNITY_STORY_COMMENTS
-- =============================
alter table if exists public.community_story_comments enable row level security;
drop policy if exists "Story comments owner write" on public.community_story_comments;
drop policy if exists community_comments_insert on public.community_story_comments;
drop policy if exists community_comments_update_own on public.community_story_comments;
drop policy if exists community_comments_delete_own on public.community_story_comments;
drop policy if exists community_comments_read_all on public.community_story_comments;
-- Single public read
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='community_story_comments' and policyname='Story comments public read'
  ) then
    create policy "Story comments public read" on public.community_story_comments for select using (true);
  end if;
end $$;
-- Owner modify
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='community_story_comments' and policyname='Story comments owner insert'
  ) then
    create policy "Story comments owner insert" on public.community_story_comments for insert with check ((select auth.uid()) = user_id);
    create policy "Story comments owner update" on public.community_story_comments for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
    create policy "Story comments owner delete" on public.community_story_comments for delete using ((select auth.uid()) = user_id);
  end if;
end $$;

-- =============================
-- USERS_PROFILES
-- =============================
alter table if exists public.users_profiles enable row level security;
drop policy if exists "Profiles owner write" on public.users_profiles;
drop policy if exists "Users can insert own profile" on public.users_profiles;
drop policy if exists "Users can update own profile" on public.users_profiles;
drop policy if exists users_update_own_profile on public.users_profiles;
drop policy if exists "Users can view all profiles" on public.users_profiles;
-- Public read (one)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='users_profiles' and policyname='Profiles public read'
  ) then
    create policy "Profiles public read" on public.users_profiles for select using (true);
  end if;
end $$;
-- Owner modify (insert/update); delete optional
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='users_profiles' and policyname='Profiles owner insert'
  ) then
    create policy "Profiles owner insert" on public.users_profiles for insert with check ((select auth.uid()) = id);
    create policy "Profiles owner update" on public.users_profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
  end if;
end $$;

-- =============================
-- NOTIFICATIONS
-- =============================
alter table if exists public.notifications enable row level security;
drop policy if exists "Notifications owner write" on public.notifications; -- broad
drop policy if exists notifications_insert_self on public.notifications;
drop policy if exists notifications_update_self on public.notifications;
drop policy if exists notifications_select_self on public.notifications;
-- Owner read (select)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='Notifications owner read'
  ) then
    create policy "Notifications owner read" on public.notifications for select using ((select auth.uid()) = user_id);
  end if;
end $$;
-- Owner modify (insert/update)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='Notifications owner insert'
  ) then
    create policy "Notifications owner insert" on public.notifications for insert with check ((select auth.uid()) = user_id);
    create policy "Notifications owner update" on public.notifications for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
  end if;
end $$;

-- =============================
-- STORY_LIKES (if exists)
-- =============================
alter table if exists public.story_likes enable row level security;
drop policy if exists "StoryLikes: user manage own" on public.story_likes;
drop policy if exists select_all_likes on public.story_likes;
drop policy if exists insert_own_like on public.story_likes;
-- Keep one public read
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='story_likes' and policyname='StoryLikes: public read'
  ) then
    create policy "StoryLikes: public read" on public.story_likes for select using (true);
  end if;
end $$;
-- Owner insert/delete
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='story_likes' and policyname='StoryLikes: owner insert'
  ) then
    create policy "StoryLikes: owner insert" on public.story_likes for insert with check ((select auth.uid()) = user_id);
    create policy "StoryLikes: owner delete" on public.story_likes for delete using ((select auth.uid()) = user_id);
  end if;
end $$;

-- =============================
-- ARTICLE_TAGS / CATEGORIES / COUNTRIES / TAGS (select-only consolidation)
-- =============================
-- ARTICLE_TAGS
alter table if exists public.article_tags enable row level security;
drop policy if exists "ArticleTags: admin write" on public.article_tags;
-- keep single public read
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='article_tags' and policyname='ArticleTags: public read'
  ) then
    create policy "ArticleTags: public read" on public.article_tags for select using (true);
  end if;
end $$;

-- CATEGORIES
alter table if exists public.categories enable row level security;
drop policy if exists "Categories: admin write" on public.categories;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='Categories: public read'
  ) then
    create policy "Categories: public read" on public.categories for select using (coalesce(is_active,true));
  end if;
end $$;

-- COUNTRIES
alter table if exists public.countries enable row level security;
drop policy if exists "Countries: admin manage" on public.countries;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='countries' and policyname='Countries: public read active'
  ) then
    create policy "Countries: public read active" on public.countries for select using (coalesce(is_active,true));
  end if;
end $$;

-- TAGS
alter table if exists public.tags enable row level security;
drop policy if exists "Tags: admin write" on public.tags;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='tags' and policyname='Tags: public read'
  ) then
    create policy "Tags: public read" on public.tags for select using (true);
  end if;
end $$;

-- =============================
-- USER_STORIES (consolidate to single policy per action)
-- =============================
alter table if exists public.user_stories enable row level security;
-- drop broad/overlapping
drop policy if exists "Stories owner write" on public.user_stories;
drop policy if exists "Stories: admin manage" on public.user_stories;
drop policy if exists "Stories: admin moderate" on public.user_stories;
drop policy if exists "Stories: user insert own" on public.user_stories;
drop policy if exists "Stories: user update own" on public.user_stories;
drop policy if exists "Stories: user delete own" on public.user_stories;
drop policy if exists "Stories public read" on public.user_stories;
drop policy if exists "Stories: public read approved_or_featured" on public.user_stories;

-- single public read (approved or featured)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_stories' and policyname='Stories: public read approved_or_featured'
  ) then
    create policy "Stories: public read approved_or_featured" on public.user_stories
      for select using (status in ('approved','featured'));
  end if;
end $$;

-- helper predicate: owner or admin
-- INSERT
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_stories' and policyname='Stories owner/admin insert'
  ) then
    create policy "Stories owner/admin insert" on public.user_stories
      for insert with check (
        (select auth.uid()) = user_id or exists (select 1 from public.users_profiles p where p.id = (select auth.uid()) and p.role = 'admin')
      );
  end if;
end $$;

-- UPDATE
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_stories' and policyname='Stories owner/admin update'
  ) then
    create policy "Stories owner/admin update" on public.user_stories
      for update using (
        (select auth.uid()) = user_id or exists (select 1 from public.users_profiles p where p.id = (select auth.uid()) and p.role = 'admin')
      ) with check (
        (select auth.uid()) = user_id or exists (select 1 from public.users_profiles p where p.id = (select auth.uid()) and p.role = 'admin')
      );
  end if;
end $$;

-- DELETE
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_stories' and policyname='Stories owner/admin delete'
  ) then
    create policy "Stories owner/admin delete" on public.user_stories
      for delete using (
        (select auth.uid()) = user_id or exists (select 1 from public.users_profiles p where p.id = (select auth.uid()) and p.role = 'admin')
      );
  end if;
end $$;

