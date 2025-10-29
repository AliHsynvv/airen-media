-- Add popular_cities column to countries table
-- This column stores an array of city names for the weather widget

-- Add the column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'countries' 
    AND column_name = 'popular_cities'
  ) THEN
    ALTER TABLE countries 
    ADD COLUMN popular_cities text[] DEFAULT '{}';
    
    COMMENT ON COLUMN countries.popular_cities IS 'Array of popular city names for weather widget';
  END IF;
END $$;

-- Example update for Turkey
-- UPDATE countries 
-- SET popular_cities = ARRAY['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bodrum']
-- WHERE slug = 'turkey';

-- Example updates for other countries
-- UPDATE countries SET popular_cities = ARRAY['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Liverpool'] WHERE slug = 'united-kingdom';
-- UPDATE countries SET popular_cities = ARRAY['Paris', 'Marseille', 'Lyon', 'Nice', 'Bordeaux'] WHERE slug = 'france';
-- UPDATE countries SET popular_cities = ARRAY['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'] WHERE slug = 'spain';
-- UPDATE countries SET popular_cities = ARRAY['Rome', 'Milan', 'Venice', 'Florence', 'Naples'] WHERE slug = 'italy';
-- UPDATE countries SET popular_cities = ARRAY['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'] WHERE slug = 'germany';

