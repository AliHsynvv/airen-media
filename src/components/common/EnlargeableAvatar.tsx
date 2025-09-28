'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import Image from 'next/image'

interface Props {
  src?: string | null
  alt?: string
  className?: string
  fallbackLabel?: string
  roundedClassName?: string
}

export default function EnlargeableAvatar({ src, alt = 'avatar', className, fallbackLabel = 'U', roundedClassName = 'rounded-full' }: Props) {
  const [open, setOpen] = useState(false)
  const [thumbError, setThumbError] = useState(false)
  const [dialogError, setDialogError] = useState(false)
  const avatarSrc = thumbError ? '/default-avatar.svg' : (src || '/default-avatar.svg')
  const dialogSrc = dialogError ? '/default-avatar.svg' : (src || '/default-avatar.svg')

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={[className || '', 'relative overflow-hidden bg-gray-100 flex items-center justify-center', roundedClassName].join(' ')}>
        <Image
          src={avatarSrc}
          alt={alt}
          fill
          sizes="(max-width: 640px) 48px, 64px"
          className="object-cover"
          unoptimized
          onError={() => setThumbError(true)}
        />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-xl p-0 overflow-hidden">
          <Image
            src={dialogSrc}
            alt={alt}
            width={1200}
            height={800}
            className="w-full h-auto object-contain"
            unoptimized
            onError={() => setDialogError(true)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}


