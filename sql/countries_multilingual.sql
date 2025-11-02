-- ==========================================
-- Ülkelere çok dilli içerik desteği ekle
-- ==========================================

-- Yeni JSONB kolonlar ekle (çok dilli içerik için)
ALTER TABLE countries
ADD COLUMN IF NOT EXISTS culture_description_i18n JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS visa_info_i18n JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS entry_requirements_i18n JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS best_time_to_visit_i18n JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS climate_info_i18n JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS airen_advice_i18n JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS historical_info_i18n JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS food_description_i18n JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS local_customs_i18n JSONB DEFAULT '{}';

-- Mevcut TEXT verilerini migration et (default dil olarak 'en' kabul ediyoruz)
-- Eğer mevcut veri varsa, onu 'en' (İngilizce) key'i altına koy
UPDATE countries
SET 
  culture_description_i18n = jsonb_build_object('en', culture_description)
WHERE culture_description IS NOT NULL AND culture_description != '';

UPDATE countries
SET 
  visa_info_i18n = jsonb_build_object('en', visa_info)
WHERE visa_info IS NOT NULL AND visa_info != '';

UPDATE countries
SET 
  entry_requirements_i18n = jsonb_build_object('en', entry_requirements)
WHERE entry_requirements IS NOT NULL AND entry_requirements != '';

UPDATE countries
SET 
  best_time_to_visit_i18n = jsonb_build_object('en', best_time_to_visit)
WHERE best_time_to_visit IS NOT NULL AND best_time_to_visit != '';

UPDATE countries
SET 
  climate_info_i18n = jsonb_build_object('en', climate_info)
WHERE climate_info IS NOT NULL AND climate_info != '';

UPDATE countries
SET 
  airen_advice_i18n = jsonb_build_object('en', airen_advice)
WHERE airen_advice IS NOT NULL AND airen_advice != '';

UPDATE countries
SET 
  historical_info_i18n = jsonb_build_object('en', historical_info)
WHERE historical_info IS NOT NULL AND historical_info != '';

UPDATE countries
SET 
  food_description_i18n = jsonb_build_object('en', food_description)
WHERE food_description IS NOT NULL AND food_description != '';

UPDATE countries
SET 
  local_customs_i18n = jsonb_build_object('en', local_customs)
WHERE local_customs IS NOT NULL AND local_customs != '';

-- İndeksler ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_countries_culture_i18n ON countries USING gin(culture_description_i18n);
CREATE INDEX IF NOT EXISTS idx_countries_visa_i18n ON countries USING gin(visa_info_i18n);
CREATE INDEX IF NOT EXISTS idx_countries_airen_i18n ON countries USING gin(airen_advice_i18n);

-- NOT: Eski TEXT kolonları şimdilik tutulacak (backward compatibility için)
-- İleride tamamen _i18n kolonlarına geçtikten sonra silinebilir:
-- ALTER TABLE countries DROP COLUMN culture_description;
-- ALTER TABLE countries DROP COLUMN visa_info;
-- vb.

COMMENT ON COLUMN countries.culture_description_i18n IS 'Multi-language culture descriptions: {"en": "...", "tr": "...", "ru": "..."}';
COMMENT ON COLUMN countries.visa_info_i18n IS 'Multi-language visa information: {"en": "...", "tr": "...", "ru": "..."}';
COMMENT ON COLUMN countries.entry_requirements_i18n IS 'Multi-language entry requirements: {"en": "...", "tr": "...", "ru": "..."}';
COMMENT ON COLUMN countries.best_time_to_visit_i18n IS 'Multi-language best time to visit: {"en": "...", "tr": "...", "ru": "..."}';
COMMENT ON COLUMN countries.climate_info_i18n IS 'Multi-language climate information: {"en": "...", "tr": "...", "ru": "..."}';
COMMENT ON COLUMN countries.airen_advice_i18n IS 'Multi-language Airen advice: {"en": "...", "tr": "...", "ru": "..."}';
COMMENT ON COLUMN countries.historical_info_i18n IS 'Multi-language historical information: {"en": "...", "tr": "...", "ru": "..."}';
COMMENT ON COLUMN countries.food_description_i18n IS 'Multi-language food descriptions: {"en": "...", "tr": "...", "ru": "..."}';
COMMENT ON COLUMN countries.local_customs_i18n IS 'Multi-language local customs: {"en": "...", "tr": "...", "ru": "..."}';

