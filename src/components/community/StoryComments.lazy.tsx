'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const StoryComments = dynamic(() => import('./StoryComments'), { ssr: false })

interface Props {
  storyId: string
  className?: string
}

export default function StoryCommentsLazy({ storyId, className }: Props) {
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
    <div ref={ref} className={className}>
      {visible ? (
        <StoryComments storyId={storyId} />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Yorumlar yükleniyor…</div>
      )}
    </div>
  )
}


