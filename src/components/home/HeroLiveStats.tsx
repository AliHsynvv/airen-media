'use client'

import { useEffect, useRef, useState } from 'react'
import { Users, Activity } from 'lucide-react'
import { useTranslations } from 'next-intl'

function useCountUp(target: number, durationMs: number) {
  const [value, setValue] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const step = (timestamp: number) => {
      if (startRef.current == null) startRef.current = timestamp
      const progress = Math.min(1, (timestamp - startRef.current) / durationMs)
      setValue(Math.floor(progress * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, durationMs])

  return value
}

export default function HeroLiveStats() {
  const t = useTranslations('home.hero.liveStats')
  // Mock targets
  const totalUsers = useCountUp(10000, 1400)
  const onlineUsers = useCountUp(2000, 1400)

  return (
    <div className="mb-6">
      <div className="inline-flex items-center gap-4 rounded-full border border-gray-200 bg-white/80 backdrop-blur px-4 py-2 shadow-sm animate-[fadein_0.6s_ease_0.1s_forwards] opacity-0">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-700">
            <strong className="text-gray-900 font-semibold">{totalUsers.toLocaleString()}</strong> {t('users')}
          </span>
        </div>
        <span className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-600" />
          <span className="text-sm text-gray-700">
            <strong className="text-gray-900 font-semibold">{onlineUsers.toLocaleString()}</strong> {t('online')}
          </span>
        </div>
      </div>
    </div>
  )
}


