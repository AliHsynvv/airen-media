-- Countries: add map coords, negatives, popular restaurants and hotels
ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS negatives JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS popular_restaurants JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS popular_hotels JSONB DEFAULT '[]';

-- Optional: basic validation check constraints (JSON arrays)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'countries_negatives_is_array'
  ) THEN
    ALTER TABLE countries
      ADD CONSTRAINT countries_negatives_is_array CHECK (jsonb_typeof(negatives) = 'array');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'countries_restaurants_is_array'
  ) THEN
    ALTER TABLE countries
      ADD CONSTRAINT countries_restaurants_is_array CHECK (jsonb_typeof(popular_restaurants) = 'array');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'countries_hotels_is_array'
  ) THEN
    ALTER TABLE countries
      ADD CONSTRAINT countries_hotels_is_array CHECK (jsonb_typeof(popular_hotels) = 'array');
  END IF;
END $$;


