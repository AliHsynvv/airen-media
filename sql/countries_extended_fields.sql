-- ==========================================
-- Countries tablosuna genişletilmiş alanlar
-- Harita, mənfi tərəflər, yemekler, restoranlar və oteller
-- ==========================================

-- 1) Harita koordinatları (Google Maps, OpenStreetMap için)
ALTER TABLE countries
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS map_zoom_level INTEGER DEFAULT 6;

-- 2) Mənfi tərəflər / Dezavantajlar (JSONB array)
-- Örnek format: [{"title": "Yüksek fiyatlar", "description": "Konaklama ve yemek masrafları yüksek", "severity": "high"}]
ALTER TABLE countries
ADD COLUMN IF NOT EXISTS negative_aspects JSONB DEFAULT '[]';

-- 3) En məşhur yemeklər (JSONB array)
-- Örnek format: [{"name": "Plov", "description": "Azərbaycanın milli yeməyi", "image_url": "https://...", "price_range": "10-20 AZN", "recommended_places": ["Restoran1", "Restoran2"]}]
ALTER TABLE countries
ADD COLUMN IF NOT EXISTS famous_foods JSONB DEFAULT '[]';

-- 4) Restoranlar (JSONB array)
-- Örnek format: [{"name": "Restaurant X", "description": "Yerli mətbəx", "address": "Bakı, Nizami küç.", "latitude": 40.3777, "longitude": 49.8920, "rating": 4.5, "price_range": "$$", "cuisine_type": "Azerbaijani", "images": ["url1", "url2"], "phone": "+994...", "website": "https://..."}]
ALTER TABLE countries
ADD COLUMN IF NOT EXISTS restaurants JSONB DEFAULT '[]';

-- 5) Otellər (JSONB array)
-- Örnek format: [{"name": "Hotel Luxury", "description": "5 ulduzlu otel", "address": "Bakı, Neftçilər pr.", "latitude": 40.3777, "longitude": 49.8920, "rating": 5.0, "price_range": "$$$", "star_rating": 5, "images": ["url1", "url2"], "amenities": ["WiFi", "Pool", "Spa"], "phone": "+994...", "website": "https://...", "booking_url": "https://..."}]
ALTER TABLE countries
ADD COLUMN IF NOT EXISTS hotels JSONB DEFAULT '[]';

-- 6) Genel turizm istatistikleri
ALTER TABLE countries
ADD COLUMN IF NOT EXISTS total_restaurants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_hotels INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_meal_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS average_hotel_price DECIMAL(10, 2);

-- İndeksler (axtarış performansı üçün)
CREATE INDEX IF NOT EXISTS idx_countries_location ON countries(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_countries_negative_aspects ON countries USING gin(negative_aspects);
CREATE INDEX IF NOT EXISTS idx_countries_famous_foods ON countries USING gin(famous_foods);
CREATE INDEX IF NOT EXISTS idx_countries_restaurants ON countries USING gin(restaurants);
CREATE INDEX IF NOT EXISTS idx_countries_hotels ON countries USING gin(hotels);

-- GeoSpatial index (əgər PostGIS varsa)
-- CREATE INDEX IF NOT EXISTS idx_countries_geom ON countries USING gist(ll_to_earth(latitude, longitude));

-- ==========================================
-- JSON struktur örnekleri (Reference)
-- ==========================================

-- negative_aspects format:
-- [
--   {
--     "title": "Yüksek yaşam maliyeti",
--     "description": "Konaklama ve yemek fiyatları diğer ülkelere göre daha yüksek",
--     "severity": "high", // low, medium, high
--     "category": "cost" // cost, safety, weather, etc.
--   }
-- ]

-- famous_foods format:
-- [
--   {
--     "name": "Plov",
--     "local_name": "Плов",
--     "description": "Azərbaycanın ən məşhur yeməyi, düyü və ətlə hazırlanır",
--     "image_url": "https://storage.../plov.jpg",
--     "price_range": "10-25 AZN",
--     "ingredients": ["düyü", "quzu əti", "soğan", "alça"],
--     "recommended_places": ["Firuze Restaurant", "Old Baku"],
--     "is_vegetarian": false,
--     "is_vegan": false
--   }
-- ]

-- restaurants format:
-- [
--   {
--     "name": "Firuze Restaurant",
--     "description": "Geleneksel Azerbaycan mutfağı sunan lüks restoran",
--     "address": "Nizami küçəsi 96, Bakı",
--     "latitude": 40.3777,
--     "longitude": 49.8920,
--     "rating": 4.7,
--     "price_range": "$$$", // $, $$, $$$, $$$$
--     "cuisine_type": "Azerbaijani",
--     "specialties": ["Plov", "Dolma", "Kebab"],
--     "images": [
--       "https://storage.../restaurant1.jpg",
--       "https://storage.../restaurant2.jpg"
--     ],
--     "phone": "+994 12 497 3434",
--     "website": "https://firuze.az",
--     "opening_hours": "10:00-23:00",
--     "average_meal_cost": 35.00
--   }
-- ]

-- hotels format:
-- [
--   {
--     "name": "Four Seasons Baku",
--     "description": "Lüks 5 yıldızlı otel, Hazar Denizi manzaralı",
--     "address": "Neftçilər prospekti 89, Bakı",
--     "latitude": 40.3656,
--     "longitude": 49.8352,
--     "rating": 4.9,
--     "star_rating": 5,
--     "price_range": "$$$$", // $, $$, $$$, $$$$
--     "price_per_night": 250.00,
--     "images": [
--       "https://storage.../hotel1.jpg",
--       "https://storage.../hotel2.jpg",
--       "https://storage.../hotel3.jpg"
--     ],
--     "amenities": ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar", "Parking"],
--     "phone": "+994 12 404 2424",
--     "website": "https://fourseasons.com/baku",
--     "booking_url": "https://booking.com/...",
--     "room_types": ["Standard", "Deluxe", "Suite"]
--   }
-- ]

-- ==========================================
-- Yorumlar ve kullanım notları
-- ==========================================
-- 
-- 1. latitude/longitude: Ölkənin mərkəz koordinatları (paytaxt və ya coğrafi mərkəz)
-- 2. negative_aspects: Turistlərin bilməsi lazım olan mənfi cəhətlər
-- 3. famous_foods: Ölkənin məşhur milli yeməkləri, rəsimlərlə
-- 4. restaurants: Tövsiyə olunan restoranlar, tam məlumat və rəsimlər
-- 5. hotels: Tövsiyə olunan otellər, qiymət və imkanlar
-- 6. Hər bir JSON array element tam strukturlu obyekt olmalıdır
-- 7. images array-ları çoxlu şəkil saxlaya bilər (min 1, max 10 tövsiyə olunur)
-- 8. rating sahələri 0-5 arasında ola bilər
-- 9. price_range: $ (budget), $$ (moderate), $$$ (upscale), $$$$ (luxury)

