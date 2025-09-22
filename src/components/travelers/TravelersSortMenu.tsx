'use client'

import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'

interface TravelersSortMenuProps {
  currentSort: string
  basePath?: string
}

const OPTIONS: Array<{ key: string; label: string }> = [
  { key: 'new', label: 'Newest' },
  { key: 'followers', label: 'Followers' },
  { key: 'following', label: 'Following' },
  { key: 'name', label: 'Name' },
]

export default function TravelersSortMenu({ currentSort, basePath = '/travelers' }: TravelersSortMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (!ref.current) return
      if (ref.current.contains(t)) return
      setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onEsc) }
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
        aria-label="Sort"
      >
        <SlidersHorizontal className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg p-1 z-50">
          {OPTIONS.map(opt => {
            const active = (currentSort || 'new') === opt.key
            const href = `${basePath}?sort=${encodeURIComponent(opt.key)}`
            return (
              <Link
                key={opt.key}
                href={href}
                className={`block px-3 py-2 text-sm rounded-md ${active ? 'bg-black text-white' : 'text-gray-800 hover:bg-gray-50'}`}
                onClick={() => setOpen(false)}
              >
                {opt.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}


