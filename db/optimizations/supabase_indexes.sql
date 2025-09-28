-- Performance Indexes for Airen (safe, idempotent)
-- Run in Supabase SQL editor. Requires: pg_trgm extension (for fuzzy search)

-- Enable trigram extension used for ilike searches (no-op if already enabled)
create extension if not exists pg_trgm;

-- =============================
-- ARTICLES
-- =============================
-- List pages: filter by type/status and order by published_at
create index if not exists idx_articles_type_status_published_at
  on public.articles (type, status, published_at desc);

-- Fetch by slug (detail page)
create index if not exists idx_articles_slug
  on public.articles (slug);

-- Related by category
create index if not exists idx_articles_category_id
  on public.articles (category_id);

-- =============================
-- USER_STORIES
-- =============================
-- List pages: filter status and order by created_at
create index if not exists idx_user_stories_status_created_at
  on public.user_stories (status, created_at desc);

-- Detail by slug
create index if not exists idx_user_stories_slug
  on public.user_stories (slug);

-- More posts from same user
create index if not exists idx_user_stories_user_id_created_at
  on public.user_stories (user_id, created_at desc);

-- =============================
-- ARTICLE_LIKES / BOOKMARKS
-- =============================
-- Counting and existence checks
create index if not exists idx_article_likes_article_id
  on public.article_likes (article_id);
create index if not exists idx_article_likes_user_id
  on public.article_likes (user_id);
create index if not exists idx_article_likes_article_user
  on public.article_likes (article_id, user_id);

create index if not exists idx_article_bookmarks_article_id
  on public.article_bookmarks (article_id);
create index if not exists idx_article_bookmarks_user_id
  on public.article_bookmarks (user_id);
create index if not exists idx_article_bookmarks_article_user
  on public.article_bookmarks (article_id, user_id);

-- =============================
-- COMMENTS (Articles / Stories)
-- =============================
create index if not exists idx_article_comments_article_created
  on public.article_comments (article_id, created_at);
create index if not exists idx_article_comments_user
  on public.article_comments (user_id);

create index if not exists idx_community_story_comments_story_created
  on public.community_story_comments (story_id, created_at);
create index if not exists idx_community_story_comments_user
  on public.community_story_comments (user_id);

-- =============================
-- USERS_PROFILES (search popover)
-- =============================
-- Accelerate ilike on username/full_name
create index if not exists idx_users_profiles_username_trgm
  on public.users_profiles using gin (username gin_trgm_ops);
create index if not exists idx_users_profiles_full_name_trgm
  on public.users_profiles using gin (full_name gin_trgm_ops);

-- =============================
-- NOTIFICATIONS (header unread count)
-- =============================
create index if not exists idx_notifications_user_is_read
  on public.notifications (user_id, is_read);

-- =============================
-- COUNTRY_* (lists and reviews)
-- =============================
create index if not exists idx_countries_slug
  on public.countries (slug);

create index if not exists idx_country_reviews_country_id
  on public.country_reviews (country_id);
create index if not exists idx_country_reviews_country_slug
  on public.country_reviews (country_slug);
create index if not exists idx_country_reviews_created_at
  on public.country_reviews (created_at);

-- =============================
-- FOLLOWS / FAVORITES / BOOKMARKS (profile pages)
-- =============================
create index if not exists idx_user_follows_following
  on public.user_follows (following_id);
create index if not exists idx_user_follows_follower
  on public.user_follows (follower_id);
create index if not exists idx_user_follows_pair
  on public.user_follows (follower_id, following_id);

create index if not exists idx_country_bookmarks_user
  on public.country_bookmarks (user_id);
create index if not exists idx_country_bookmarks_country
  on public.country_bookmarks (country_id);
create index if not exists idx_country_bookmarks_pair
  on public.country_bookmarks (user_id, country_id);

create index if not exists idx_country_favorites_user
  on public.country_favorites (user_id);
create index if not exists idx_country_favorites_country
  on public.country_favorites (country_id);
create index if not exists idx_country_favorites_pair
  on public.country_favorites (user_id, country_id);


