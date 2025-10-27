# Weather Widget Setup 🌤️

## Overview
Dynamic weather widget that shows real-time temperature and weather data for cities in each country using OpenWeatherMap API.

## Features ✨
- 🌡️ Real-time temperature display
- 🌤️ Weather conditions with icons
- 💨 Wind speed
- 💧 Humidity
- 👁️ Visibility
- 📊 Pressure
- 🏙️ City selector (dropdown)
- 📍 Auto-detect from coordinates
- 🎨 Modern glassmorphism UI

## Setup Instructions

### 1. Get OpenWeatherMap API Key (FREE)

1. Go to [https://openweathermap.org/api](https://openweathermap.org/api)
2. Click "Sign Up" (ücretsiz)
3. Email verify edin
4. Dashboard → API Keys
5. Copy your API key

### 2. Add to Environment Variables

Create `.env.local` file in project root:

```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
```

### 3. Database Setup (Optional - for custom cities)

Add `popular_cities` column to `countries` table:

```sql
ALTER TABLE countries 
ADD COLUMN popular_cities text[] DEFAULT '{}';
```

### 4. Admin Panel Usage

Edit any country → Add cities:
```
Istanbul, Ankara, Izmir, Antalya, Bodrum
```

Comma-separated city names. These will appear in the weather dropdown.

## Default Cities

If no cities are specified in the database, the widget uses these defaults:

- **Turkey**: Istanbul, Ankara, Izmir, Antalya, Bodrum
- **United Kingdom**: London, Manchester, Edinburgh, Birmingham, Liverpool
- **France**: Paris, Marseille, Lyon, Nice, Bordeaux
- **Spain**: Madrid, Barcelona, Valencia, Seville, Bilbao
- **Italy**: Rome, Milan, Venice, Florence, Naples
- **Germany**: Berlin, Munich, Hamburg, Frankfurt, Cologne
- **USA**: New York, Los Angeles, Chicago, Miami, San Francisco

## API Limits (Free Tier)

OpenWeatherMap Free Plan:
- ✅ 1,000 API calls/day
- ✅ 60 calls/minute
- ✅ Current weather data
- ✅ All our features work!

This is more than enough for normal usage. Each page load makes 1 call, and results are cached client-side.

## Widget Location

The weather widget appears in the **sidebar** of country detail pages:
- Top of sidebar
- Above "Travel Stats"
- Always visible

## UI Elements

### Main Display
- **Large temperature**: Current temp in °C
- **Weather icon**: Dynamic (sun, cloud, rain, etc.)
- **Description**: "Clear sky", "Partly cloudy", etc.
- **Feels like**: Apparent temperature

### Details Grid
- Wind: km/h
- Humidity: %
- Visibility: km
- Pressure: hPa

### Min/Max
- Minimum temperature (blue)
- Maximum temperature (red)

### City Selector
- Dropdown button (top-right)
- Click to expand
- Select any city
- Auto-refresh weather

## Code Structure

```
src/
├── components/
│   └── countries/
│       └── WeatherWidget.tsx          # Main weather component
├── app/
│   └── countries/
│       └── [slug]/
│           └── page.tsx                # Usage: <WeatherWidget />
├── types/
│   └── country.ts                      # Type: popular_cities?: string[]
└── app/api/admin/countries/
    ├── route.ts                        # CREATE: popular_cities
    └── [id]/route.ts                   # UPDATE: popular_cities
```

## Testing

1. **Without API Key**: Shows demo mode / error
2. **With API Key**: Real-time data
3. **No cities specified**: Uses default cities
4. **With coordinates**: Falls back to lat/lng

## Troubleshooting

### "Unable to load weather data"
- Check API key in `.env.local`
- Verify API key is active on OpenWeatherMap
- Check browser console for errors

### Cities not showing
- Add popular_cities in admin panel
- Format: "City1, City2, City3"
- Use English city names

### Wrong temperature
- API returns Celsius by default ✅
- If you see weird values, check city name spelling

## API Response Example

```json
{
  "weather": [{
    "description": "clear sky",
    "icon": "01d"
  }],
  "main": {
    "temp": 25.5,
    "feels_like": 24.8,
    "temp_min": 23.0,
    "temp_max": 27.0,
    "humidity": 65,
    "pressure": 1013
  },
  "wind": {
    "speed": 3.5
  },
  "visibility": 10000,
  "name": "Istanbul"
}
```

## Customization

### Change Temperature Unit
In `WeatherWidget.tsx`, line 58:
```tsx
`&units=metric`  // Celsius
`&units=imperial`  // Fahrenheit
```

### Add More Weather Info
OpenWeatherMap provides:
- UV Index
- Air Quality
- Hourly Forecast
- 5-day Forecast

All available in paid plans or different endpoints.

### Styling
The widget uses:
- Tailwind CSS
- Gradient backgrounds
- Glassmorphism effects
- Lucide icons

Customize in `WeatherWidget.tsx` component.

## Performance

- ✅ Dynamic import (code splitting)
- ✅ Client-side only (no SSR overhead)
- ✅ Cached in component state
- ✅ Minimal re-renders
- ✅ Async data loading

## Future Enhancements

Possible additions:
- 📅 5-day forecast
- 🕐 Hourly breakdown
- 🌙 Day/Night themes
- 🗺️ Weather map overlay
- 📊 Historical data
- ⚠️ Weather alerts

## Support

OpenWeatherMap Documentation:
- [Current Weather API](https://openweathermap.org/current)
- [API Guide](https://openweathermap.org/guide)
- [FAQ](https://openweathermap.org/faq)

## License

Weather data provided by OpenWeatherMap.
Free tier: Unlimited for personal/commercial use.

