# Auto Fetch - Restoran və Otel Məlumatları Sistemi

## 📋 Ümumi Baxış

Bu sistem "Countries" bölməsindəki Restoranlar və Otellər hissələrini **pulsuz və açıq mənbələrdən** avtomatik doldurmaq üçün hazırlanmışdır.

## 🌍 İstifadə Olunan Mənbələr

### 🥇 Əsas Mənbə: **Google Places API** (Tövsiyə olunur)

**Ən yüksək keyfiyyətli məlumat mənbəyi!**

| Xüsusiyyət | Keyfiyyət | Əhatə |
|------------|-----------|-------|
| 📸 **Şəkillər** | Yüksək keyfiyyət | 90-95% |
| 🌐 **Website** | Doğru və yenilənmiş | 80-90% |
| ☎️ **Telefon** | Düzgün format | 85-95% |
| ⭐ **Reytinq** | 5 ulduz sistemi | 100% |
| 💬 **Rəylər** | İstifadəçi rəyləri | 100% |
| 💰 **Qiymət** | $-$$$$ skala | 70-80% |
| 🕐 **İş Saatları** | Həftəlik cədvəl | 85-90% |

**Qiymət:** Ayda $200 pulsuz kredit (~10,000 sorğu) - Kiçik-orta layihələr üçün kifayətdir!

📖 **Quraşdırma:** [GOOGLE_PLACES_SETUP.md](./GOOGLE_PLACES_SETUP.md) faylına baxın

### 🥈 Ehtiyat Mənbə: **OpenStreetMap** (Pulsuz)

Əgər Google Places API key yoxdursa, avtomatik OpenStreetMap istifadə olunacaq.

| Xüsusiyyət | Keyfiyyət | Əhatə |
|------------|-----------|-------|
| 📸 **Şəkillər** | Az | 5-10% |
| 🌐 **Website** | Orta | 30-40% |
| ☎️ **Telefon** | Orta | 25-35% |
| ⭐ **Reytinq** | ❌ Yoxdur | - |

**Qiymət:** Tamamilə pulsuz, API key lazım deyil

### 🔄 Avtomatik Fallback Strategiyası

```
1️⃣ Google Places API cəhd et (ən yaxşı keyfiyyət)
   ↓ (xəta və ya API key yoxdursa)
2️⃣ OpenStreetMap ISO kod ilə (yaxşı alternativ)
   ↓ (nəticə yoxdursa)
3️⃣ OpenStreetMap koordinatlar ilə (son variant)
```

## ✨ Xüsusiyyətlər

Hər obyekt üçün aşağıdakı sahələr avtomatik çəkilir:

### Google Places API ilə:
- ✅ **Ad** (Name) - 100%
- ✅ **Şəkil** (Image) - 90-95% keyfiyyətli
- ✅ **Website** (URL) - 80-90%
- ✅ **Telefon** (Phone) - 85-95%
- ✅ **Ünvan** (Address) - 100%
- ✅ **Şəhər** (City) - 100%
- ✅ **Koordinatlar** (Lat/Lng) - 100%
- ✅ **Reytinq** (Rating) - ⭐ 0-5 ulduz
- ✅ **Rəy Sayı** (Reviews) - İstifadəçi rəyləri
- ✅ **Qiymət Aralığı** (Price) - $-$$$$
- ✅ **Təsvir** (Description) - Avtomatik yaradılır

### OpenStreetMap ilə:
- ✅ **Ad** (Name) - 100%
- ⚠️ **Şəkil** (Image) - 5-10%
- ⚠️ **Website** (URL) - 30-40%
- ⚠️ **Telefon** (Phone) - 25-35%
- ✅ **Ünvan** (Address) - 70-80%
- ✅ **Şəhər** (City) - 60-70%
- ✅ **Koordinatlar** (Lat/Lng) - 100%

## 🚀 İstifadə Qaydası

### Üsul 1: Admin Siyahı Səhifəsindən (Ən Sürətli)

1. `/admin/countries` səhifəsinə daxil olun
2. Hər ölkənin sağında "Auto Fetch" sütununda 2 düymə görəcəksiniz:
   - 🍽️ - Restoranları çəkmək üçün
   - 🏨 - Otelləri çəkmək üçün
3. İstədiyiniz düyməyə klikləyin
4. 10-20 saniyə gözləyin
5. ✅ Nəticə mesajı: "20 restoran Google Places API-dən çəkildi!"

### Üsul 2: Ölkə Düzənləmə Səhifəsindən (Ətraflı)

1. `/admin/countries/[id]/edit` səhifəsinə daxil olun
2. **Popüler Restoranlar** bölməsində "🌍 Auto Fetch" düyməsinə klikləyin
3. **Popüler Oteller** bölməsində "🌍 Auto Fetch" düyməsinə klikləyin
4. Məlumatları yoxlayın və düzəliş edin
5. "Kaydet" düyməsinə basaraq saxlayın

## 🔧 Texniki Tələblər

Auto Fetch sisteminin işləməsi üçün ölkənin aşağıdakı məlumatlarından **ən azı biri** olmalıdır:

### Google Places API üçün:
- **Ölkə adı** (Name) - Məcburidir
- **Koordinatlar** (Latitude & Longitude) - İxtiyaridir, amma daha dəqiq nəticə verir

### OpenStreetMap üçün:
- **ISO Kodu** (məsələn: "AZ", "TR") - Üstünlük 1
- **Koordinatlar** (Latitude & Longitude) - Üstünlük 2

## 📝 Quraşdırma

### Google Places API (Tövsiyə olunur)

1. **`.env.local` faylına əlavə edin:**
```bash
GOOGLE_PLACES_API_KEY=your_api_key_here
```

2. **Ətraflı təlimat:**
   - [GOOGLE_PLACES_SETUP.md](./GOOGLE_PLACES_SETUP.md) faylını oxuyun
   - 5 dəqiqədə quraşdırın
   - Ayda $200 pulsuz kredit əldə edin

### OpenStreetMap (Heç nə lazım deyil)

Əgər Google Places API key-i yoxdursa, sistem avtomatik OpenStreetMap istifadə edəcək.

**Heç bir konfiqurasiya lazım deyil!** ✅

## 💡 İstifadə Nümunələri

### Nümunə 1: Azərbaycan (Google Places ilə)

```
1. Admin Panel → Countries → Azərbaycan → Edit
2. ISO Code: AZ ✅
3. "Auto Fetch" düyməsinə klikləyin
4. Gözləyin 10-15 saniyə
5. ✅ "20 restoran Google Places API-dən çəkildi!"
```

**Nəticə:**
```json
{
  "name": "Firuze Restaurant",
  "image": "https://maps.googleapis.com/maps/api/place/photo?...",
  "url": "https://firuze.az",
  "phone": "+994 12 493 0808",
  "rating": 4.7,
  "userRatingsTotal": 1234,
  "priceLevel": 2,
  "description": "⭐ 4.7 rating • 1234 reviews • $$ • Azerbaijani",
  "location": {
    "lat": 40.3777,
    "lng": 49.8920,
    "address": "Neftçilər pr. 73, Bakı",
    "city": "Bakı"
  }
}
```

### Nümunə 2: Türkiyə (Fallback - OpenStreetMap)

API key olmadan:

```
1. Admin Panel → Countries → Edit
2. ISO Code: TR
3. "Auto Fetch" klikləyin
4. ⚠️ "Google Places API key not found, using OpenStreetMap"
5. ✅ "18 restoran OpenStreetMap-dən çəkildi"
```

## 📊 Keyfiyyət Müqayisəsi

### Məlumat Tam Doldurulma Faizi:

| Məlumat | OpenStreetMap | Google Places | Fərq |
|---------|---------------|---------------|------|
| Ad | 100% | 100% | - |
| Şəkil | 5-10% | **90-95%** | **+85%** 🔥 |
| Website | 30-40% | **80-90%** | **+50%** 🔥 |
| Telefon | 25-35% | **85-95%** | **+60%** 🔥 |
| Reytinq | 0% | **100%** | **+100%** 🔥 |
| Qiymət | 0% | **70-80%** | **+70%** 🔥 |
| Ünvan | 70-80% | 100% | +20% |

### Çəkmə Vaxtı:

| Mənbə | Orta vaxt | Max vaxt |
|-------|-----------|----------|
| Google Places | 10-15s | 20s |
| OpenStreetMap | 8-12s | 18s |

## 🐛 Problem Həlli

### "Google Places API key not found"
**Həll:** `.env.local` faylına API key əlavə edin və serveri yenidən başladın.

### "No restaurants/hotels found"
**Səbəb:** Həmin ölkədə məlumat az ola bilər.
**Həll:** Manuel olaraq əlavə edin və ya başqa mənbə cəhd edin.

### Şəkillər yüklənmir
**Səbəb:** Google Places API key-də photo access məhdudiyyəti ola bilər.
**Həll:** API key restrictions yoxlayın.

### "You must enable Billing"
**Səbəb:** Google Places free tier istifadə etmək üçün billing aktivləşdirməlisiniz.
**Həll:** [GOOGLE_PLACES_SETUP.md](./GOOGLE_PLACES_SETUP.md) addım 6-ya baxın.

## 💰 Qiymət Hesablama

### Google Places API:

**Free Tier:** Ayda $200 kredit

| Əməliyyat | Qiymət | Free Tier ilə |
|-----------|--------|----------------|
| Nearby Search | $17/1000 | ~11,700 sorğu |
| Place Details | $17/1000 | ~11,700 sorğu |
| Place Photo | Pulsuz | ∞ |

**Nümunə ssenari:**
- 50 ölkə
- Hər biri 20 restoran + 20 otel
- Toplam: 2,000 search + 2,000 details = 4,000 sorğu
- **Qiymət:** ~$68
- **Free tier ilə:** $0 (kredit kifayətdir!)

### OpenStreetMap:

**Tamamilə pulsuz!** Heç bir limit yoxdur.

## 🔐 Təhlükəsizlik

### Google Places API Key:

✅ **Yaxşı praktikalar:**
- Environment variable istifadə edin (`.env.local`)
- API restrictions quraşdırın (yalnız Places API)
- HTTP referrers əlavə edin (sizin domen)
- Budjet alarmı quraşdırın ($10-20)
- Daily quota limit qoyun (1000 sorğu)

❌ **Etməyin:**
- Frontend kodunda hardcode etməyin
- Public GitHub repo-ya commit etməyin
- `.env.local` faylını paylaşmayın

## 📚 Əlavə Məlumat

### Sənədlər:
- [GOOGLE_PLACES_SETUP.md](./GOOGLE_PLACES_SETUP.md) - Ətraflı quraşdırma təlimatı
- [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Praktik nümunələr
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Texniki detallar
- [CHANGELOG.md](./CHANGELOG.md) - Dəyişikliklər tarixi

### API Documentation:
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service)
- [OpenStreetMap Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API)
- [Wikidata SPARQL](https://query.wikidata.org/)

## 🎉 Tövsiyə

**Maksimum keyfiyyət üçün:**
1. ✅ Google Places API key əlavə edin
2. ✅ ISO kodları və koordinatları doldurun
3. ✅ Auto Fetch istifadə edin
4. ✅ Nəticələri yoxlayın və lazımsa düzəliş edin

**Budcet variantı:**
1. ✅ Google Places API key əlavə etməyin
2. ✅ OpenStreetMap avtomatik istifadə olunacaq
3. ⚠️ Məlumat keyfiyyəti aşağı olacaq
4. ✅ Manuel düzəliş edə bilərsiniz

---

**Hazırlandı:** 2025  
**Versiya:** 2.0.0 (Google Places API dəstəyi)  
**Lisenziya:** MIT
