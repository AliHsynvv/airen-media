'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface Props {
  src?: string | null
  alt?: string
  className?: string
  fallbackLabel?: string
  roundedClassName?: string
}

export default function EnlargeableAvatar({ src, alt = 'avatar', className, fallbackLabel = 'U', roundedClassName = 'rounded-full' }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={[className || '', 'overflow-hidden bg-gray-100 flex items-center justify-center', roundedClassName].join(' ')}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/default-avatar.svg' }} />
        ) : (
          <img src="/default-avatar.svg" alt="default avatar" className="h-full w-full object-cover" />
        )}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-xl p-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {src ? (
            <img src={src} alt={alt} className="w-full h-auto object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/default-avatar.svg' }} />
          ) : (
            <img src="/default-avatar.svg" alt="default avatar" className="w-full h-auto object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}


