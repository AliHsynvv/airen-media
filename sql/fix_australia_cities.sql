-- Fix Australia: Add popular cities for better restaurant/hotel search
-- This will enable city-based search instead of searching in the desert

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
]'::jsonb
WHERE name = 'Australia' OR iso_code = 'AU';

-- Also update the country center coordinates to Sydney (more useful)
UPDATE countries
SET 
  latitude = -33.8688,
  longitude = 151.2093
WHERE name = 'Australia' OR iso_code = 'AU';

