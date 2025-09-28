'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const StoryCard = dynamic(() => import('@/components/community/StoryCard').then(m => m.StoryCard))

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 sm:gap-3">
          {stories.map((s: any, i: number) => (
            <div key={s.id} className="opacity-0 translate-y-4 animate-[fadein_0.6s_ease_forwards] sm:px-0" style={{ animationDelay: `${i * 80}ms` }}>
              <StoryCard story={s as any} variant="responsive" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-md animate-pulse border border-gray-200 bg-white" />
          ))}
        </div>
      )}
    </div>
  )
}


