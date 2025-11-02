-- Debug Albania slug issue

-- 1. Show EXACT slug with length and special characters
SELECT 
  id,
  name,
  slug,
  LENGTH(slug) as slug_length,
  ASCII(SUBSTRING(slug, 1, 1)) as first_char_ascii,
  ENCODE(slug::bytea, 'hex') as slug_hex
FROM countries 
WHERE name ILIKE '%albania%';

-- 2. Try to find it by different slug variations
SELECT id, name, slug FROM countries WHERE slug = 'albania';
SELECT id, name, slug FROM countries WHERE slug = 'Albania';
SELECT id, name, slug FROM countries WHERE slug ILIKE 'albania';

-- 3. Show all slugs to see pattern
SELECT id, name, slug FROM countries ORDER BY name LIMIT 20;

