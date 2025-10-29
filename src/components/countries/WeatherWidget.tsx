'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, MapPin, ChevronDown } from 'lucide-react'

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
  'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bodrum'],
  'United Kingdom': ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Liverpool'],
  'France': ['Paris', 'Marseille', 'Lyon', 'Nice', 'Bordeaux'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'],
  'Italy': ['Rome', 'Milan', 'Venice', 'Florence', 'Naples'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco'],
}

export default function WeatherWidget({ countryName, cities, latitude, longitude }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  const availableCities = cities || defaultCities[countryName] || []

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
        {availableCities.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-300 rounded-lg hover:border-blue-400 transition-all"
            >
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-900">{selectedCity}</span>
              <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-blue-200 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city)
                        setIsOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                        selectedCity === city ? 'bg-blue-100 font-semibold' : ''
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
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

