'use client'

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Video, Sparkles } from 'lucide-react'

interface HeygenEmbedProps {
  avatarId?: string
  className?: string
}

export default function HeygenEmbed({ avatarId, className }: HeygenEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Placeholder for real Heygen embed. Integrate SDK/script here.
    if (containerRef.current) {
      containerRef.current.innerHTML = `
        <div class="h-full w-full flex flex-col items-center justify-center text-center p-6">
          <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6 border-2 border-gray-200">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">AI Avatar</h3>
          <p class="text-gray-600 text-sm max-w-sm mb-4">
            Heygen Avatar entegrasyonu burada görünecek
          </p>
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-semibold">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Yakında
          </div>
        </div>
      `
    }
  }, [])

  return (
    <Card className={`border-2 border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 h-[400px] sm:h-[500px] overflow-hidden ${className || ''}`}>
      <div ref={containerRef} className="h-full w-full" />
    </Card>
  )
}


