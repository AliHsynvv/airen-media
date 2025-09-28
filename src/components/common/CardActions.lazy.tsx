'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const Inner = dynamic(() => import('./CardActions'), { ssr: false })

interface Props {
  articleId: string
  articleSlug: string
  views?: number
  comments?: number
  likes?: number
  liked?: boolean
  saved?: boolean
  hideLabels?: boolean
  className?: string
}

export default function CardActionsLazy(props: Props) {
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
    }, { rootMargin: '80px' })
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  return (
    <div ref={ref}>
      {visible ? <Inner {...props} /> : null}
    </div>
  )
}


