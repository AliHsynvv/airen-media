'use client'

import { useEffect, useState } from 'react'
import { Newspaper, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface NewsItem {
  id: number
  title: string
  slug: string
  category_id: number
  published_at: string
}

export default function NewsMarquee() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news?limit=10')
        const json = await res.json()
        
        if (json.success && json.data) {
          setNews(json.data)
        }
      } catch (error) {
        console.error('Error fetching news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  if (loading) {
    return (
      <div className="bg-black text-white py-3 overflow-hidden">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Newspaper className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">Haberler</span>
          </div>
          <div className="h-4 bg-white/20 rounded w-full animate-pulse" />
        </div>
      </div>
    )
  }

  if (!news.length) return null

  return (
    <div className="bg-black text-white py-2 sm:py-3 overflow-hidden border-y-2 border-gray-900">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 pl-3 sm:pl-6">
          <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white text-black">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <span className="font-black text-xs sm:text-sm uppercase tracking-wider hidden sm:inline">Son Haberler</span>
          <span className="font-black text-xs uppercase tracking-wider sm:hidden">Haberler</span>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee inline-flex gap-4 sm:gap-8 pr-4 sm:pr-8">
            {news.concat(news).map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                href={`/articles/${item.slug}`}
                className="flex items-center gap-1.5 sm:gap-2 hover:text-gray-300 transition-colors flex-shrink-0"
              >
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white" />
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

