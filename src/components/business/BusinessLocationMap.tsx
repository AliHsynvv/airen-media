'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

type Props = {
  latitude?: number | null
  longitude?: number | null
  height?: number
  showControls?: boolean
  theme?: 'light' | 'dark' | 'voyager'
}

export default function BusinessLocationMap({ 
  latitude, 
  longitude, 
  height = 180, 
  showControls = true,
  theme = 'voyager' 
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadLeaflet = async () => {
      if ((window as any).L) return (window as any).L
      
      // Load Leaflet CSS
      await new Promise<void>((resolve) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
        link.onload = () => resolve()
        link.onerror = () => resolve()
      })
      
      // Load Leaflet JS
      await new Promise<void>((resolve) => {
        const scr = document.createElement('script')
        scr.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        scr.async = true
        scr.onload = () => resolve()
        scr.onerror = () => resolve()
        document.body.appendChild(scr)
      })
      
      return (window as any).L
    }

    const init = async () => {
      if (!mapRef.current) return
      const L = await loadLeaflet()
      if (!L) return
      
      const lat = latitude ?? 39.925
      const lng = longitude ?? 32.836
      
      // Create map with smooth animations
      const map = L.map(mapRef.current, { 
        zoomControl: false, 
        attributionControl: false,
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true
      }).setView([lat, lng], (latitude && longitude) ? 13 : 6)
      
      // Choose modern tile layer based on theme
      let tileUrl = ''
      let tileOptions: any = {
        maxZoom: 19,
        attribution: ''
      }
      
      switch (theme) {
        case 'dark':
          tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          break
        case 'light':
          tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          break
        case 'voyager':
        default:
          tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          break
      }
      
      L.tileLayer(tileUrl, tileOptions).addTo(map)
      
      // Create custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="position: relative;">
            <div style="
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border: 3px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              animation: bounce 2s infinite;
            ">
              <svg style="
                width: 20px;
                height: 20px;
                color: white;
                transform: rotate(45deg);
              " fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      })
      
      // Add marker with animation
      L.marker([lat, lng], { icon: customIcon }).addTo(map)
      
      mapInstanceRef.current = map
      setIsLoaded(true)
      
      // Add CSS animation for marker bounce
      if (!document.getElementById('marker-animation-styles')) {
        const style = document.createElement('style')
        style.id = 'marker-animation-styles'
        style.innerHTML = `
          @keyframes bounce {
            0%, 100% { transform: translateY(0) rotate(-45deg); }
            50% { transform: translateY(-10px) rotate(-45deg); }
          }
          .leaflet-container {
            background: ${theme === 'dark' ? '#1a1a2e' : '#f8f9fa'};
          }
        `
        document.head.appendChild(style)
      }
    }

    init()
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, theme])

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut()
    }
  }

  const handleFullscreen = () => {
    if (mapRef.current) {
      if (mapRef.current.requestFullscreen) {
        mapRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div className="relative group">
      <div 
        ref={mapRef} 
        style={{ height }} 
        className="w-full rounded-lg overflow-hidden shadow-lg border-2 border-gray-200 transition-all duration-300 group-hover:shadow-2xl group-hover:border-blue-300"
      />
      
      {/* Modern Control Buttons */}
      {showControls && isLoaded && (
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/95 backdrop-blur-sm hover:bg-blue-500 hover:text-white text-gray-700 rounded-lg shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-500 hover:scale-110"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/95 backdrop-blur-sm hover:bg-blue-500 hover:text-white text-gray-700 rounded-lg shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-500 hover:scale-110"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-2 bg-white/95 backdrop-blur-sm hover:bg-blue-500 hover:text-white text-gray-700 rounded-lg shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-500 hover:scale-110"
            title="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <MapPin className="h-8 w-8 text-blue-500 animate-bounce" />
            <div className="text-sm text-gray-500 font-medium">Loading map...</div>
          </div>
        </div>
      )}
    </div>
  )
}


