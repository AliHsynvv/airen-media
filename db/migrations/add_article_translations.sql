-- Add translations support to articles table
-- This allows storing multilingual content for each article

ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

-- Create index for better query performance on translations
CREATE INDEX IF NOT EXISTS idx_articles_translations ON public.articles USING GIN (translations);

-- Add comment explaining the structure
COMMENT ON COLUMN public.articles.translations IS 
'Multilingual translations stored as JSONB. Structure:
{
  "tr": {"title": "...", "content": "...", "excerpt": "..."},
  "en": {"title": "...", "content": "...", "excerpt": "..."},
  "ru": {"title": "...", "content": "...", "excerpt": "..."}
}';

-- Add default_language column to track the original language
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS default_language VARCHAR(5) DEFAULT 'tr';

COMMENT ON COLUMN public.articles.default_language IS 
'The original language of the article. Used as fallback when translation is missing.';

