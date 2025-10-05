'use client'

import { useEffect, useState } from 'react'

type Point = { day: string; views: number; clicks: number; post_engagements: number }

export default function AnalyticsChart({ businessId }: { businessId: string }) {
  const [data, setData] = useState<Point[]>([])

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/business/analytics?business_id=${businessId}`)
        const j = await res.json()
        setData(j?.data || [])
      } catch {}
    }
    run()
  }, [businessId])

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px] grid grid-cols-4 text-sm">
        <div className="text-gray-500">Gün</div>
        <div className="text-gray-500">Görüntüleme</div>
        <div className="text-gray-500">Tıklama</div>
        <div className="text-gray-500">Post Etkileşimi</div>
        {data.map((d, i) => (
          <>
            <div key={`d-${i}`} className="py-1 border-t">{new Date(d.day).toLocaleDateString()}</div>
            <div className="py-1 border-t">{d.views}</div>
            <div className="py-1 border-t">{d.clicks}</div>
            <div className="py-1 border-t">{d.post_engagements}</div>
          </>
        ))}
        {data.length === 0 && <div className="col-span-4 py-2 text-gray-500">Veri yok.</div>}
      </div>
    </div>
  )
}


