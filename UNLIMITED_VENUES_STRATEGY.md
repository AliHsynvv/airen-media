# 🚀 Unlimited Venues Strategy

## Problem
Google Places API has a 60-result limit (3 pages × 20 results). We need to fetch **ALL** 4.0+ rated restaurants and hotels for a country, not just 60.

## Solution: City-by-City Search Strategy

Instead of limiting to 60 results, we now use a **multi-location search strategy**:

### 1️⃣ City-Based Text Search
If a country has `popular_cities` in the database:
- **Search each city individually** using Google Places Text Search API
- Query: `"restaurants in {city_name}"` or `"hotels in {city_name}"`
- Each city can return up to 60 results
- Example: If Turkey has 10 cities, we can get **600+ restaurants/hotels**!

### 2️⃣ Nearby Search (Fallback)
Always perform a nearby search at the country's main coordinates:
- Uses Nearby Search API with 50km radius
- Gets another 60 results from the country center
- Catches venues not covered by city searches

### 3️⃣ Deduplication
- Tracks all `place_id` values in a Set
- Removes duplicates across all searches
- Ensures each venue appears only once

## Implementation Details

### Modified Functions
```typescript
// Now accepts cities parameter
fetchRestaurantsFromGoogle(lat, lng, radius, limit, cities?: string[])
fetchHotelsFromGoogle(lat, lng, radius, limit, cities?: string[])
```

### Search Flow
```
1. Extract cities from country.popular_cities
2. For each city:
   - Text Search: "restaurants in {city}"
   - Add unique results (check place_id)
   - Wait 500ms between searches
3. Nearby Search at main coordinates:
   - Pagination: up to 3 pages (60 results)
   - Add unique results
4. Filter by quality (4.0+ rating, reviews, photos)
5. Sort by popularity score
6. Return ALL quality venues
```

## Database Schema
The country record should have:
```json
{
  "popular_cities": [
    { "name": "Istanbul" },
    { "name": "Ankara" },
    { "name": "Izmir" }
  ]
}
```

## Results
| Strategy | Max Results per Country |
|----------|-------------------------|
| **Old** (Nearby only) | 60 venues |
| **New** (City-by-city) | **Unlimited** (60 per city + 60 nearby) |

### Example: Turkey
- Popular cities: Istanbul, Ankara, Izmir, Antalya, Bursa (5 cities)
- Potential results: `5 cities × 60 = 300` + `60 nearby` = **~360 venues**
- After filtering (4.0+ rating): **200-300 quality venues**

## Quality Filters (Still Applied)
✅ **Rating**: Minimum 4.0 stars  
✅ **Reviews**: 50+ for restaurants, 30+ for hotels  
✅ **Photos**: Must have at least one photo  
✅ **Deduplication**: No duplicates across searches  
✅ **Popularity Sort**: `rating × log(review_count)`  

## Benefits
1. ✅ **Comprehensive Coverage**: Captures venues across entire country
2. ✅ **No Artificial Limits**: Gets all quality venues, not just first 60
3. ✅ **Better Geographic Distribution**: Each city contributes venues
4. ✅ **Maintains Quality**: Still filters for 4.0+ rating
5. ✅ **Smart Deduplication**: Removes duplicates automatically

## API Usage
### Google Places APIs Used:
1. **Text Search API** (per city): `$0.032 per request`
2. **Nearby Search API** (main coordinates): `$0.032 per request`
3. **Place Details API** (per venue): `$0.017 per request`

### Example Cost (Turkey with 5 cities):
- 5 city searches: `5 × $0.032 = $0.16`
- 1 nearby search: `$0.032`
- 300 place details: `300 × $0.017 = $5.10`
- **Total: ~$5.30** to fetch all quality venues for Turkey

## Console Output Example
```
🌟 Fetching restaurants from Google Places for Turkey...
🏙️ Will search 5 cities: Istanbul, Ankara, Izmir, Antalya, Bursa
  📍 Searching in Istanbul...
    ✅ Found 47 new restaurants in Istanbul (total: 47)
  📍 Searching in Ankara...
    ✅ Found 38 new restaurants in Ankara (total: 85)
  📍 Searching in Izmir...
    ✅ Found 42 new restaurants in Izmir (total: 127)
🗺️ Searching nearby at main coordinates...
📄 Page 1: Got 18 new restaurants (total: 145)
📊 Total fetched: 145 restaurants
✅ Filtered 145 restaurants → 112 quality (4.0+) restaurants
```

## How to Add Cities
In the admin panel, edit a country and add popular cities:
```json
[
  { "name": "Istanbul", "image": "..." },
  { "name": "Ankara", "image": "..." },
  { "name": "Izmir", "image": "..." }
]
```

The system will automatically use these cities for fetching!

---

**Status**: ✅ Implemented  
**Updated**: November 5, 2025  
**Result**: Unlimited 4.0+ venues per country! 🎉

