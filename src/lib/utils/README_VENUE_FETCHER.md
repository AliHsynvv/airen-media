# Venue Fetcher Utility

Bu utility modul OpenStreetMap və digər açıq mənbələrdən restoran və otel məlumatlarını çəkmək üçün hazırlanmışdır.

## Funksiyalar

### `fetchRestaurantsFromOSM(countryISOCode: string, limit: number = 20): Promise<VenueResult[]>`

OpenStreetMap-dən ölkə ISO koduna görə restoranları çəkir.

**Parametrlər:**
- `countryISOCode` - Ölkənin ISO 3166-1 alpha-2 kodu (məs: "AZ", "TR")
- `limit` - Maksimum nəticə sayı (default: 20)

**Qaytarır:** VenueResult massivi

**Nümunə:**
```typescript
const restaurants = await fetchRestaurantsFromOSM("AZ", 20)
```

### `fetchHotelsFromOSM(countryISOCode: string, limit: number = 20): Promise<VenueResult[]>`

OpenStreetMap-dən ölkə ISO koduna görə otelləri çəkir.

**Parametrlər:**
- `countryISOCode` - Ölkənin ISO 3166-1 alpha-2 kodu
- `limit` - Maksimum nəticə sayı (default: 20)

**Nümunə:**
```typescript
const hotels = await fetchHotelsFromOSM("TR", 20)
```

### `fetchRestaurantsByCoordinates(lat: number, lng: number, radiusKm: number = 100, limit: number = 20): Promise<VenueResult[]>`

Koordinatlara görə radius ərazisindəki restoranları çəkir.

**Parametrlər:**
- `lat` - Enlik
- `lng` - Uzunluq
- `radiusKm` - Radius (km, default: 100)
- `limit` - Maksimum nəticə sayı (default: 20)

**Nümunə:**
```typescript
const restaurants = await fetchRestaurantsByCoordinates(40.4093, 49.8671, 50, 15)
```

### `fetchHotelsByCoordinates(lat: number, lng: number, radiusKm: number = 100, limit: number = 20): Promise<VenueResult[]>`

Koordinatlara görə radius ərazisindəki otelləri çəkir.

**Nümunə:**
```typescript
const hotels = await fetchHotelsByCoordinates(40.4093, 49.8671, 50, 15)
```

## VenueResult Interface

```typescript
interface VenueResult {
  name: string              // Məkanın adı
  image?: string            // Şəkil URL-i
  url?: string              // Website URL-i
  description?: string      // Təsvir
  location?: {
    lat?: number           // Enlik
    lng?: number           // Uzunluq
    address?: string       // Ünvan
    city?: string          // Şəhər
  }
  rating?: number          // Reytinq (future)
  phone?: string           // Telefon nömrəsi
  website?: string         // Website
}
```

## Overpass API

Bu utility Overpass API istifadə edir - OpenStreetMap məlumatlarını sorğulamaq üçün API.

**API Endpoint:** `https://overpass-api.de/api/interpreter`

**Rate Limits:**
- Gündəlik təxminən 10,000 sorğu
- Hər sorğu üçün 25 saniyə timeout
- Fair use policy

## Wikidata Şəkillər

Wikidata-dan şəkil çəkmək funksiyası hazırda performans üçün deaktivdir. 

Aktivləşdirmək üçün `venue-fetcher.ts` faylında comment-dən çıxarın:
```typescript
// Fetch images in parallel (max 5 at a time)
const imageFetchPromises = ...
```

## Xəta İdarəetməsi

Bütün funksiyalar xətaları `throw` edir. İstifadə edərkən try-catch bloku istifadə edin:

```typescript
try {
  const restaurants = await fetchRestaurantsFromOSM("AZ")
  console.log(`${restaurants.length} restoran tapıldı`)
} catch (error) {
  console.error("Xəta:", error.message)
}
```

## Məhdudiyyətlər

1. **Məlumat keyfiyyəti** - OpenStreetMap könüllülər tərəfindən doldurulur, bəzi məlumatlar eksik ola bilər
2. **Şəkillər** - Hamısının şəkili olmaya bilər
3. **Performans** - Böyük radius və ya çox limit istifadə etdikdə yavaş ola bilər
4. **Rate Limit** - Çox tez-tez sorğu göndərdikdə Overpass API məhdudiyyət qoya bilər

## Best Practices

1. Mümkün olduqda ISO kod istifadə edin (daha dəqiq)
2. Limit-i 20-50 arasında saxlayın
3. Rate limit-i aşmamaq üçün sorğuları cache-ləyin
4. Timeout xətalarını handle edin
5. Məlumatları local database-ə save edin və daimi olaraq yeniləyin

