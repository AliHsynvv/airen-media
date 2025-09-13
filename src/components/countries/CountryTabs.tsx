'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import CountryReviews from '@/components/countries/CountryReviews'

interface CountryTabsProps {
  countryId?: string
  countrySlug: string
  overview: React.ReactNode
}

type TabKey = 'overview' | 'reviews'

export default function CountryTabs({ countryId, countrySlug, overview }: CountryTabsProps) {
  const [tab, setTab] = useState<TabKey>('overview')

  return (
    <div className="mt-8">
      {/* Tab headers */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6 text-sm">
          <button
            className={`px-1 py-3 ${tab === 'overview' ? 'border-b-2 border-gray-900 text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-1 py-3 ${tab === 'reviews' ? 'border-b-2 border-gray-900 text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setTab('reviews')}
          >
            Reviews
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-6 space-y-6">
        {tab === 'overview' && (
          <>{overview}</>
        )}
        {tab === 'reviews' && (
          <Card className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Reviews</h3>
            <CountryReviews countryId={countryId} countrySlug={countrySlug} />
          </Card>
        )}
      </div>
    </div>
  )
}


