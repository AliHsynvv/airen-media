-- Enable UUID generation if needed (Supabase generally has this)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- 1) AUTH & PROFILES
-- =========================

CREATE TABLE IF NOT EXISTS users_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url VARCHAR(500),
  bio TEXT,
  location VARCHAR(100),
  website VARCHAR(200),
  social_links JSONB DEFAULT '{}',
  role VARCHAR(20) DEFAULT 'user', -- user | admin | moderator
  status VARCHAR(20) DEFAULT 'active', -- active | inactive | banned
  preferences JSONB DEFAULT '{}',
  email_verified BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_profiles_username ON users_profiles(username);
CREATE INDEX IF NOT EXISTS idx_users_profiles_role ON users_profiles(role);
CREATE INDEX IF NOT EXISTS idx_users_profiles_status ON users_profiles(status);

ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON users_profiles;
CREATE POLICY "Users can view all profiles" ON users_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users_profiles;
CREATE POLICY "Users can update own profile" ON users_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users_profiles;
CREATE POLICY "Users can insert own profile" ON users_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =========================
-- 2) CATEGORIES / TAGS
-- =========================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7),
  icon VARCHAR(50),
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  color VARCHAR(7),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_usage ON tags(usage_count DESC);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Read for everyone
DROP POLICY IF EXISTS "Categories: public read" ON categories;
CREATE POLICY "Categories: public read" ON categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Tags: public read" ON tags;
CREATE POLICY "Tags: public read" ON tags
  FOR SELECT USING (true);

-- Admin write
DROP POLICY IF EXISTS "Categories: admin write" ON categories;
CREATE POLICY "Categories: admin write" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users_profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Tags: admin write" ON tags;
CREATE POLICY "Tags: admin write" ON tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- 3) ARTICLES & JOINS
-- =========================

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image VARCHAR(500),
  image_alt TEXT,
  category_id UUID REFERENCES categories(id),
  author_id UUID REFERENCES users_profiles(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft | published | archived
  type VARCHAR(20) DEFAULT 'article', -- article | news | guide
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reading_time INTEGER,
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT valid_type CHECK (type IN ('article', 'news', 'guide'))
);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles
  USING gin(to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(content, '')));

CREATE TABLE IF NOT EXISTS article_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_article_tags_article ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

-- Article policies
DROP POLICY IF EXISTS "Articles: public read published" ON articles;
CREATE POLICY "Articles: public read published" ON articles
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Articles: author insert" ON articles;
CREATE POLICY "Articles: author insert" ON articles
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Articles: author update" ON articles;
CREATE POLICY "Articles: author update" ON articles
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Articles: admin manage" ON articles;
CREATE POLICY "Articles: admin manage" ON articles
  FOR ALL USING (EXISTS (SELECT 1 FROM users_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Article tags: read all, admin write
DROP POLICY IF EXISTS "ArticleTags: public read" ON article_tags;
CREATE POLICY "ArticleTags: public read" ON article_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "ArticleTags: admin write" ON article_tags;
CREATE POLICY "ArticleTags: admin write" ON article_tags
  FOR ALL USING (EXISTS (SELECT 1 FROM users_profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================
-- 4) MEDIA & TAGS
-- =========================

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  slug VARCHAR(200) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL, -- video | audio | image | document
  category VARCHAR(50),
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  duration INTEGER,
  file_size BIGINT,
  mime_type VARCHAR(100),
  upload_by UUID REFERENCES users_profiles(id),
  status VARCHAR(20) DEFAULT 'active', -- active | inactive | processing
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  seo_title VARCHAR(70),
  seo_description VARCHAR(160),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_media_type CHECK (type IN ('video', 'audio', 'image', 'document')),
  CONSTRAINT valid_media_status CHECK (status IN ('active', 'inactive', 'processing'))
);
CREATE INDEX IF NOT EXISTS idx_media_slug ON media(slug);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
CREATE INDEX IF NOT EXISTS idx_media_status ON media(status);
CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at DESC);

CREATE TABLE IF NOT EXISTS media_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(media_id, tag_id)
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Media: public read active" ON media;
CREATE POLICY "Media: public read active" ON media
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Media: admin manage" ON media;
CREATE POLICY "Media: admin manage" ON media
  FOR ALL USING (EXISTS (SELECT 1 FROM users_profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "MediaTags: public read" ON media_tags;
CREATE POLICY "MediaTags: public read" ON media_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "MediaTags: admin write" ON media_tags;
CREATE POLICY "MediaTags: admin write" ON media_tags
  FOR ALL USING (EXISTS (SELECT 1 FROM users_profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================
-- 5) COUNTRIES
-- =========================

CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  flag_icon VARCHAR(10),
  iso_code VARCHAR(3) UNIQUE,
  capital VARCHAR(100),
  population BIGINT,
  official_language VARCHAR(100),
  currency VARCHAR(100),
  currency_code VARCHAR(3),
  timezone VARCHAR(100),
  visa_info TEXT,
  entry_requirements TEXT,
  best_time_to_visit TEXT,
  climate_info TEXT,
  culture_description TEXT,
  historical_info TEXT,
  food_description TEXT,
  local_customs TEXT,
  top_places JSONB DEFAULT '[]',
  popular_activities JSONB DEFAULT '[]',
  average_budget JSONB DEFAULT '{}',
  airen_advice TEXT,
  airen_video_url VARCHAR(500),
  airen_audio_url VARCHAR(500),
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  featured_image VARCHAR(500),
  view_count INTEGER DEFAULT 0,
  article_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_countries_slug ON countries(slug);
CREATE INDEX IF NOT EXISTS idx_countries_iso ON countries(iso_code);
CREATE INDEX IF NOT EXISTS idx_countries_status ON countries(status);
CREATE INDEX IF NOT EXISTS idx_countries_search ON countries
  USING gin(to_tsvector('english', name || ' ' || COALESCE(capital, '') || ' ' || COALESCE(culture_description, '')));

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Countries: public read active" ON countries;
CREATE POLICY "Countries: public read active" ON countries
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Countries: admin manage" ON countries;
CREATE POLICY "Countries: admin manage" ON countries
  FOR ALL USING (EXISTS (SELECT 1 FROM users_profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================
-- 6) COMMENTS & VOTES
-- =========================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES users_profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'approved', -- pending | approved | rejected | flagged
  flagged_count INTEGER DEFAULT 0,
  moderator_id UUID REFERENCES users_profiles(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_comment_status CHECK (status IN ('pending', 'approved', 'rejected', 'flagged'))
);
CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments: public read approved" ON comments;
CREATE POLICY "Comments: public read approved" ON comments
  FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Comments: user insert own" ON comments;
CREATE POLICY "Comments: user insert own" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Comments: user update own" ON comments;
CREATE POLICY "Comments: user update own" ON comments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Comments: user delete own" ON comments;
CREATE POLICY "Comments: user delete own" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Comment votes
CREATE TABLE IF NOT EXISTS comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users_profiles(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL, -- upvote | downvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id),
  CONSTRAINT valid_vote_type CHECK (vote_type IN ('upvote', 'downvote'))
);
CREATE INDEX IF NOT EXISTS idx_comment_votes_comment ON comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_votes_user ON comment_votes(user_id);

ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CommentVotes: public read" ON comment_votes;
CREATE POLICY "CommentVotes: public read" ON comment_votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "CommentVotes: user manage own" ON comment_votes;
CREATE POLICY "CommentVotes: user manage own" ON comment_votes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =========================
-- 7) USER STORIES & LIKES
-- =========================

CREATE TABLE IF NOT EXISTS user_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  image_alt TEXT,
  location VARCHAR(100),
  country_id UUID REFERENCES countries(id),
  user_id UUID REFERENCES users_profiles(id) ON DELETE CASCADE,
  category VARCHAR(50),
  tags VARCHAR[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending | approved | rejected | featured
  moderator_id UUID REFERENCES users_profiles(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  featured_at TIMESTAMP WITH TIME ZONE,
  slug VARCHAR(200) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_story_status CHECK (status IN ('pending', 'approved', 'rejected', 'featured'))
);
CREATE INDEX IF NOT EXISTS idx_user_stories_user ON user_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_country ON user_stories(country_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_status ON user_stories(status);
CREATE INDEX IF NOT EXISTS idx_user_stories_category ON user_stories(category);
CREATE INDEX IF NOT EXISTS idx_user_stories_created ON user_stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_stories_featured ON user_stories(featured_at DESC) WHERE status = 'featured';
CREATE INDEX IF NOT EXISTS idx_user_stories_slug ON user_stories(slug);
CREATE INDEX IF NOT EXISTS idx_user_stories_search ON user_stories
  USING gin(to_tsvector('english', title || ' ' || content || ' ' || COALESCE(location, '')));

CREATE TABLE IF NOT EXISTS story_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES user_stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_story_likes_story ON story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_user ON story_likes(user_id);

ALTER TABLE user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stories: public read approved_or_featured" ON user_stories;
CREATE POLICY "Stories: public read approved_or_featured" ON user_stories
  FOR SELECT USING (status IN ('approved', 'featured'));

DROP POLICY IF EXISTS "Stories: user insert own" ON user_stories;
CREATE POLICY "Stories: user insert own" ON user_stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Stories: user update own" ON user_stories;
CREATE POLICY "Stories: user update own" ON user_stories
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Stories: admin moderate" ON user_stories;
CREATE POLICY "Stories: admin moderate" ON user_stories
  FOR UPDATE USING (EXISTS (SELECT 1 FROM users_profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "StoryLikes: public read" ON story_likes;
CREATE POLICY "StoryLikes: public read" ON story_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "StoryLikes: user manage own" ON story_likes;
CREATE POLICY "StoryLikes: user manage own" ON story_likes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =========================
-- 8) SOCIAL POSTS
-- =========================

CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(20) NOT NULL, -- instagram | twitter | youtube
  external_id VARCHAR(100) UNIQUE NOT NULL,
  content TEXT,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  post_url VARCHAR(500),
  engagement_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  hashtags VARCHAR[] DEFAULT '{}',
  posted_at TIMESTAMP WITH TIME ZONE,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_posted ON social_posts(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_featured ON social_posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_social_posts_external ON social_posts(external_id);

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "SocialPosts: public read active" ON social_posts;
CREATE POLICY "SocialPosts: public read active" ON social_posts
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "SocialPosts: admin manage" ON social_posts;
CREATE POLICY "SocialPosts: admin manage" ON social_posts
  FOR ALL USING (EXISTS (SELECT 1 FROM users_profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================
-- 9) ANALYTICS / LOGS
-- =========================

CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(200),
  user_id UUID REFERENCES users_profiles(id),
  session_id VARCHAR(100),
  referrer VARCHAR(500),
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(2),
  device_type VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_user ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users_profiles(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_activity_logs(created_at DESC);

ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin logs: admin only" ON admin_activity_logs;
CREATE POLICY "Admin logs: admin only" ON admin_activity_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- 10) FUNCTIONS & TRIGGERS
-- =========================

-- update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables having updated_at
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('users_profiles','articles','categories','countries','media','comments','user_stories','social_posts','article_tags','media_tags')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;', r.tablename, r.tablename);
    EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();', r.tablename, r.tablename);
  END LOOP;
END $$;

-- generate_slug
CREATE OR REPLACE FUNCTION generate_slug(src TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(src, '[^a-zA-Z0-9\\s]', '', 'g'), '\\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- set_article_slug
CREATE OR REPLACE FUNCTION set_article_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
    WHILE EXISTS (SELECT 1 FROM articles WHERE slug = NEW.slug AND id <> COALESCE(NEW.id, gen_random_uuid())) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS articles_slug_trigger ON articles;
CREATE TRIGGER articles_slug_trigger BEFORE INSERT OR UPDATE ON articles
FOR EACH ROW EXECUTE PROCEDURE set_article_slug();

-- set_country_slug
CREATE OR REPLACE FUNCTION set_country_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
    WHILE EXISTS (SELECT 1 FROM countries WHERE slug = NEW.slug AND id <> COALESCE(NEW.id, gen_random_uuid())) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS countries_slug_trigger ON countries;
CREATE TRIGGER countries_slug_trigger BEFORE INSERT OR UPDATE ON countries
FOR EACH ROW EXECUTE PROCEDURE set_country_slug();

-- set_media_slug
CREATE OR REPLACE FUNCTION set_media_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
    WHILE EXISTS (SELECT 1 FROM media WHERE slug = NEW.slug AND id <> COALESCE(NEW.id, gen_random_uuid())) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS media_slug_trigger ON media;
CREATE TRIGGER media_slug_trigger BEFORE INSERT OR UPDATE ON media
FOR EACH ROW EXECUTE PROCEDURE set_media_slug();

-- set_user_story_slug
CREATE OR REPLACE FUNCTION set_user_story_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
    WHILE EXISTS (SELECT 1 FROM user_stories WHERE slug = NEW.slug AND id <> COALESCE(NEW.id, gen_random_uuid())) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS user_stories_slug_trigger ON user_stories;
CREATE TRIGGER user_stories_slug_trigger BEFORE INSERT OR UPDATE ON user_stories
FOR EACH ROW EXECUTE PROCEDURE set_user_story_slug();

-- comment votes counters (optional)
CREATE OR REPLACE FUNCTION update_comment_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'upvote' THEN
      UPDATE comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
    ELSE
      UPDATE comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'upvote' THEN
      UPDATE comments SET upvotes = upvotes - 1 WHERE id = OLD.comment_id;
    ELSE
      UPDATE comments SET downvotes = downvotes - 1 WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comment_votes_trigger ON comment_votes;
CREATE TRIGGER comment_votes_trigger
  AFTER INSERT OR DELETE ON comment_votes
  FOR EACH ROW EXECUTE PROCEDURE update_comment_votes();

-- =========================
-- 11) VIEWS
-- =========================

CREATE OR REPLACE VIEW popular_articles AS
SELECT 
  a.*,
  u.username AS author_username,
  u.full_name AS author_name,
  c.name AS category_name,
  (SELECT COUNT(*) FROM comments WHERE article_id = a.id AND status = 'approved') AS comment_count
FROM articles a
LEFT JOIN users_profiles u ON a.author_id = u.id
LEFT JOIN categories c ON a.category_id = c.id
WHERE a.status = 'published'
ORDER BY a.view_count DESC, a.published_at DESC;

CREATE OR REPLACE VIEW user_engagement_stats AS
SELECT 
  u.id,
  u.username,
  u.full_name,
  COUNT(DISTINCT a.id) AS articles_count,
  COUNT(DISTINCT c.id) AS comments_count,
  COUNT(DISTINCT s.id) AS stories_count,
  u.created_at,
  u.last_seen
FROM users_profiles u
LEFT JOIN articles a ON u.id = a.author_id AND a.status = 'published'
LEFT JOIN comments c ON u.id = c.user_id AND c.status = 'approved'
LEFT JOIN user_stories s ON u.id = s.user_id AND s.status = 'approved'
GROUP BY u.id, u.username, u.full_name, u.created_at, u.last_seen;