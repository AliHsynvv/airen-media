# Auto Fetch Sistemi - İstifadə Nümunələri

## 🎯 Sürətli Başlanğıc

### Nümunə 1: Azərbaycan üçün Restoranları Çəkmək

#### Admin Panel vasitəsilə:

1. **Ölkə məlumatlarını yoxlayın:**
   - Admin Panel → Countries → Azərbaycan → Edit
   - ISO Code: `AZ` ✅
   - Latitude: `40.1431` ✅
   - Longitude: `47.5769` ✅

2. **Restoranları çəkin:**
   - "Popüler Restoranlar" bölməsinə keçin
   - 🌍 **Auto Fetch** düyməsinə klikləyin
   - ⏳ Gözləyin (10-20 saniyə)
   - ✅ "15 restoran OpenStreetMap'ten başarıyla çekildi!" mesajı görməlisiniz

3. **Nəticəni yoxlayın:**
   - Siyahıda Bakı və ətraf ərazilərdən restoranlar görünəcək
   - Hər birinin adı, ünvanı və əlavə məlumatları var

4. **Saxlayın:**
   - **Kaydet** düyməsinə basın
   - Məlumatlar database-ə yazılacaq

#### Gözlənilən Nəticə:
```json
[
  {
    "name": "Firuze Restaurant",
    "image": "",
    "url": "https://firuze.az",
    "description": "Cuisine: Azerbaijani",
    "location": {
      "lat": 40.3777,
      "lng": 49.8920,
      "address": "Neftçilər Avenue 73, Baku",
      "city": "Baku"
    }
  },
  {
    "name": "Sumakh Restaurant",
    "image": "",
    "url": "https://sumakh.az",
    "description": "Cuisine: Mediterranean",
    "location": {
      "lat": 40.3655,
      "lng": 49.8363,
      "address": "Nizami Street 40, Baku",
      "city": "Baku"
    }
  }
  // ... daha çox
]
```

---

### Nümunə 2: Türkiyə üçün Otelləri Çəkmək

#### Siyahı səhifəsindən:

1. **Admin Panel → Countries**
2. Türkiyə sətirini tapın
3. **Auto Fetch** sütununda 🏨 düyməsinə klikləyin
4. ⏳ "Çekiliyor..." mesajı görünəcək
5. ✅ "Türkiye: 18 otel çekildi!" mesajı görünəcək

#### Nəticəni yoxlamaq üçün:
1. **Düzenle** düyməsinə klikləyin
2. Aşağı scroll edib "Popüler Oteller" bölməsinə baxın
3. İstanbul, Ankara və digər şəhərlərdən otellər görünəcək

#### Gözlənilən Nəticə:
```json
[
  {
    "name": "Ciragan Palace Kempinski",
    "image": "",
    "url": "https://www.kempinski.com/istanbul",
    "description": "5 star hotel",
    "location": {
      "lat": 41.0478,
      "lng": 29.0157,
      "address": "Çırağan Caddesi 32, Istanbul",
      "city": "Istanbul"
    }
  },
  {
    "name": "Four Seasons Sultanahmet",
    "image": "",
    "url": "",
    "description": "Rooms: 65",
    "location": {
      "lat": 41.0082,
      "lng": 28.9784,
      "address": "Tevkifhane Sk No:1, Istanbul",
      "city": "Istanbul"
    }
  }
  // ... daha çox
]
```

---

### Nümunə 3: Koordinatlarla Restoran Çəkmək (ISO kod olmadan)

#### Scenario: Yeni ölkə əlavə etdiniz, ISO kodu yoxdur

1. **Admin Panel → Countries → Create**
2. Ölkəni yaradın:
   - Name: `Monaco`
   - ISO Code: (boş buraxın)
   - Latitude: `43.7384`
   - Longitude: `7.4246`

3. **Saxlayın və Edit səhifəsinə keçin**

4. **Restoranları çəkin:**
   - "Popüler Restoranlar" → 🌍 Auto Fetch
   - Sistem avtomatik olaraq koordinatları istifadə edəcək
   - 100km radius ərazidən restoran axtaracaq

5. **Nəticə:**
   - Monaco və ətraf ərazilərdən (Nice, Menton) restoranlar tapılacaq

---

## 🔍 Müxtəlif Ssenari Nümunələri

### ✅ Uğurlu Ssenari

**Şərait:**
- ✅ ISO Code: `GB`
- ✅ Latitude & Longitude doldurulub
- ✅ Internet bağlantısı stabil

**Nəticə:**
```
✅ 20 restoran OpenStreetMap'ten başarıyla çekildi!
```

---

### ⚠️ İSO Kod olmadan (Koordinatlarla)

**Şərait:**
- ❌ ISO Code: boş
- ✅ Latitude: `51.5074`
- ✅ Longitude: `-0.1278`

**Nəticə:**
```
✅ 18 otel OpenStreetMap'ten başarıyla çekildi!
(100km radius ərazidən)
```

---

### ❌ Xəta Ssenarisi 1: Heç bir məlumat yoxdur

**Şərait:**
- ❌ ISO Code: boş
- ❌ Latitude: boş
- ❌ Longitude: boş

**Nəticə:**
```
❌ Lütfen ISO kodu veya enlem/boylam bilgilerini girin
```

**Həll:**
1. REST Countries API-dən avtomatik çəkin (🚀 API'den Çek düyməsi)
2. Və ya manuel daxil edin

---

### ❌ Xəta Ssenarisi 2: Məlumat tapılmadı

**Şərait:**
- ✅ ISO Code: `NU` (Niue - kiçik ada ölkəsi)
- ✅ Latitude & Longitude doldurulub
- ⚠️ OpenStreetMap-də məlumat çox azdır

**Nəticə:**
```
❌ No restaurants found for this country. Please make sure the country has an ISO code or coordinates set.
```

**Həll:**
- Manuel olaraq restoran və otel əlavə edin
- Və ya Google Places və ya başqa mənbədən məlumat əlavə edin

---

## 💡 Tövsiyələr

### 1. Optimal İstifadə

```
Əvvəlcə ISO kodu daxil edin (🚀 API'den Çek ilə)
↓
Sonra Auto Fetch istifadə edin (🌍 Auto Fetch)
↓
Nəticələri yoxlayın və əlavə düzəliş edin
↓
Saxlayın (Kaydet)
```

### 2. Məlumat Keyfiyyətini Yaxşılaşdırma

OpenStreetMap-dən çəkilən məlumatlar bəzən eksik ola bilər:
- ❌ Şəkil yoxdursa → Manuel upload edin
- ❌ Website yoxdursa → Google-da axtarıb əlavə edin
- ❌ Telefon yoxdursa → Resmi saytdan tapıb əlavə edin

### 3. Toplu (Batch) İstifadə

Çox ölkə üçün məlumat çəkəcəksinizsə:
1. `/admin/countries` siyahı səhifəsinə keçin
2. Hər ölkə üçün 🍽️ və 🏨 düymələrinə klikləyin
3. Bir-bir bütün ölkələr üçün məlumat çəkin

---

## 🎬 Video Tutorial (Konseptual)

### Addım 1: Ölkə Seçimi
```
Admin Panel → Countries → [Select Country] → Edit
```

### Addım 2: ISO Kod Yoxlama
```
Əgər ISO kodu yoxdursa:
  → 🚀 API'den Çek düyməsinə basın
  → ISO kodu və koordinatlar avtomatik doldurulacaq
```

### Addım 3: Auto Fetch
```
Popüler Restoranlar bölməsi:
  → 🌍 Auto Fetch düyməsinə basın
  → 10-20 saniyə gözləyin
  → ✅ Nəticə mesajı görünəcək

Popüler Oteller bölməsi:
  → 🌍 Auto Fetch düyməsinə basın
  → 10-20 saniyə gözləyin
  → ✅ Nəticə mesajı görünəcək
```

### Addım 4: Düzəliş və Saxlama
```
Məlumatları yoxlayın:
  → Şəkil əlavə edin (əgər yoxdursa)
  → Website düzəldin
  → Telefon əlavə edin

Kaydet düyməsinə basın
  → ✅ Dəyişikliklər saxlanıldı
```

---

## 📊 Performance Məlumatları

### Ölkə Ölçüsünə görə Çəkmə Vaxtı

| Ölkə | ISO | Restoran Sayı | Vaxt | Otel Sayı | Vaxt |
|------|-----|---------------|------|-----------|------|
| 🇦🇿 Azərbaycan | AZ | 15-20 | 8-12s | 12-18 | 8-12s |
| 🇹🇷 Türkiyə | TR | 20 | 10-15s | 20 | 10-15s |
| 🇬🇧 İngiltərə | GB | 20 | 12-18s | 20 | 12-18s |
| 🇲🇨 Monako | - | 8-12 | 6-10s | 5-8 | 6-10s |
| 🇩🇪 Almaniya | DE | 20 | 15-20s | 20 | 15-20s |

---

## ⚙️ Developer Nümunələri

### API-dən birbaşa istifadə (Advanced)

```typescript
// Frontend-dən
const response = await fetch('/api/admin/countries/123/fetch-venues', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'restaurants' })
})

const data = await response.json()

if (data.success) {
  console.log(`${data.data.count} restoran çəkildi`)
  console.log(data.data.venues)
} else {
  console.error(data.error)
}
```

### Utility funksiyalardan istifadə

```typescript
import { fetchRestaurantsFromOSM } from '@/lib/utils/venue-fetcher'

const restaurants = await fetchRestaurantsFromOSM('AZ', 20)
console.log(restaurants)
```

---

**Son yenilənmə:** 2025  
**Versiya:** 1.0.0

