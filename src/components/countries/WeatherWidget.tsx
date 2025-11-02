'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, MapPin, ChevronDown, Search } from 'lucide-react'

interface WeatherWidgetProps {
  countryName: string
  cities?: string[]
  latitude?: number
  longitude?: number
}

interface WeatherData {
  temp: number
  feels_like: number
  humidity: number
  wind_speed: number
  description: string
  icon: string
  visibility: number
  pressure: number
  temp_min: number
  temp_max: number
  city: string
}

// Popular cities for countries (fallback if no cities provided)
const defaultCities: Record<string, string[]> = {
  // Europe
  'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bodrum', 'Bursa', 'Konya', 'Adana'],
  'United Kingdom': ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Liverpool', 'Bristol', 'Glasgow'],
  'France': ['Paris', 'Marseille', 'Lyon', 'Nice', 'Bordeaux', 'Toulouse', 'Strasbourg'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Malaga', 'Zaragoza'],
  'Italy': ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Turin', 'Bologna'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Dusseldorf'],
  'Greece': ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa', 'Rhodes'],
  'Portugal': ['Lisbon', 'Porto', 'Faro', 'Coimbra', 'Braga', 'Funchal'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
  'Belgium': ['Brussels', 'Antwerp', 'Ghent', 'Bruges', 'Liege'],
  'Austria': ['Vienna', 'Salzburg', 'Innsbruck', 'Graz', 'Linz'],
  'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne'],
  'Poland': ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan'],
  'Czech Republic': ['Prague', 'Brno', 'Ostrava', 'Plzen', 'Liberec'],
  'Hungary': ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pecs'],
  'Romania': ['Bucharest', 'Cluj-Napoca', 'Timisoara', 'Iasi', 'Constanta'],
  'Bulgaria': ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse'],
  'Croatia': ['Zagreb', 'Split', 'Rijeka', 'Dubrovnik', 'Zadar'],
  'Serbia': ['Belgrade', 'Novi Sad', 'Nis', 'Kragujevac', 'Subotica'],
  'Ukraine': ['Kyiv', 'Kharkiv', 'Odesa', 'Dnipro', 'Lviv'],
  'Russia': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan'],
  'Albania': ['Tirana', 'Durres', 'Vlore', 'Shkoder', 'Fier'],
  
  // Caucasus & Central Asia
  'Azerbaijan': ['Baku', 'Ganja', 'Sumqayit', 'Mingachevir', 'Lankaran'],
  'Georgia': ['Tbilisi', 'Batumi', 'Kutaisi', 'Rustavi', 'Gori'],
  'Armenia': ['Yerevan', 'Gyumri', 'Vanadzor', 'Vagharshapat', 'Hrazdan'],
  'Kazakhstan': ['Almaty', 'Nur-Sultan', 'Shymkent', 'Karaganda', 'Aktobe'],
  'Uzbekistan': ['Tashkent', 'Samarkand', 'Bukhara', 'Namangan', 'Andijan'],
  'Kyrgyzstan': ['Bishkek', 'Osh', 'Jalal-Abad', 'Karakol', 'Tokmok'],
  'Turkmenistan': ['Ashgabat', 'Turkmenabat', 'Dasoguz', 'Mary', 'Balkanabat'],
  'Tajikistan': ['Dushanbe', 'Khujand', 'Kulob', 'Bokhtar', 'Istaravshan'],
  
  // Middle East
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar'],
  'Israel': ['Tel Aviv', 'Jerusalem', 'Haifa', 'Eilat', 'Beersheba'],
  'Jordan': ['Amman', 'Aqaba', 'Irbid', 'Zarqa', 'Petra'],
  'Lebanon': ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Byblos'],
  'Qatar': ['Doha', 'Al Wakrah', 'Al Rayyan', 'Umm Salal', 'Al Khor'],
  'Kuwait': ['Kuwait City', 'Hawalli', 'Salmiya', 'Ahmadi', 'Jahra'],
  'Oman': ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur'],
  'Bahrain': ['Manama', 'Muharraq', 'Riffa', 'Hamad Town', 'Isa Town'],
  'Iraq': ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Najaf'],
  'Iran': ['Tehran', 'Mashhad', 'Isfahan', 'Shiraz', 'Tabriz'],
  
  // Americas
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Las Vegas', 'Seattle'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'],
  'Mexico': ['Mexico City', 'Cancun', 'Guadalajara', 'Monterrey', 'Playa del Carmen', 'Puerto Vallarta'],
  'Brazil': ['Sao Paulo', 'Rio de Janeiro', 'Brasilia', 'Salvador', 'Fortaleza', 'Belo Horizonte'],
  'Argentina': ['Buenos Aires', 'Cordoba', 'Rosario', 'Mendoza', 'Bariloche'],
  'Chile': ['Santiago', 'Valparaiso', 'Vina del Mar', 'Concepcion', 'La Serena'],
  'Colombia': ['Bogota', 'Medellin', 'Cali', 'Cartagena', 'Barranquilla'],
  'Peru': ['Lima', 'Cusco', 'Arequipa', 'Trujillo', 'Chiclayo'],
  
  // Asia
  'China': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hong Kong'],
  'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka'],
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'],
  'Thailand': ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi', 'Hua Hin'],
  'Vietnam': ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Nha Trang', 'Hoi An', 'Hue'],
  'Indonesia': ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Medan', 'Yogyakarta'],
  'Malaysia': ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Malacca', 'Langkawi'],
  'Singapore': ['Singapore', 'Sentosa', 'Changi', 'Jurong', 'Marina Bay'],
  'Philippines': ['Manila', 'Cebu', 'Davao', 'Boracay', 'Palawan'],
  'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'],
  'Bangladesh': ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet'],
  
  // Africa
  'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Sharm El Sheikh'],
  'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth'],
  'Morocco': ['Marrakech', 'Casablanca', 'Fez', 'Rabat', 'Tangier', 'Agadir'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
  'Nigeria': ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt'],
  'Tunisia': ['Tunis', 'Sousse', 'Sfax', 'Monastir', 'Djerba'],
  
  // Oceania
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Queenstown', 'Rotorua'],
}

export default function WeatherWidget({ countryName, cities, latitude, longitude }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [citySearch, setCitySearch] = useState('')

  const availableCities = cities || defaultCities[countryName] || []
  const filteredCities = availableCities.filter(city => 
    city.toLowerCase().includes(citySearch.toLowerCase())
  )

  useEffect(() => {
    if (availableCities.length > 0 && !selectedCity) {
      setSelectedCity(availableCities[0])
    }
  }, [availableCities, selectedCity])

  useEffect(() => {
    if (selectedCity) {
      fetchWeather(selectedCity)
    } else if (latitude && longitude) {
      fetchWeatherByCoords(latitude, longitude)
    }
  }, [selectedCity, latitude, longitude])

  const fetchWeather = async (city: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Using OpenWeatherMap API (free tier)
      // Note: You need to add your API key as environment variable
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
      
      // If no API key, show demo data
      if (!API_KEY || API_KEY === 'demo') {
        console.warn('⚠️ No OpenWeatherMap API key found. Using demo data.')
        console.log('👉 Get your free API key at: https://openweathermap.org/api')
        console.log('👉 Add to .env.local: NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key')
        
        // Show demo data
        setWeather({
          temp: 22,
          feels_like: 20,
          humidity: 65,
          wind_speed: 15,
          description: 'partly cloudy',
          icon: '02d',
          visibility: 10,
          pressure: 1013,
          temp_min: 18,
          temp_max: 25,
          city: city,
        })
        setLoading(false)
        return
      }
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},${encodeURIComponent(countryName)}&appid=${API_KEY}&units=metric`
      )
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Weather API Error:', errorData)
        throw new Error(errorData.message || 'Failed to fetch weather data')
      }
      
      const data = await response.json()
      
      setWeather({
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        wind_speed: Math.round(data.wind.speed * 3.6), // m/s to km/h
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        visibility: Math.round(data.visibility / 1000), // meters to km
        pressure: data.main.pressure,
        temp_min: Math.round(data.main.temp_min),
        temp_max: Math.round(data.main.temp_max),
        city: data.name,
      })
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Unable to load weather data')
    } finally {
      setLoading(false)
    }
  }

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
      
      // If no API key, show demo data
      if (!API_KEY || API_KEY === 'demo') {
        console.warn('⚠️ No OpenWeatherMap API key found. Using demo data.')
        console.log('👉 Get your free API key at: https://openweathermap.org/api')
        console.log('👉 Add to .env.local: NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key')
        
        // Show demo data
        setWeather({
          temp: 22,
          feels_like: 20,
          humidity: 65,
          wind_speed: 15,
          description: 'partly cloudy',
          icon: '02d',
          visibility: 10,
          pressure: 1013,
          temp_min: 18,
          temp_max: 25,
          city: countryName,
        })
        setLoading(false)
        return
      }
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      )
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Weather API Error:', errorData)
        throw new Error(errorData.message || 'Failed to fetch weather data')
      }
      
      const data = await response.json()
      
      setWeather({
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        wind_speed: Math.round(data.wind.speed * 3.6),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        visibility: Math.round(data.visibility / 1000),
        pressure: data.main.pressure,
        temp_min: Math.round(data.main.temp_min),
        temp_max: Math.round(data.main.temp_max),
        city: data.name,
      })
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Unable to load weather data')
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (icon: string) => {
    // OpenWeatherMap icon codes
    if (icon.includes('01')) return <Sun className="h-12 w-12 text-yellow-500" />
    if (icon.includes('02') || icon.includes('03')) return <Cloud className="h-12 w-12 text-gray-400" />
    if (icon.includes('09') || icon.includes('10')) return <CloudRain className="h-12 w-12 text-blue-500" />
    return <Cloud className="h-12 w-12 text-gray-400" />
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Cloud className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Weather</h3>
        </div>
        
        {/* City Selector */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
          >
            <MapPin className="h-4 w-4" />
            <span className="font-bold text-sm">{selectedCity || countryName}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => {
                  setIsOpen(false)
                  setCitySearch('')
                }}
              ></div>
              <div className="absolute right-0 mt-2 w-72 bg-white border-2 border-black rounded-lg shadow-2xl z-20 overflow-hidden">
                {/* Search/Custom Input */}
                <div className="p-3 border-b-2 border-black bg-gray-50">
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && citySearch.trim()) {
                          setSelectedCity(citySearch.trim())
                          setIsOpen(false)
                          setCitySearch('')
                        }
                      }}
                      placeholder="Herhangi bir şehir yazın veya seçin..."
                      className="w-full pl-9 pr-3 py-2 border-2 border-gray-300 focus:border-black rounded-lg text-sm font-medium outline-none"
                      autoFocus
                    />
                  </div>
                  
                  {/* Custom City Button */}
                  {citySearch.trim() && filteredCities.length === 0 && (
                    <button
                      onClick={() => {
                        setSelectedCity(citySearch.trim())
                        setIsOpen(false)
                        setCitySearch('')
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                    >
                      <Search className="h-4 w-4" />
                      <span className="font-bold text-sm">"{citySearch}" için hava durumu</span>
                    </button>
                  )}
                  
                  {citySearch.trim() && filteredCities.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedCity(citySearch.trim())
                        setIsOpen(false)
                        setCitySearch('')
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-all mb-2"
                    >
                      <Search className="h-4 w-4" />
                      <span className="font-bold text-sm">"{citySearch}" ara</span>
                    </button>
                  )}
                </div>
                
                {/* Predefined City List */}
                {availableCities.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-gray-100 border-b border-gray-300">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Popüler Şehirler</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                          <button
                            key={city}
                            onClick={() => {
                              setSelectedCity(city)
                              setIsOpen(false)
                              setCitySearch('')
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-0 ${
                              selectedCity === city ? 'bg-black text-white hover:bg-gray-800' : 'text-black'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className={`h-4 w-4 ${selectedCity === city ? 'text-white' : 'text-gray-400'}`} />
                              <span className="font-bold text-sm">{city}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        citySearch.trim() === '' && (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            Şehir listesi boş
                          </div>
                        )
                      )}
                    </div>
                    
                    {/* Total Count */}
                    {filteredCities.length > 0 && (
                      <div className="px-4 py-2 bg-gray-50 border-t-2 border-black text-xs text-gray-600 font-medium text-center">
                        {filteredCities.length} popüler şehir
                      </div>
                    )}
                  </>
                )}
                
                {/* No predefined cities - just search */}
                {availableCities.length === 0 && (
                  <div className="px-4 py-6 text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      {countryName} için herhangi bir şehir yazın
                    </div>
                    <div className="text-xs text-gray-500">
                      Örn: Mingachevir, Ganja, Baku...
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Weather Content */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <Cloud className="h-12 w-12 mx-auto mb-3 opacity-50 text-gray-400" />
          <div className="text-sm text-red-600 mb-2">{error}</div>
          <div className="text-xs text-gray-500 mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="font-semibold text-yellow-800 mb-1">⚠️ Weather API Key Required</div>
            <div className="text-yellow-700">
              Get your free API key at:{' '}
              <a 
                href="https://openweathermap.org/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-yellow-900"
              >
                OpenWeatherMap
              </a>
            </div>
            <div className="text-yellow-700 mt-1">
              Add to <code className="bg-yellow-100 px-1 rounded">.env.local</code>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && weather && (
        <div className="space-y-4">
          {/* Main Weather Display */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {getWeatherIcon(weather.icon)}
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-gray-900">{weather.temp}°C</div>
                <div className="text-sm text-gray-600 capitalize">{weather.description}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Feels like</div>
              <div className="text-2xl font-semibold text-gray-900">{weather.feels_like}°C</div>
            </div>
          </div>

          {/* Min/Max Temperature */}
          <div className="flex items-center justify-center gap-4 py-3 bg-white/60 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-gray-500">Min</div>
              <div className="text-lg font-bold text-blue-600">{weather.temp_min}°C</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Max</div>
              <div className="text-lg font-bold text-red-600">{weather.temp_max}°C</div>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Wind className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500">Wind</div>
                <div className="text-sm font-semibold text-gray-900">{weather.wind_speed} km/h</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Droplets className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500">Humidity</div>
                <div className="text-sm font-semibold text-gray-900">{weather.humidity}%</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500">Visibility</div>
                <div className="text-sm font-semibold text-gray-900">{weather.visibility} km</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Gauge className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500">Pressure</div>
                <div className="text-sm font-semibold text-gray-900">{weather.pressure} hPa</div>
              </div>
            </div>
          </div>

          {/* City Name + Demo Badge */}
          <div className="text-center pt-2 border-t border-blue-200">
            <div className="text-xs text-gray-500">Current weather in</div>
            <div className="flex items-center justify-center gap-2">
              <div className="text-sm font-bold text-gray-900">{weather.city}</div>
              {(!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY === 'demo') && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-300">
                  Demo
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

