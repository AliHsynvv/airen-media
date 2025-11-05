-- ==========================================
-- Migrate popular_cities from text[] to JSONB
-- This allows storing city objects with lat/lng/description
-- ==========================================

-- Step 1: Create a temporary JSONB column
ALTER TABLE countries
ADD COLUMN IF NOT EXISTS popular_cities_jsonb JSONB DEFAULT '[]';

-- Step 2: Migrate existing text[] data to JSONB format
-- Convert ['Sydney', 'Melbourne'] to [{"name": "Sydney"}, {"name": "Melbourne"}]
UPDATE countries
SET popular_cities_jsonb = (
  SELECT jsonb_agg(jsonb_build_object('name', city_name))
  FROM unnest(popular_cities) AS city_name
)
WHERE popular_cities IS NOT NULL AND array_length(popular_cities, 1) > 0;

-- Step 3: Drop old text[] column
ALTER TABLE countries
DROP COLUMN IF EXISTS popular_cities;

-- Step 4: Rename new JSONB column to popular_cities
ALTER TABLE countries
RENAME COLUMN popular_cities_jsonb TO popular_cities;

-- Step 5: Add comment
COMMENT ON COLUMN countries.popular_cities IS 'Array of popular cities with details (name, lat, lng, description, population) - JSONB format';

-- Step 6: Add GIN index for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_countries_popular_cities ON countries USING gin(popular_cities);

-- ==========================================
-- Now you can use rich city data:
-- ==========================================

-- Example: Australia with full city data
UPDATE countries
SET popular_cities = '[
  {
    "name": "Sydney",
    "description": "Largest city, iconic Opera House",
    "latitude": -33.8688,
    "longitude": 151.2093,
    "population": 5312000
  },
  {
    "name": "Melbourne",
    "description": "Cultural capital, coffee culture",
    "latitude": -37.8136,
    "longitude": 144.9631,
    "population": 5078000
  },
  {
    "name": "Brisbane",
    "description": "Sunny city, gateway to Gold Coast",
    "latitude": -27.4698,
    "longitude": 153.0251,
    "population": 2560000
  },
  {
    "name": "Perth",
    "description": "Western Australia capital, beaches",
    "latitude": -31.9505,
    "longitude": 115.8605,
    "population": 2125000
  },
  {
    "name": "Adelaide",
    "description": "Wine country, arts festivals",
    "latitude": -34.9285,
    "longitude": 138.6007,
    "population": 1370000
  }
]'::jsonb,
latitude = -33.8688,
longitude = 151.2093
WHERE name = 'Australia' OR iso_code = 'AU';

-- ==========================================
-- Migration complete! 
-- popular_cities is now JSONB and can store rich city data
-- ==========================================

