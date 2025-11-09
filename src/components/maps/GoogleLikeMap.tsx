'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTranslations } from 'next-intl'

// Fix Leaflet default marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface GoogleLikeMapProps {
  countries?: any[]
  onCountryClick?: (country: any) => void
}

// Component to handle map updates
function MapUpdater({ countries }: { countries: any[] }) {
  const map = useMap()

  useEffect(() => {
    if (countries.length > 0) {
      // Fit map to show all markers
      const bounds = countries
        .filter(c => c.latitude && c.longitude)
        .map(c => [c.latitude, c.longitude] as [number, number])
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 4 })
      }
    }
  }, [countries, map])

  return null
}

// Custom marker icons based on country status
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  })
}

export default function GoogleLikeMap({ countries = [], onCountryClick }: GoogleLikeMapProps) {
  const t = useTranslations('countries')
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'hybrid'>('streets')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter countries with valid coordinates
  const validCountries = useMemo(() => {
    return countries.filter(c => c.latitude && c.longitude && !isNaN(c.latitude) && !isNaN(c.longitude))
  }, [countries])

  // Get marker color based on country status
  const getMarkerColor = (country: any) => {
    if (country.featured) return '#fbbf24' // amber
    if (country.trending_score && country.trending_score >= 50) return '#ec4899' // pink
    return '#10b981' // emerald
  }

  if (!mounted) {
    return (
      <div className="relative w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl overflow-hidden shadow-xl">
        <div className="h-[600px] flex items-center justify-center">
          <div className="animate-pulse text-gray-600">Loading map...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="relative z-10 text-center pt-8 pb-4 px-4">
        <div className="inline-flex items-center gap-2 mb-4 bg-white/60 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg border border-purple-200/50">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('list.title')}
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          {t('list.subtitle')}
        </h3>
        
        {/* Map Type Selector */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setMapLayer('streets')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mapLayer === 'streets'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/60 text-gray-700 hover:bg-white/80'
            }`}
          >
            🗺️ Street Map
          </button>
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mapLayer === 'satellite'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/60 text-gray-700 hover:bg-white/80'
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => setMapLayer('hybrid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mapLayer === 'hybrid'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/60 text-gray-700 hover:bg-white/80'
            }`}
          >
            🌍 Hybrid
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500" />
            <span className="text-gray-700">Available Countries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-400" />
            <span className="text-gray-700">Featured</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-pink-500" />
            <span className="text-gray-700">Trending</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative z-0 px-4 pb-8">
        <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-white/50">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '600px', width: '100%' }}
            className="z-0"
            scrollWheelZoom={true}
            zoomControl={true}
          >
            {/* Street Map Layer */}
            {mapLayer === 'streets' && (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}

            {/* Satellite Layer */}
            {mapLayer === 'satellite' && (
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            )}

            {/* Hybrid Layer (Satellite + Labels) */}
            {mapLayer === 'hybrid' && (
              <>
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  opacity={0.3}
                />
              </>
            )}

            {/* Country Markers */}
            {validCountries.map((country) => (
              <Marker
                key={country.id}
                position={[country.latitude, country.longitude]}
                icon={createCustomIcon(getMarkerColor(country))}
                eventHandlers={{
                  click: () => {
                    if (onCountryClick) {
                      onCountryClick(country)
                    }
                  },
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-start gap-3">
                      {country.flag_url && (
                        <img
                          src={country.flag_url}
                          alt={country.name}
                          className="w-12 h-8 object-cover rounded shadow-sm"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{country.name}</h3>
                        {country.capital && (
                          <p className="text-sm text-gray-600">📍 {country.capital}</p>
                        )}
                        {country.featured && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                            ⭐ Featured
                          </span>
                        )}
                        {country.trending_score >= 50 && (
                          <span className="inline-block mt-1 ml-1 px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">
                            🔥 Trending
                          </span>
                        )}
                      </div>
                    </div>
                    {country.description && (
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                        {country.description}
                      </p>
                    )}
                    <button
                      onClick={() => onCountryClick && onCountryClick(country)}
                      className="mt-3 w-full px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      Explore →
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            <MapUpdater countries={validCountries} />
          </MapContainer>
        </div>
      </div>

      {/* Info badge */}
      <div className="absolute bottom-12 right-8 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm text-gray-700">
        📍 {validCountries.length} countries shown
      </div>
    </div>
  )
}

