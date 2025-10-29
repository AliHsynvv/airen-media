# Airen Media 🌍✈️

Modern travel media platform with AI-powered features, real-time weather, and community engagement.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- OpenWeatherMap API key (free)

### Environment Setup

Create `.env.local` file in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Weather Widget (Get free key at https://openweathermap.org/api)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_weather_api_key
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🌤️ Weather Widget

The platform includes a real-time weather widget for country pages.

**Features:**
- 🌡️ Real-time temperature
- 🌤️ Weather conditions
- 💨 Wind, humidity, pressure
- 🏙️ Multiple cities per country
- 📊 Min/Max temperatures

**Setup:**
1. Get free API key: [OpenWeatherMap](https://openweathermap.org/api)
2. Add to `.env.local`: `NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key`
3. Without API key, **demo data** will be shown automatically

**Details:** See [WEATHER_SETUP.md](./WEATHER_SETUP.md) for complete guide.

## 💱 Currency Exchange

Real-time currency exchange calculator with:
- Live exchange rates from exchangerate-api.com
- Multi-currency comparison
- Beautiful modern UI
- Popular currency quick-select

## 📚 Documentation

- **[WEATHER_SETUP.md](./WEATHER_SETUP.md)** - Complete weather widget setup guide
- **[IMAGE_GUIDELINES.md](./IMAGE_GUIDELINES.md)** - Country image upload standards (21:9 ratio)
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database structure and schema

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Maps:** Leaflet.js
- **Weather:** OpenWeatherMap API
- **Currency:** ExchangeRate API
- **Icons:** Lucide React
- **i18n:** next-intl

## 🌍 Key Features

### Country Pages
- ✅ 21:9 Cinematic hero images
- ✅ Real-time weather widget
- ✅ Interactive maps (Leaflet)
- ✅ Currency exchange calculator
- ✅ Reviews & ratings
- ✅ Popular restaurants & hotels
- ✅ Travel stats & insights
- ✅ AI-powered advice

### Community
- ✅ User stories with images
- ✅ Comments & likes
- ✅ Social follow system
- ✅ Notifications feed
- ✅ User profiles

### Admin Panel
- ✅ Country management
- ✅ Article/news publishing
- ✅ User management
- ✅ Image uploads (Supabase Storage)
- ✅ REST Countries API integration
- ✅ Modern dark neon theme

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── countries/          # Country pages
│   ├── admin/              # Admin panel
│   ├── api/                # API routes
│   └── community/          # Community features
├── components/
│   ├── countries/          # Country-specific components
│   │   ├── WeatherWidget.tsx
│   │   ├── CurrencyExchange.tsx
│   │   └── CountryReviews.tsx
│   ├── business/           # Business/venue components
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── supabase/           # Supabase client & utils
│   └── hooks/              # Custom React hooks
└── types/                  # TypeScript types
```

## 🗄️ Database

### Key Tables
- `countries` - Country data with geo, weather cities, venues
- `articles` - Travel articles & blog posts
- `country_reviews` - User reviews for countries
- `stories` - Community stories (Instagram-like)
- `profiles` - User profiles
- `notifications` - Real-time notifications

### Storage Buckets
- `Countries` - Country featured images
- `Venues` - Restaurant & hotel images
- `Articles` - Article images
- `Profiles` - User avatars
- `Stories` - Story media

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Environment Variables (Production)
Add these in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_OPENWEATHER_API_KEY`

## 🧪 Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Adding a New Country

1. **Admin Panel**: `/admin/countries/create`
2. **Fill Data**:
   - Basic info (name, capital, population)
   - Click "🚀 API'den Çek" to auto-fill from REST Countries API
   - Add popular cities for weather (comma-separated)
   - Upload 21:9 featured image (2560x1080px recommended)
   - Add restaurants & hotels with images
3. **Save**: Country will be live immediately

## 🌐 i18n Support

Supported languages:
- 🇬🇧 English
- 🇹🇷 Turkish
- 🇷🇺 Russian

Add translations in `src/i18n/messages/`

## 📦 API Integrations

### OpenWeatherMap (Weather)
- **Free Tier**: 1,000 calls/day, 60/minute
- **Get Key**: https://openweathermap.org/api
- **Auto Demo Mode**: If no key, shows demo data

### REST Countries API (Country Data)
- **Free**: No key required
- **Auto-fetch**: Currency, capital, timezone, language, coordinates
- **Used in**: Admin panel country creation

### ExchangeRate API (Currency)
- **Free Tier**: 1,500 calls/month
- **No key required** for basic usage
- **Real-time rates**: Updated daily

## 🤝 Contributing

This is a private project. For feature requests or bugs, contact the team.

## 📄 License

Proprietary - All rights reserved.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
