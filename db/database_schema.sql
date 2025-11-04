-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid,
  action character varying NOT NULL,
  resource_type character varying,
  resource_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT admin_activity_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users_profiles(id)
);
CREATE TABLE public.article_bookmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  article_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT article_bookmarks_pkey PRIMARY KEY (id),
  CONSTRAINT article_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT article_bookmarks_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id)
);
CREATE TABLE public.article_comment_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT article_comment_likes_pkey PRIMARY KEY (id),
  CONSTRAINT article_comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.article_comments(id),
  CONSTRAINT article_comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_profiles(id)
);
CREATE TABLE public.article_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  parent_id uuid,
  CONSTRAINT article_comments_pkey PRIMARY KEY (id),
  CONSTRAINT article_comments_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id),
  CONSTRAINT article_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT article_comments_parent_fkey FOREIGN KEY (parent_id) REFERENCES public.article_comments(id)
);
CREATE TABLE public.article_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT article_likes_pkey PRIMARY KEY (id),
  CONSTRAINT article_likes_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id),
  CONSTRAINT article_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_profiles(id)
);
CREATE TABLE public.article_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  article_id uuid,
  tag_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT article_tags_pkey PRIMARY KEY (id),
  CONSTRAINT article_tags_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id),
  CONSTRAINT article_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id)
);
CREATE TABLE public.articles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  featured_image character varying,
  image_alt text,
  category_id uuid,
  author_id uuid NOT NULL,
  status character varying DEFAULT 'draft'::character varying CHECK (status::text = ANY (ARRAY['draft'::character varying, 'published'::character varying, 'archived'::character varying]::text[])),
  type character varying DEFAULT 'article'::character varying CHECK (type::text = ANY (ARRAY['article'::character varying, 'news'::character varying, 'guide'::character varying]::text[])),
  featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  reading_time integer,
  meta_title character varying,
  meta_description character varying,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  translations jsonb DEFAULT '{}'::jsonb,
  default_language character varying DEFAULT 'tr'::character varying,
  CONSTRAINT articles_pkey PRIMARY KEY (id),
  CONSTRAINT articles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users_profiles(id)
);
CREATE TABLE public.business_analytics_events (
  id bigint NOT NULL DEFAULT nextval('business_analytics_events_id_seq'::regclass),
  business_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY['view'::text, 'click'::text, 'review'::text, 'post_engagement'::text])),
  post_id uuid,
  referrer text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT business_analytics_events_pkey PRIMARY KEY (id),
  CONSTRAINT business_analytics_events_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_profiles(id),
  CONSTRAINT business_analytics_events_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.business_posts(id)
);
CREATE TABLE public.business_media (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  storage_path text NOT NULL,
  url text NOT NULL,
  media_type text NOT NULL CHECK (media_type = ANY (ARRAY['image'::text, 'video'::text])),
  title text,
  description text,
  position integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT business_media_pkey PRIMARY KEY (id),
  CONSTRAINT business_media_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_profiles(id),
  CONSTRAINT business_media_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users_profiles(id)
);
CREATE TABLE public.business_post_media (
  post_id uuid NOT NULL,
  media_id uuid NOT NULL,
  position integer NOT NULL DEFAULT 0,
  CONSTRAINT business_post_media_pkey PRIMARY KEY (post_id, media_id),
  CONSTRAINT business_post_media_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.business_media(id),
  CONSTRAINT business_post_media_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.business_posts(id)
);
CREATE TABLE public.business_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  scheduled_at timestamp with time zone,
  published_at timestamp with time zone,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'published'::text, 'archived'::text])),
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT business_posts_pkey PRIMARY KEY (id),
  CONSTRAINT business_posts_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_profiles(id),
  CONSTRAINT business_posts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users_profiles(id)
);
CREATE TABLE public.business_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  category text,
  description text,
  website text,
  email text,
  phone text,
  location text,
  latitude double precision,
  longitude double precision,
  profile_image_url text,
  cover_image_url text,
  social_instagram text,
  social_tiktok text,
  social_facebook text,
  social_youtube text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT business_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT business_profiles_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users_profiles(id)
);
CREATE TABLE public.business_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  owner_reply text,
  owner_reply_at timestamp with time zone,
  CONSTRAINT business_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT business_reviews_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_profiles(id),
  CONSTRAINT business_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_profiles(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  description text,
  color character varying,
  icon character varying,
  parent_id uuid,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id)
);
CREATE TABLE public.community_comment_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT community_comment_likes_pkey PRIMARY KEY (id),
  CONSTRAINT community_comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.community_story_comments(id),
  CONSTRAINT community_comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_profiles(id)
);
CREATE TABLE public.community_story_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL,
  user_id uuid NOT NULL,
  parent_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT community_story_comments_pkey PRIMARY KEY (id),
  CONSTRAINT community_story_comments_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.user_stories(id),
  CONSTRAINT community_story_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_profiles(id),
  CONSTRAINT community_story_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.community_story_comments(id)
);
CREATE TABLE public.countries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  flag_icon character varying,
  iso_code character varying UNIQUE,
  capital character varying,
  population bigint,
  official_language character varying,
  currency character varying,
  currency_code character varying,
  timezone character varying,
  visa_info text,
  entry_requirements text,
  best_time_to_visit text,
  climate_info text,
  culture_description text,
  historical_info text,
  food_description text,
  local_customs text,
  top_places jsonb DEFAULT '[]'::jsonb,
  popular_activities jsonb DEFAULT '[]'::jsonb,
  average_budget jsonb DEFAULT '{}'::jsonb,
  airen_advice text,
  airen_video_url character varying,
  airen_audio_url character varying,
  meta_title character varying,
  meta_description character varying,
  featured_image character varying,
  view_count integer DEFAULT 0,
  article_count integer DEFAULT 0,
  status character varying DEFAULT 'active'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  featured boolean DEFAULT false,
  trending_score numeric DEFAULT 0,
  visa_required boolean,
  visitors_per_year bigint,
  budget_level text,
  latitude double precision,
  longitude double precision,
  negatives jsonb DEFAULT '[]'::jsonb CHECK (jsonb_typeof(negatives) = 'array'::text),
  popular_restaurants jsonb DEFAULT '[]'::jsonb CHECK (jsonb_typeof(popular_restaurants) = 'array'::text),
  popular_hotels jsonb DEFAULT '[]'::jsonb CHECK (jsonb_typeof(popular_hotels) = 'array'::text),
  popular_cities ARRAY DEFAULT '{}'::text[],
  culture_description_i18n jsonb DEFAULT '{}'::jsonb,
  visa_info_i18n jsonb DEFAULT '{}'::jsonb,
  entry_requirements_i18n jsonb DEFAULT '{}'::jsonb,
  best_time_to_visit_i18n jsonb DEFAULT '{}'::jsonb,
  climate_info_i18n jsonb DEFAULT '{}'::jsonb,
  airen_advice_i18n jsonb DEFAULT '{}'::jsonb,
  historical_info_i18n jsonb DEFAULT '{}'::jsonb,
  food_description_i18n jsonb DEFAULT '{}'::jsonb,
  local_customs_i18n jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT countries_pkey PRIMARY KEY (id)
);
CREATE TABLE public.country_bookmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  country_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT country_bookmarks_pkey PRIMARY KEY (id),
  CONSTRAINT country_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT country_bookmarks_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id)
);
CREATE TABLE public.country_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  country_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT country_favorites_pkey PRIMARY KEY (id),
  CONSTRAINT country_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT country_favorites_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id)
);
CREATE TABLE public.country_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  country_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  country_slug text NOT NULL,
  CONSTRAINT country_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT country_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT country_reviews_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['comment_like'::text, 'comment_reply'::text, 'story_like'::text, 'story_comment'::text, 'follow'::text])),
  payload jsonb NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_profiles(id)
);
CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  page_path character varying NOT NULL,
  page_title character varying,
  user_id uuid,
  session_id character varying,
  referrer character varying,
  user_agent text,
  ip_address inet,
  country character varying,
  device_type character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT page_views_pkey PRIMARY KEY (id),
  CONSTRAINT page_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_profiles(id)
);
CREATE TABLE public.story_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  story_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT story_likes_pkey PRIMARY KEY (id),
  CONSTRAINT story_likes_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.user_stories(id),
  CONSTRAINT story_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_profiles(id)
);
CREATE TABLE public.story_saves (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT story_saves_pkey PRIMARY KEY (id),
  CONSTRAINT story_saves_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.user_stories(id),
  CONSTRAINT story_saves_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  slug character varying NOT NULL UNIQUE,
  color character varying,
  usage_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_follows (
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_follows_pkey PRIMARY KEY (follower_id, following_id),
  CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users_profiles(id),
  CONSTRAINT user_follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users_profiles(id)
);
CREATE TABLE public.user_stories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  content text NOT NULL,
  image_url character varying,
  image_alt text,
  location character varying,
  country_id uuid,
  user_id uuid,
  category character varying,
  tags ARRAY DEFAULT '{}'::character varying[],
  likes_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'featured'::character varying]::text[])),
  moderator_id uuid,
  moderated_at timestamp with time zone,
  featured_at timestamp with time zone,
  slug character varying UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_stories_pkey PRIMARY KEY (id),
  CONSTRAINT user_stories_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id),
  CONSTRAINT user_stories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_profiles(id),
  CONSTRAINT user_stories_moderator_id_fkey FOREIGN KEY (moderator_id) REFERENCES public.users_profiles(id)
);
CREATE TABLE public.users_profiles (
  id uuid NOT NULL,
  username character varying NOT NULL UNIQUE,
  full_name character varying,
  avatar_url character varying,
  bio text,
  location character varying,
  website character varying,
  social_links jsonb DEFAULT '{}'::jsonb,
  role character varying DEFAULT 'user'::character varying,
  status character varying DEFAULT 'active'::character varying,
  preferences jsonb DEFAULT '{}'::jsonb,
  email_verified boolean DEFAULT false,
  last_seen timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  followers_count integer NOT NULL DEFAULT 0,
  following_count integer NOT NULL DEFAULT 0,
  gender text CHECK (gender = ANY (ARRAY['Female'::text, 'Male'::text, 'Other'::text])),
  account_type text DEFAULT 'user'::text CHECK (account_type = ANY (ARRAY['user'::text, 'business'::text])),
  CONSTRAINT users_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT users_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);