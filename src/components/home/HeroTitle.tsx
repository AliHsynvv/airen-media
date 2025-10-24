'use client'

import { useEffect, useRef } from 'react'
import { fitTextToContainer } from '@/lib/utils/fitTextToContainer'
import { useTranslations } from 'next-intl'

export default function HeroTitle() {
  const t = useTranslations('home.hero')
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const applyFit = () => fitTextToContainer(ref.current, { minPx: 14, stepPx: 0.5 })
    applyFit()
    window.addEventListener('resize', applyFit)
    return () => window.removeEventListener('resize', applyFit)
  }, [])

  return (
    <h1
      ref={ref}
      className="whitespace-nowrap font-bold leading-none tracking-tight text-gray-900 text-[clamp(14px,5vw,36px)] sm:text-4xl lg:text-6xl"
    >
      {t('title')}
    </h1>
  )
}


