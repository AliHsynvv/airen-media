-- Drop redundant duplicate indexes reported by Supabase Linter
-- Review before running in production. Safe to run multiple times.

-- ARTICLE LIKES
drop index if exists public.idx_article_likes_article;      -- keep idx_article_likes_article_id
drop index if exists public.idx_article_likes_user;         -- keep idx_article_likes_user_id

-- ARTICLES
drop index if exists public.idx_articles_category;          -- keep idx_articles_category_id

-- COUNTRY BOOKMARKS (linter reported identical pair vs user; keep pair)
drop index if exists public.idx_country_bookmarks_user;     -- keep idx_country_bookmarks_pair

-- COUNTRY FAVORITES (keep pair)
drop index if exists public.idx_country_favorites_user;     -- keep idx_country_favorites_pair

-- COUNTRY REVIEWS
drop index if exists public.idx_country_reviews_country;    -- keep idx_country_reviews_country_id

-- STORY LIKES (duplicate of unique constraint index)
drop index if exists public.idx_story_likes_story_user_unique;       -- keep story_likes_story_id_user_id_key
drop index if exists public.story_likes_story_user_unique;           -- alternate name seen in linter
alter table if exists public.story_likes
  drop constraint if exists story_likes_story_user_unique;           -- drop redundant unique constraint

-- USER STORIES
drop index if exists public.idx_user_stories_status_created;    -- keep idx_user_stories_status_created_at


