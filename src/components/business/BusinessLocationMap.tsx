'use client'

import { useEffect, useRef } from 'react'

type Props = {
  latitude?: number | null
  longitude?: number | null
  height?: number
}

export default function BusinessLocationMap({ latitude, longitude, height = 180 }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const loadLeaflet = async () => {
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
      const L = await loadLeaflet()
      if (!L) return
      const lat = latitude ?? 39.925
      const lng = longitude ?? 32.836
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([lat, lng], (latitude && longitude) ? 12 : 6)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
      L.marker([lat, lng]).addTo(map)
    }

    init()
  }, [latitude, longitude])

  return <div ref={mapRef} style={{ height }} className="w-full rounded-md overflow-hidden border" />
}


