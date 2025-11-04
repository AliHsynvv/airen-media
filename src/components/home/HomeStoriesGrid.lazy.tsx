'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const StoryCard = dynamic(() => import('@/components/community/StoryCard').then(m => m.StoryCard))
const AutoScrollCarousel = dynamic(() => import('@/components/home/AutoScrollCarousel'))

interface Props {
  stories: any[]
}

export default function HomeStoriesGridLazy({ stories }: Props) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current || visible) return
    const el = ref.current
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        setVisible(true)
        io.disconnect()
      }
    }, { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  return (
    <div ref={ref}>
      {visible ? (
        <AutoScrollCarousel autoScrollInterval={3500} gradientColor="white">
          {stories.map((s: any, i: number) => (
            <div 
              key={s.id} 
              className="carousel-item flex-shrink-0 w-[85vw] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] xl:w-[calc(25%-12px)] opacity-0 translate-x-8 animate-[slideIn_0.6s_ease_forwards]" 
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <StoryCard story={s as any} variant="responsive" />
            </div>
          ))}
        </AutoScrollCarousel>
      ) : (
        <div className="overflow-x-auto scrollbar-hide pb-4">
          <div className="flex gap-3 min-w-full">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[85vw] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] xl:w-[calc(25%-12px)] aspect-square rounded-md animate-pulse border border-gray-200 bg-white" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


