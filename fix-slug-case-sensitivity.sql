-- =================================================
-- FIX: Slug Case Sensitivity Issue
-- Problem: Slugs like "Albania" should be "albania" (lowercase)
-- Solution: Convert all slugs to lowercase
-- =================================================

-- STEP 1: Check current slugs (find problematic ones)
SELECT id, name, slug, 
       CASE WHEN slug != LOWER(slug) THEN '❌ NEEDS FIX' ELSE '✅ OK' END as status
FROM countries 
WHERE slug IS NOT NULL
ORDER BY name;

-- STEP 2: Preview changes (before updating)
SELECT id, name, slug as current_slug, LOWER(slug) as new_slug
FROM countries 
WHERE slug IS NOT NULL AND slug != LOWER(slug);

-- STEP 3: Apply the fix (run this to fix Albania and all other uppercase slugs)
UPDATE countries 
SET slug = LOWER(slug) 
WHERE slug IS NOT NULL AND slug != LOWER(slug);

-- STEP 4: Verify all slugs are now lowercase
SELECT id, name, slug,
       CASE WHEN slug = LOWER(slug) THEN '✅ Fixed' ELSE '❌ Still Wrong' END as status
FROM countries 
WHERE slug IS NOT NULL
ORDER BY name;

-- =================================================
-- NOTES:
-- - This will fix Albania: "Albania" → "albania"
-- - Also fixes any other countries with uppercase slugs
-- - Safe to run multiple times (idempotent)
-- =================================================

