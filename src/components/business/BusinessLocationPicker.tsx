'use client'

import { useEffect, useRef } from 'react'

type Props = {
  latitude?: number | string | null
  longitude?: number | string | null
  onChange: (lat: number, lng: number) => void
  height?: number
}

// Lightweight Leaflet loader via CDN (no npm dep)
export default function BusinessLocationPicker({ latitude, longitude, onChange, height = 260 }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const leafletRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    const ensureLeaflet = async () => {
      if ((window as any).L) return (window as any).L
      await new Promise<void>((resolve) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
        link.onload = () => resolve()
        link.onerror = () => resolve()
      })
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
      const L = await ensureLeaflet()
      if (!L) return
      leafletRef.current = L
      const lat = typeof latitude === 'string' ? parseFloat(latitude) : (latitude ?? 39.925)
      const lng = typeof longitude === 'string' ? parseFloat(longitude) : (longitude ?? 32.836)
      const map = L.map(mapRef.current).setView([lat || 39.925, lng || 32.836], (lat && lng) ? 12 : 6)
      mapInstanceRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)
      const marker = L.marker([lat || 39.925, lng || 32.836], { draggable: true }).addTo(map)
      markerRef.current = marker

      const setPoint = (p: any) => {
        const { lat: la, lng: ln } = p.latlng || p
        marker.setLatLng([la, ln])
        onChange(Number(la), Number(ln))
      }
      map.on('click', (e: any) => setPoint(e))
      marker.on('dragend', () => setPoint(marker.getLatLng()))
    }

    init()

    return () => {
      try {
        if (markerRef.current) markerRef.current.remove()
        if (mapRef.current && leafletRef.current) {
          const L = leafletRef.current
          const map = L?.map?.(mapRef.current)
          if (map) map.remove()
        }
      } catch {}
    }
  }, [])

  useEffect(() => {
    // update marker position and map view if props change
    try {
      if (!markerRef.current || !leafletRef.current || !mapInstanceRef.current) return
      const lat = typeof latitude === 'string' ? parseFloat(latitude) : (latitude ?? null)
      const lng = typeof longitude === 'string' ? parseFloat(longitude) : (longitude ?? null)
      if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
        // Update marker position
        markerRef.current.setLatLng([lat, lng])
        // Update map view - fly to new location with smooth animation
        mapInstanceRef.current.flyTo([lat, lng], 6, {
          duration: 1.5 // 1.5 seconds animation
        })
      }
    } catch {}
  }, [latitude, longitude])

  return (
    <div ref={mapRef} style={{ height }} className="w-full rounded-md overflow-hidden border" />
  )
}


