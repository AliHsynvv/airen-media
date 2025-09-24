'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import DoubleTapLike from '@/components/community/DoubleTapLike'

interface Props {
  href: string
  imageUrl?: string | null
  imageAlt?: string | null
  variant: 'fixed' | 'responsive' | 'grid'
  storyId: string
}

export default function StoryMediaClient({ href, imageUrl, imageAlt, variant, storyId }: Props) {
  const onLike = () => {
    try { window.dispatchEvent(new CustomEvent('story:doubletap', { detail: { storyId } })) } catch {}
  }

  return (
    <DoubleTapLike onLike={onLike}>
      <Link href={href} className="block">
        <div
          className={cn(
            'relative overflow-hidden',
            variant === 'fixed'
              ? 'w-full rounded-t-xl aspect-[4/5] sm:aspect-[3/4]'
              : 'w-screen sm:w-full left-1/2 -ml-[50vw] sm:ml-0 sm:left-0 rounded-none sm:rounded-t-2xl aspect-[3/4] sm:aspect-[3/4]'
          )}
        >
          <Image
            src={imageUrl || '/next.svg'}
            alt={imageAlt || ''}
            fill
            priority={false}
            className={cn(
              'object-cover',
              variant === 'fixed' ? '' : 'transform scale-[1.08] sm:scale-100'
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
    </DoubleTapLike>
  )
}


