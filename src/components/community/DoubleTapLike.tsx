'use client'

import { useRef, useState } from 'react'
import { Heart } from 'lucide-react'

interface Props {
  onLike: () => Promise<void> | void
  onSingleTap?: () => void
  children: React.ReactNode
  thresholdMs?: number
}

export default function DoubleTapLike({ onLike, onSingleTap, children, thresholdMs = 320 }: Props) {
  const lastTapRef = useRef<number>(0)
  const singleTimerRef = useRef<number | null>(null)
  const [burst, setBurst] = useState(false)

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now()
    if (now - lastTapRef.current < thresholdMs) {
      // prevent navigating the underlying Link on the 2nd tap
      try { e.preventDefault(); e.stopPropagation() } catch {}
      if (singleTimerRef.current) { try { clearTimeout(singleTimerRef.current) } catch {} singleTimerRef.current = null }
      Promise.resolve(onLike()).finally(() => {
        setBurst(false)
        // trigger reflow for animation restart
        requestAnimationFrame(() => setBurst(true))
        setTimeout(() => setBurst(false), 700)
      })
    }
    lastTapRef.current = now
    // schedule single tap action
    if (singleTimerRef.current) { try { clearTimeout(singleTimerRef.current) } catch {} }
    singleTimerRef.current = window.setTimeout(() => {
      singleTimerRef.current = null
      try { onSingleTap?.() } catch {}
    }, thresholdMs + 30)
  }

  return (
    <div className="relative" onClick={handleTap}>
      {children}
      {burst && (
        <>
          {/* Ripple */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="like-ripple" />
          </span>
          {/* Glow */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="like-glow" />
          </span>
          {/* Heart */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Heart className="like-heart" fill="#ff1f3d" stroke="#ff1f3d" />
          </span>
          {/* Sparks */}
          {[...Array(12)].map((_, i) => (
            <span key={i} className="like-spark" style={{ ['--i' as unknown as string]: String(i) }} />
          ))}
        </>
      )}
      <style jsx>{`
        @keyframes like-heart-pop { 0% { transform: scale(0.3); opacity: 0; } 22% { transform: scale(1.25); opacity: 1; } 60% { transform: scale(1.02); opacity: 1; } 100% { transform: scale(0.98); opacity: 0; } }
        @keyframes like-ripple-wave { 0% { transform: scale(0.3); opacity: 0.0; } 35% { opacity: 0.28; } 100% { transform: scale(1.7); opacity: 0; } }
        @keyframes like-glow-pulse { 0% { transform: scale(0.55); opacity: 0; } 28% { opacity: 0.9; } 100% { transform: scale(1.45); opacity: 0; } }
        @keyframes like-spark-fly { 0% { transform: rotate(calc(var(--angle) * 1deg)) translate(0) scale(0.7); opacity: 0; } 18% { opacity: 1; } 100% { transform: rotate(calc(var(--angle) * 1deg)) translate(64px) scale(1); opacity: 0; } }
        /* Remove dark edges/shadows completely */
        .like-heart { height: 128px; width: 128px; color: #ff1f3d; animation: like-heart-pop 900ms cubic-bezier(.18,.85,.2,1); fill: #ff1f3d; will-change: transform, opacity; stroke: none; }
        .like-ripple { position: absolute; height: 196px; width: 196px; border-radius: 9999px; border: 4px solid rgba(255,31,61,0.22); animation: like-ripple-wave 900ms ease-out; mix-blend-mode: screen; }
        .like-glow { position: absolute; height: 170px; width: 170px; border-radius: 9999px; background: radial-gradient(circle at center, rgba(255,31,61,0.46) 0%, rgba(255,31,61,0.2) 45%, rgba(255,31,61,0) 70%); animation: like-glow-pulse 900ms ease-out; mix-blend-mode: screen; }
        .like-spark { position: absolute; inset: 0; margin: auto; height: 8px; width: 8px; background: radial-gradient(circle at center, #ffd1d8 0%, #ff6b88 55%, #ff1f3d 100%); border-radius: 9999px; --angle: calc(var(--i) * 30); transform-origin: center; animation: like-spark-fly 900ms ease-out forwards; }
      `}</style>
    </div>
  )}


