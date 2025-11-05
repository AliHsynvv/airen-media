# Google Places API - Quraşdırma Təlimatı

## 🌟 Niyə Google Places API?

| Məlumat | OpenStreetMap | Google Places |
|---------|--------------|---------------|
| Şəkil Keyfiyyəti | 0-30% | **90-95%** ✅ |
| Website URL | 35-45% | **80-90%** ✅ |
| Telefon | 25-35% | **75-85%** ✅ |
| Reytinq (⭐) | ❌ Yox | **✅ 5 ulduz sistemi** |
| İstifadəçi Rəyləri | ❌ Yox | **✅ Rəylər** |
| İş Saatları | ❌ Az | **✅ Tam** |
| Qiymət Səviyyəsi | ❌ Yox | **✅ $ - $$$$** |
| Məlumat Tazəliyi | Yavaş yenilənir | **✅ Real-time** |

## 💰 Qiymətləndirmə

### İlk $200 Hər Ay PULSUZ! 🎉

Google Cloud yeni istifadəçilərə **hər ay $200 pulsuz kredit** verir.

**Bu nə deməkdir:**
- ✅ ~6,250 pulsuz nearby search/ay
- ✅ ~11,750 pulsuz place details/ay
- ✅ ~28,500 pulsuz photo request/ay

**Kiçik və orta layihələr üçün tamamilə pulsuz!**

### Qiymət Cədvəli (əgər $200-ü keçsəniz)

| API | Qiymət (1000 sorğu) | Pulsuz Limit/ay |
|-----|---------------------|-----------------|
| Nearby Search | $32 | ~6,250 |
| Place Details | $17 | ~11,750 |
| Place Photos | $7 | ~28,500 |
| Text Search | $32 | ~6,250 |

## 📋 Addım-addım Quraşdırma

### 1️⃣ Google Cloud Console-a Daxil Olun

1. https://console.cloud.google.com/ səhifəsinə gedin
2. Google hesabınızla daxil olun
3. **Yeni Project** yaradın (və ya mövcud olanı seçin)
   - Project adı: `airen-media` (və ya istədiyiniz ad)
   - Billing Account-u aktivləşdirin (kredit kartı tələb olunur, amma ilk $200 pulsuz)

### 2️⃣ Places API-ni Aktivləşdirin

1. Sol menyudan **APIs & Services** → **Library** seçin
2. Axtarış sahəsində `Places API` yazın
3. **Places API (New)** seçin və **Enable** düyməsinə klikləyin
4. Həmçinin **Places API** (legacy) də aktivləşdirin

### 3️⃣ API Key Yaradın

1. **APIs & Services** → **Credentials** seçin
AIzaSyBrnFPkNzuOBCj056873x9ep4hql7FQaCI
2. **+ CREATE CREDENTIALS** → **API Key** seçin
3. API key yaradılacaq (məs: `AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxx`)
4. **COPY** edin və saxlayın

### 4️⃣ API Key-i Məhdudlaşdırın (Təhlükəsizlik)

⚠️ **ÇOX ƏHƏMİYYƏTLİ**: API key-inizi məhdudlaşdırın!

1. Yeni yaradılan API key-in yanında **✏️ Edit** klikləyin
2. **API restrictions** bölməsində:
   - **Restrict key** seçin
   - Yalnız bu API-ləri seçin:
     - ✅ Places API (New)
     - ✅ Places API
3. **Application restrictions** (opsional):
   - **HTTP referrers (web sites)** seçin
   - Domen əlavə edin: `yourdomain.com/*`
4. **SAVE** edin

### 5️⃣ `.env.local` Faylına Əlavə Edin

Layihənizin root qovluğunda `.env.local` faylını redaktə edin:

```bash
# Mövcud Supabase konfiqurasiyaları...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Google Places API
GOOGLE_PLACES_API_KEY=AIzaSyBrnFPkNzuOBCj056873x9ep4hql7FQaCI
```

### 6️⃣ Development Server-i Yenidən Başladın

```bash
# Əvvəlcə server-i dayandırın (Ctrl+C)
# Sonra yenidən başladın
npm run dev
```

## ✅ Test Edin

1. Admin Panel → Countries → [İstədiyiniz ölkə] → Edit
2. Koordinatları doldurduğunuzdan əmin olun
3. **🌍 Auto Fetch** düyməsinə klikləyin
4. Console-da bu mesajı görməlisiniz:
   ```
   🔍 Attempting to fetch restaurants from Google Places for Azerbaijan...
   ✅ Successfully fetched 20 restaurants from Google Places
   ```

## 🔍 Troubleshooting

### API Key işləmir

**Problem:** "GOOGLE_PLACES_API_KEY is not set"

**Həll:**
1. `.env.local` faylının root qovluqda olduğunu yoxlayın
2. Fayl adının düzgün olduğunu yoxlayın (`.env.local` - nöqtə ilə başlamalıdır)
3. Development server-i yenidən başladın

### API Error: REQUEST_DENIED

**Problem:** "This API project is not authorized to use this API"

**Həll:**
1. Google Cloud Console-da **Places API** və **Places API (New)** aktivləşdirdiyinizi yoxlayın
2. Billing Account aktivləşdirdiyinizi yoxlayın

### API Error: OVER_QUERY_LIMIT

**Problem:** Aylıq limiti keçmisiniz

**Həll:**
1. Google Cloud Console → Billing → Budgets & alerts
2. Budget alertləri quraşdırın
3. API istifadəsini azaldın və ya ödəniş planı yükseldin

### Şəkillər yüklənmir

**Problem:** Şəkil URL-ləri işləmir

**Həll:**
- Google Places şəkil URL-lərinə API key lazımdır
- Sistem avtomatik olaraq API key əlavə edir
- Browser console-da xəta yoxlayın

## 💡 Tövsiyələr

### 1. Budget Alertləri Quraşdırın

1. Google Cloud Console → Billing → Budgets & alerts
2. Yeni budget yaradın:
   - Budget amount: $50 (və ya $200)
   - Alert thresholds: 50%, 75%, 90%, 100%
3. E-mail bildirişləri aktivləşdirin

### 2. API İstifadəsini İzləyin

1. Google Cloud Console → APIs & Services → Dashboard
2. İstifadə statistikalarını yoxlayın
3. Gündəlik və aylıq trends-ə baxın

### 3. Cache Mexanizmi İstifadə Edin (Gələcək)

- Tez-tez sorğu göndərilən ölkələrin məlumatlarını cache-ləyin
- Database-də `cached_at` field əlavə edin
- 7 gün ərzində yenidən sorğu göndərməyin

### 4. Fallback Strategiyası

Sistem avtomatik olaraq bu strategiyanı izləyir:

```
1. Google Places (əgər API key varsa) → ən yaxşı keyfiyyət
   ⬇️ (əgər xəta varsa)
2. OpenStreetMap (ISO kod) → orta keyfiyyət
   ⬇️ (əgər nəticə yoxdursa)
3. OpenStreetMap (Koordinatlar) → orta keyfiyyət
```

## 🎯 Optimal İstifadə

### Kiçik Layihə (< 100 ölkə)
- ✅ Google Places istifadə edin
- ✅ Hər ay tam pulsuz
- ✅ Ən yaxşı məlumat keyfiyyəti

### Orta Layihə (100-500 ölkə)
- ✅ Google Places + Cache
- ⚠️ Budget alert quraşdırın
- ✅ Hələ də əksərən pulsuz

### Böyük Layihə (500+ ölkə)
- ⚠️ Hybrid yanaşma: Google + OSM
- 💰 Budget planlaması lazımdır
- 🔧 Cache mexanizmi mütləqdir

## 📚 Əlavə Resurslar

- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator)
- [Places API Quota Policies](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)

## 🆘 Dəstək

Suallar və ya problemlər üçün:
- Google Cloud Support: https://cloud.google.com/support
- Stack Overflow: `google-places-api` tag

---

**Quraşdırıldı:** ✅  
**Son Yenilənmə:** 2025  
**Versiya:** 2.0.0
