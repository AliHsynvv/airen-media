# 🏙️ Popular Cities - Format Guide

## 📊 Two Formats Supported

Sistem **hər iki formatı** dəstəkləyir:

### 1️⃣ **Simple Format (text[])**
```sql
-- Just city names
UPDATE countries
SET popular_cities = ARRAY['Sydney', 'Melbourne', 'Brisbane']
WHERE iso_code = 'AU';
```

**Pros:**
- ✅ Sadə
- ✅ Migration lazım deyil
- ✅ Hazırda işləyir

**Cons:**
- ❌ Yalnız şəhər adı
- ❌ Koordinat yoxdur
- ❌ Əlavə məlumat yoxdur

---

### 2️⃣ **Rich Format (JSONB)** 🌟 **Recommended**
```sql
-- Full city data with coordinates
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
    "description": "Cultural capital",
    "latitude": -37.8136,
    "longitude": 144.9631,
    "population": 5078000
  }
]'::jsonb
WHERE iso_code = 'AU';
```

**Pros:**
- ✅ Tam məlumat
- ✅ Koordinatlar (lat/lng)
- ✅ Description, population
- ✅ Gələcək üçün genişlənə bilər

**Cons:**
- ⚠️ Migration lazımdır (bir dəfə)

---

## 🔧 Migration (text[] → JSONB)

### Option A: Auto Migration Script
```bash
psql -d database -f sql/migrate_popular_cities_to_jsonb.sql
```

Bu script:
1. ✅ Köhnə `text[]` data-nı JSONB-yə çevirir
2. ✅ Column tipini dəyişdirir
3. ✅ Index əlavə edir
4. ✅ Heç bir data itmir

### Option B: Keep text[] (No Migration)
```bash
psql -d database -f sql/fix_australia_cities_simple.sql
```

Sadəcə şəhər adları əlavə edir, migration lazım deyil.

---

## 💻 Code Implementation

Kod **hər iki formatı avtomatik tanıyır**:

```typescript
// src/app/api/admin/countries/[id]/fetch-venues/route.ts

// Supports both formats:
let cities: string[] = []
if (country.popular_cities && Array.isArray(country.popular_cities)) {
  cities = country.popular_cities.map((city: any) => {
    // JSONB format: {name: "Sydney", ...}
    if (typeof city === 'object' && city.name) {
      return city.name
    }
    // text[] format: "Sydney"
    if (typeof city === 'string') {
      return city
    }
    return null
  }).filter(Boolean) as string[]
}
```

---

## 🚀 Quick Start

### For Australia (Simple)
```sql
-- Use text[] format (no migration needed)
UPDATE countries
SET popular_cities = ARRAY['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    latitude = -33.8688,
    longitude = 151.2093
WHERE name = 'Australia';
```

### For Australia (Rich - Recommended)
```sql
-- First: Run migration script
\i sql/migrate_popular_cities_to_jsonb.sql

-- Then: Add full city data
UPDATE countries
SET popular_cities = '[
  {"name": "Sydney", "latitude": -33.8688, "longitude": 151.2093, "population": 5312000},
  {"name": "Melbourne", "latitude": -37.8136, "longitude": 144.9631, "population": 5078000},
  {"name": "Brisbane", "latitude": -27.4698, "longitude": 153.0251, "population": 2560000},
  {"name": "Perth", "latitude": -31.9505, "longitude": 115.8605, "population": 2125000},
  {"name": "Adelaide", "latitude": -34.9285, "longitude": 138.6007, "population": 1370000}
]'::jsonb,
latitude = -33.8688,
longitude = 151.2093
WHERE name = 'Australia';
```

---

## 📝 Templates

### USA
```sql
-- Simple
UPDATE countries 
SET popular_cities = ARRAY['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']
WHERE iso_code = 'US';

-- Rich (after migration)
UPDATE countries 
SET popular_cities = '[
  {"name": "New York", "latitude": 40.7128, "longitude": -74.0060, "population": 8336000},
  {"name": "Los Angeles", "latitude": 34.0522, "longitude": -118.2437, "population": 3979000},
  {"name": "Chicago", "latitude": 41.8781, "longitude": -87.6298, "population": 2716000}
]'::jsonb
WHERE iso_code = 'US';
```

### Turkey
```sql
-- Simple
UPDATE countries 
SET popular_cities = ARRAY['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bursa']
WHERE iso_code = 'TR';

-- Rich (after migration)
UPDATE countries 
SET popular_cities = '[
  {"name": "Istanbul", "latitude": 41.0082, "longitude": 28.9784, "population": 15840000},
  {"name": "Ankara", "latitude": 39.9334, "longitude": 32.8597, "population": 5747000},
  {"name": "Izmir", "latitude": 38.4192, "longitude": 27.1287, "population": 4425000}
]'::jsonb
WHERE iso_code = 'TR';
```

---

## 🎯 Recommendation

**For New Projects**: Use JSONB format from the start
- More flexible
- Future-proof
- Better for features like city weather, maps, etc.

**For Existing Projects**: 
1. Use simple `text[]` format now (quick fix)
2. Migrate to JSONB later when needed

---

## 📊 Current Status

| Format | Migration Needed | Features | Status |
|--------|------------------|----------|--------|
| `text[]` | ❌ No | City names only | ✅ Working |
| `JSONB` | ✅ Yes | Full city data | ✅ Working |

---

## 🔧 Files

1. `sql/migrate_popular_cities_to_jsonb.sql` - Full migration (text[] → JSONB)
2. `sql/fix_australia_cities_simple.sql` - Quick fix (text[] format)
3. `sql/fix_australia_cities.sql` - JSONB format (requires migration first)
4. `src/app/api/admin/countries/[id]/fetch-venues/route.ts` - Code (supports both)

---

**Both formats work! Choose based on your needs.** 🎨✨

