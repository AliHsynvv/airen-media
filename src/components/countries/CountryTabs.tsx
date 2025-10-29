'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import CountryReviews from '@/components/countries/CountryReviews'
import { useTranslations } from 'next-intl'
import { MessageSquare, Info } from 'lucide-react'

interface CountryTabsProps {
  countryId?: string
  countrySlug: string
  overview: React.ReactNode
}

type TabKey = 'overview' | 'reviews'

export default function CountryTabs({ countryId, countrySlug, overview }: CountryTabsProps) {
  const [tab, setTab] = useState<TabKey>('overview')
  const t = useTranslations('countries.tabs')

  return (
    <div className="mt-8">
      {/* Tab headers */}
      <div className="border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex gap-2">
          <button
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              tab === 'overview' 
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setTab('overview')}
          >
            <Info className="h-4 w-4" />
            {t('overview')}
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              tab === 'reviews' 
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setTab('reviews')}
          >
            <MessageSquare className="h-4 w-4" />
            {t('reviews')}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-8 space-y-6">
        {tab === 'overview' && (
          <>{overview}</>
        )}
        {tab === 'reviews' && (
          <div>
            <CountryReviews countryId={countryId} countrySlug={countrySlug} />
          </div>
        )}
      </div>
    </div>
  )
}


