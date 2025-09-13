'use client'

import { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'

interface HeygenEmbedProps {
  avatarId?: string
  className?: string
}

export default function HeygenEmbed({ avatarId, className }: HeygenEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Placeholder for real Heygen embed. Integrate SDK/script here.
    if (containerRef.current) {
      containerRef.current.innerHTML = '<div class="h-full w-full flex items-center justify-center text-gray-300">Heygen Avatar burada görünecek</div>'
    }
  }, [])

  return (
    <Card className={`glass-card h-[460px] overflow-hidden ${className || ''}`}>
      <div ref={containerRef} className="h-full w-full" />
    </Card>
  )
}


