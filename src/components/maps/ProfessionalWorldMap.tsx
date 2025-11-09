'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { useTranslations } from 'next-intl'
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut } from 'lucide-react'

const formatCompactNumber = (value?: number | null): string => {
  if (value === undefined || value === null) return '0'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return `${value}`
}

const buildFallbackPopup = (location: { name: string }) => `
  <div style="width: clamp(220px, 70vw, 280px); text-align: center; padding: 16px 18px; background: #ffffff; border-radius: 16px; border: 1px solid rgba(148, 163, 184, 0.35); box-shadow: 0 18px 40px rgba(15, 23, 42, 0.15); font-family: 'Inter', sans-serif;">
    <div style="font-size: 30px; margin-bottom: 10px;">📍</div>
    <div style="font-size: 16px; font-weight: 600; color: #0f172a;">${location.name}</div>
    <p style="margin: 6px 0 0 0; color: #64748b; font-size: 13px;">Selected location</p>
  </div>
`

const WORLD_BOUNDS: L.LatLngBoundsExpression = [
  [-85, -180],
  [85, 180]
]

const buildModernPopup = ({
  country,
  location,
  reviewsCount,
  avgRating
}: {
  country: any
  location: { lat: number; lng: number; name: string }
  reviewsCount: number
  avgRating: number | null
}) => {
  const cultureSnippet = country.culture_description
    ? `${country.culture_description.substring(0, 160)}${country.culture_description.length > 160 ? '…' : ''}`
    : ''

  const ratingCard =
    avgRating !== null
      ? `
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(251, 191, 36, 0.16); color: #f59e0b; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.3 6.18 20l1.12-6.54L2 8.94l6.59-.96L12 2l3.41 5.98 6.59.96-4.78 4.52L17.82 20Z"/></svg>
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 600; color: #0f172a;">${avgRating}</div>
              <div style="font-size: 11px; color: #64748b; letter-spacing: 0.04em; text-transform: uppercase;">Rating</div>
            </div>
          </div>
        `
      : ''

  const bestTimeCard =
    country.best_time_to_visit || country.climate_info
      ? `
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 10px; grid-column: span 2;">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(250, 204, 21, 0.16); color: #f59e0b; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m17.07-7.07-1.41 1.41M6.34 17.66l-1.41 1.41m0-13.41 1.41 1.41M17.66 17.66l1.41 1.41"/></svg>
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 600; color: #0f172a;">${country.best_time_to_visit || 'All year round'}</div>
              <div style="font-size: 11px; color: #64748b; letter-spacing: 0.04em; text-transform: uppercase;">Best Time</div>
            </div>
          </div>
        `
      : ''

  const quickInfo = [
    country.official_language
      ? `<div style="font-size: 12px; color: #475569;">
          <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">Language</span>
          <span style="font-weight: 600; color: #1f2937;">${country.official_language}</span>
        </div>`
      : '',
    country.currency
      ? `<div style="font-size: 12px; color: #475569;">
          <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">Currency</span>
          <span style="font-weight: 600; color: #1f2937;">${country.currency_code || country.currency}</span>
        </div>`
      : '',
    country.population
      ? `<div style="font-size: 12px; color: #475569;">
          <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">Population</span>
          <span style="font-weight: 600; color: #1f2937;">${(country.population / 1_000_000).toFixed(1)}M</span>
        </div>`
      : '',
    country.budget_level
      ? `<div style="font-size: 12px; color: #475569;">
          <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">Budget</span>
          <span style="font-weight: 600; color: #1f2937;">${country.budget_level}</span>
        </div>`
      : ''
  ]
    .filter(Boolean)
    .join('')

  return `
    <div class="popup-compact" style="width: clamp(260px, 82vw, 360px); background: #ffffff; border-radius: 18px; border: 1px solid rgba(15, 23, 42, 0.08); box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18); overflow: hidden; font-family: 'Inter', sans-serif;">
      <div style="padding: 18px 20px; background: linear-gradient(135deg, #111827 0%, #1f2937 55%, #312e81 100%); display: flex; align-items: center; gap: 14px;">
        <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(255, 255, 255, 0.14); display: flex; align-items: center; justify-content: center; font-size: 26px; color: #ffffff;">
          ${country.flag_icon || '🌐'}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 18px; font-weight: 600; color: #f8fafc; letter-spacing: -0.01em;">${location.name}</div>
          <div style="margin-top: 4px; font-size: 12px; color: rgba(241, 245, 249, 0.75); display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-flex; width: 16px; height: 16px; align-items: center; justify-content: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M5.5 20a6.5 6.5 0 1 1 13 0"/></svg>
            </span>
            <span>${country.capital || 'Capital unavailable'}</span>
          </div>
        </div>
        ${country.featured ? `<span style="padding: 6px 10px; background: rgba(251, 191, 36, 0.18); border: 1px solid rgba(251, 191, 36, 0.35); border-radius: 999px; font-size: 11px; font-weight: 600; color: #facc15; letter-spacing: 0.04em;">Featured</span>` : ''}
      </div>
      <div style="padding: 20px 20px 22px;">
        ${cultureSnippet ? `<p style="margin: 0 0 18px 0; font-size: 13px; line-height: 1.6; color: #334155;">${cultureSnippet}</p>` : ''}
        <div style="display: flex; gap: 12px; margin-bottom: 18px;">
          <a href="https://www.google.com/maps/@${location.lat},${location.lng},14z?layer=c" target="_blank" rel="noopener noreferrer" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: #f8fafc; font-size: 12px; font-weight: 600; letter-spacing: 0.02em; padding: 12px 14px; border-radius: 12px; text-decoration: none; box-shadow: 0 12px 24px rgba(14, 165, 233, 0.28);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-8-8 19-3-7-8-4Z"/><path d="M12 12l-3-3"/></svg>
            <span>3D Tour</span>
          </a>
          <a href="/countries/${country.slug}" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: #1f2937; color: #f8fafc; font-size: 12px; font-weight: 600; letter-spacing: 0.02em; padding: 12px 14px; border-radius: 12px; text-decoration: none; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.25);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            <span>Details</span>
          </a>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;">
          ${ratingCard}
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(14, 165, 233, 0.16); color: #0ea5e9; display: flex; align-items: center; justify-content: center;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10h8"/><path d="M9 7h6"/><path d="M10 4h4"/><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 600; color: #0f172a;">${reviewsCount}</div>
              <div style="font-size: 11px; color: #64748b; letter-spacing: 0.04em; text-transform: uppercase;">Reviews</div>
            </div>
          </div>
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(16, 185, 129, 0.16); color: #10b981; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M2.05 12a10 10 0 0 1 19.9 0 10 10 0 0 1-19.9 0Z"/></svg>
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 600; color: #0f172a;">${formatCompactNumber(country.view_count)}</div>
              <div style="font-size: 11px; color: #64748b; letter-spacing: 0.04em; text-transform: uppercase;">Views</div>
            </div>
          </div>
          ${bestTimeCard}
        </div>
        ${quickInfo ? `<div style="margin-top: 18px; padding: 14px; border: 1px solid #e2e8f0; border-radius: 14px; background: #f8fafc; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;">${quickInfo}</div>` : ''}
      </div>
    </div>
  `
}
// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface ProfessionalWorldMapProps {
  countries?: any[]
  onCountryClick?: (country: any) => void
  selectedLocation?: { lat: number; lng: number; zoom?: number; name: string } | null
}

// Map controller component
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.5 })
  }, [center, zoom, map])
  
  return null
}

// Location updater component with animated marker
function LocationUpdater({ location, country }: { location: { lat: number; lng: number; zoom?: number; name: string } | null | undefined, country?: any }) {
  const map = useMap()
  const markerRef = useRef<L.Marker | null>(null)
  const [reviewsCount, setReviewsCount] = useState<number>(0)
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [reviewsLoaded, setReviewsLoaded] = useState(false)
  
  // Fetch reviews count and rating when country changes
  useEffect(() => {
    if (country?.id) {
      setReviewsLoaded(false)
      const fetchReviews = async () => {
        try {
          const { count } = await (await import('@/lib/supabase/client')).supabase
            .from('country_reviews')
            .select('*', { count: 'exact', head: true })
            .eq('country_id', country.id)
          
          const { data: avgData } = await (await import('@/lib/supabase/client')).supabase
            .from('country_reviews')
            .select('rating')
            .eq('country_id', country.id)
          
          setReviewsCount(count || 0)
          
          if (avgData && avgData.length > 0) {
            const sum = avgData.reduce((acc: number, r: any) => acc + (r.rating || 0), 0)
            setAvgRating(Number((sum / avgData.length).toFixed(1)))
          } else {
            setAvgRating(null)
          }
          
          setReviewsLoaded(true)
        } catch (error) {
          console.error('Error fetching reviews:', error)
          setReviewsLoaded(true)
        }
      }
      fetchReviews()
    }
  }, [country?.id])
  
  useEffect(() => {
    if (location && country && reviewsLoaded) {
      // Fly to location
      map.flyTo([location.lat, location.lng], location.zoom || 8, {
        duration: 1.5,
        easeLinearity: 0.25
      })
      
      // Remove previous marker if exists
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }
      
      // Create animated highlight marker
      const highlightIcon = L.divIcon({
        className: 'highlight-marker-animated',
        html: `
          <div style="position: relative; animation: markerPulse 2s ease-in-out infinite;">
            <div style="
              background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
              width: 40px;
              height: 40px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 4px solid white;
              box-shadow: 0 8px 24px rgba(168, 85, 247, 0.4), 0 0 0 0 rgba(168, 85, 247, 0.7);
              animation: pulse 2s infinite;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 14px;
                height: 14px;
                background: white;
                border-radius: 50%;
                transform: rotate(45deg);
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              "></div>
            </div>
            <div style="
              position: absolute;
              top: -12px;
              right: -12px;
              background: #fbbf24;
              border-radius: 50%;
              width: 24px;
              height: 24px;
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(251, 191, 36, 0.5);
              font-size: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              animation: starRotate 3s linear infinite;
            ">⭐</div>
          </div>
          <style>
            @keyframes markerPulse {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            @keyframes pulse {
              0%, 100% { box-shadow: 0 8px 24px rgba(168, 85, 247, 0.4), 0 0 0 0 rgba(168, 85, 247, 0.7); }
              50% { box-shadow: 0 8px 24px rgba(168, 85, 247, 0.4), 0 0 0 20px rgba(168, 85, 247, 0); }
            }
            @keyframes starRotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          </style>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      })
      
      // Create marker with popup
      const marker = L.marker([location.lat, location.lng], { 
        icon: highlightIcon,
        zIndexOffset: 1000 
      })
      
      // Create popup content
      const popupContent = country
        ? buildModernPopup({ country, location, reviewsCount, avgRating })
        : buildFallbackPopup(location)
      
      marker.bindPopup(popupContent, {
        maxWidth: 380,
        minWidth: 0,
        className: 'professional-popup-highlight',
        closeButton: true,
        autoPan: true,
        autoPanPadding: [80, 80]
      })
      
      marker.addTo(map)
      markerRef.current = marker
      
      // Open popup after animation completes
      setTimeout(() => {
        marker.openPopup()
      }, 1600)
    }
    
    return () => {
      if (markerRef.current && map) {
        map.removeLayer(markerRef.current)
      }
    }
  }, [location, country, map, reviewsCount, avgRating, reviewsLoaded])
  
  return null
}

// Create professional custom icon
const createProfessionalIcon = (color: string, isFeatured: boolean = false) => {
  const size = isFeatured ? 32 : 28
  return L.divIcon({
    className: 'custom-marker-professional',
    html: `
      <div class="relative group">
        <div style="
          background: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 3px ${color}20;
          transition: all 0.2s ease;
          position: relative;
        " class="hover:scale-110">
          <div style="
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          "></div>
        </div>
        ${isFeatured ? '<div style="position: absolute; top: -8px; right: -8px; background: #fbbf24; border-radius: 50%; width: 16px; height: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">⭐</div>' : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size],
  })
}

export default function ProfessionalWorldMap({ countries = [], onCountryClick, selectedLocation }: ProfessionalWorldMapProps) {
  const t = useTranslations('countries')
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'hybrid'>('streets')
  const [mounted, setMounted] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<any>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0])
  const [mapZoom, setMapZoom] = useState(2)
  const [showControls, setShowControls] = useState(true)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // Load markercluster dynamically
    if (typeof window !== 'undefined') {
      require('leaflet.markercluster')
    }
  }, [])

  // Setup map bounds when map ref is available
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current
      map.setMaxBounds(WORLD_BOUNDS)
      const worldZoom = map.getBoundsZoom(WORLD_BOUNDS, false)
      map.setMinZoom(worldZoom)
    }
  }, [mapRef.current])

  const processedCountries = useMemo(() => {
    return (countries || []).map(country => {
      const latitude =
        country.capital_latitude !== undefined && country.capital_latitude !== null && !isNaN(Number(country.capital_latitude))
          ? Number(country.capital_latitude)
          : country.latitude
      const longitude =
        country.capital_longitude !== undefined && country.capital_longitude !== null && !isNaN(Number(country.capital_longitude))
          ? Number(country.capital_longitude)
          : country.longitude

      return {
        ...country,
        latitude,
        longitude
      }
    })
  }, [countries])

  const validCountries = useMemo(() => {
    return processedCountries.filter(
      c => c.latitude && c.longitude && !isNaN(Number(c.latitude)) && !isNaN(Number(c.longitude))
    )
  }, [processedCountries])

  // Find country data for selected location
  const selectedCountryData = useMemo(() => {
    if (!selectedLocation) return null
    
    // Try to find in original countries list directly
    const foundInOriginal = processedCountries.find(c => 
      c.name && c.name.toLowerCase() === selectedLocation.name.toLowerCase()
    )
    
    if (foundInOriginal) {
      return foundInOriginal
    }
    
    // Fallback to validCountries with coordinate matching
    const found = validCountries.find(c => 
      c.name.toLowerCase() === selectedLocation.name.toLowerCase() ||
      (c.latitude && c.longitude && 
       Math.abs(c.latitude - selectedLocation.lat) < 0.5 && 
       Math.abs(c.longitude - selectedLocation.lng) < 0.5)
    )
    
    return found
  }, [selectedLocation, validCountries, processedCountries])

  const getMarkerColor = (country: any) => {
    if (country.featured) return '#fbbf24'
    if (country.trending_score && country.trending_score >= 50) return '#ec4899'
    return '#10b981'
  }

  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country)
    setMapCenter([country.latitude, country.longitude])
    setMapZoom(6)
  }

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setMapCenter([position.coords.latitude, position.coords.longitude])
        setMapZoom(10)
      })
    }
  }

  const handleResetView = () => {
    setMapCenter([20, 0])
    setMapZoom(2)
    setSelectedCountry(null)
  }

  if (!mounted) {
    return (
      <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden shadow-lg border border-slate-200">
        <div className="h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading professional map...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200">
      {/* Minimal Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Interactive World Map</h3>
              <p className="text-xs text-slate-500">{validCountries.length} destinations</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1 py-1 text-xs font-medium text-slate-600">
            <button
              onClick={() => setMapLayer('streets')}
              className={`px-3 py-1 rounded-full transition ${
                mapLayer === 'streets' ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-white/60'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-3 py-1 rounded-full transition ${
                mapLayer === 'satellite' ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-white/60'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapLayer('hybrid')}
              className={`px-3 py-1 rounded-full transition ${
                mapLayer === 'hybrid' ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-white/60'
              }`}
            >
              Hybrid
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[52vh] bg-slate-100">
        <MapContainer
          ref={mapRef}
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0 leaflet-container-modern"
          scrollWheelZoom={true}
          zoomControl={false}
          maxBounds={WORLD_BOUNDS}
          maxBoundsViscosity={1}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          <LocationUpdater location={selectedLocation} country={selectedCountryData} />
          
          {mapLayer === 'streets' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap={true}
            />
          )}
          
          {mapLayer === 'satellite' && (
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              noWrap={true}
            />
          )}
          
          {mapLayer === 'hybrid' && (
            <>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                noWrap={true}
              />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                opacity={0.3}
                noWrap={true}
              />
            </>
          )}

          {validCountries.map((country) => (
            <Marker
              key={country.id}
              position={[country.latitude, country.longitude]}
              icon={createProfessionalIcon(getMarkerColor(country), country.featured)}
              eventHandlers={{
                click: () => handleCountrySelect(country),
              }}
            >
              <Popup className="professional-popup">
                <div className="min-w-[280px] p-2">
                  {country.flag_url && (
                    <img
                      src={country.flag_url}
                      alt={country.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{country.name}</h3>
                      {country.capital && (
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {country.capital}
                        </p>
                      )}
                    </div>
                    
                    {(country.featured || (country.trending_score && country.trending_score >= 50)) && (
                      <div className="flex gap-2">
                        {country.featured && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                            ⭐ Featured
                          </span>
                        )}
                        {country.trending_score >= 50 && (
                          <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-medium">
                            🔥 Trending
                          </span>
                        )}
                      </div>
                    )}
                    
                    {country.description && (
                      <p className="text-sm text-slate-700 line-clamp-3">
                        {country.description}
                      </p>
                    )}
                    
                    <button
                      onClick={() => onCountryClick && onCountryClick(country)}
                      className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                    >
                      Explore {country.name} →
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Custom Controls - Professional */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <button
            onClick={handleMyLocation}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-slate-50 transition-all border border-slate-200"
            title="My Location"
          >
            <Navigation className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={handleResetView}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-slate-50 transition-all border border-slate-200"
            title="Reset View"
          >
            <Layers className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Legend - Compact */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 border border-slate-200">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-700 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-slate-700 font-medium">Featured</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-slate-700 font-medium">Trending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar - Compact */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span>
            <span className="font-semibold text-slate-900">{validCountries.length}</span> total destinations
          </span>
          <span>•</span>
          <span>
            <span className="font-semibold text-slate-900">{validCountries.filter(c => c.featured).length}</span> featured
          </span>
          <span>•</span>
          <span>
            <span className="font-semibold text-slate-900">{validCountries.filter(c => c.trending_score >= 50).length}</span> trending
          </span>
        </div>
        {selectedCountry && (
          <div className="text-xs text-slate-600">
            Selected: <span className="font-semibold text-purple-600">{selectedCountry.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}

