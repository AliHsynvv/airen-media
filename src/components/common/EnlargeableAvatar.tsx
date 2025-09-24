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
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span className="text-black text-2xl">{fallbackLabel?.[0] || 'U'}</span>
        )}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-xl p-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {src ? (
            <img src={src} alt={alt} className="w-full h-auto object-contain" />
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-100">
              <span className="text-4xl text-gray-600">{fallbackLabel?.[0] || 'U'}</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}


