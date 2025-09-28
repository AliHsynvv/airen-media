-- Basic RLS policies for key tables
-- Adjust schema/table names if different in your project

-- ARTICLES (public read, only admins write if you enforce via auth role)
alter table if exists public.articles enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'articles' and policyname = 'Articles public read'
  ) then
    create policy "Articles public read" on public.articles
      for select using (true);
  end if;
end $$;

-- USER_STORIES (public read; owner can insert/update/delete)
alter table if exists public.user_stories enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_stories' and policyname = 'Stories public read'
  ) then
    create policy "Stories public read" on public.user_stories for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_stories' and policyname = 'Stories owner write'
  ) then
    create policy "Stories owner write" on public.user_stories
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- ARTICLE_LIKES (public read; owner write)
alter table if exists public.article_likes enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'article_likes' and policyname = 'Article likes public read'
  ) then
    create policy "Article likes public read" on public.article_likes for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'article_likes' and policyname = 'Article likes owner write'
  ) then
    create policy "Article likes owner write" on public.article_likes
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- ARTICLE_BOOKMARKS (public read; owner write)
alter table if exists public.article_bookmarks enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'article_bookmarks' and policyname = 'Article bookmarks public read'
  ) then
    create policy "Article bookmarks public read" on public.article_bookmarks for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'article_bookmarks' and policyname = 'Article bookmarks owner write'
  ) then
    create policy "Article bookmarks owner write" on public.article_bookmarks
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- ARTICLE_COMMENTS (public read; owner write)
alter table if exists public.article_comments enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'article_comments' and policyname = 'Article comments public read'
  ) then
    create policy "Article comments public read" on public.article_comments for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'article_comments' and policyname = 'Article comments owner write'
  ) then
    create policy "Article comments owner write" on public.article_comments
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- COMMUNITY_STORY_COMMENTS (public read; owner write)
alter table if exists public.community_story_comments enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'community_story_comments' and policyname = 'Story comments public read'
  ) then
    create policy "Story comments public read" on public.community_story_comments for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'community_story_comments' and policyname = 'Story comments owner write'
  ) then
    create policy "Story comments owner write" on public.community_story_comments
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- USERS_PROFILES (public read; owner write)
alter table if exists public.users_profiles enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'users_profiles' and policyname = 'Profiles public read'
  ) then
    create policy "Profiles public read" on public.users_profiles for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'users_profiles' and policyname = 'Profiles owner write'
  ) then
    create policy "Profiles owner write" on public.users_profiles
      for all using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end $$;

-- NOTIFICATIONS (owner read/write)
alter table if exists public.notifications enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'Notifications owner read'
  ) then
    create policy "Notifications owner read" on public.notifications for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'Notifications owner write'
  ) then
    create policy "Notifications owner write" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;


