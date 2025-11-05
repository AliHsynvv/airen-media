-- ==========================================
-- SIMPLE FIX: Just add city names (text[] format)
-- No migration needed, works with existing schema
-- ==========================================

-- Add city names to Australia
UPDATE countries
SET popular_cities = ARRAY['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    latitude = -33.8688,
    longitude = 151.2093
WHERE name = 'Australia' OR iso_code = 'AU';

-- ==========================================
-- NOTE: This uses text[] format (city names only)
-- If you need full city data (lat/lng/description), 
-- use migrate_popular_cities_to_jsonb.sql instead
-- ==========================================

