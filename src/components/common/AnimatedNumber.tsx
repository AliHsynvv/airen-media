'use client'

import { useEffect, useRef, useState } from 'react'

export default function AnimatedNumber({ value, duration = 900, className = '' }: { value: number; duration?: number; className?: string }) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)
  const fromRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    startRef.current = null
    fromRef.current = display
    const step = (t: number) => {
      if (startRef.current == null) startRef.current = t
      const progress = Math.min(1, (t - startRef.current) / duration)
      const next = Math.round(fromRef.current + (value - fromRef.current) * progress)
      setDisplay(next)
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration])

  return <span className={className}>{display.toLocaleString()}</span>
}


