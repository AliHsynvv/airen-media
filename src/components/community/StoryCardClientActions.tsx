'use client'

import { useState } from 'react'
import StoryCardActions from '@/components/community/StoryCardActions'
import dynamic from 'next/dynamic'
const StoryComments = dynamic(() => import('@/components/community/StoryComments'), { ssr: false })

type Props = {
  storyId: string
  initialLikes: number
  initialComments?: number
  storySlug?: string | null
  storyTitle?: string
  className?: string
}

export default function StoryCardClientActions({ storyId, initialLikes, initialComments = 0, storySlug, storyTitle, className }: Props) {
  const [open, setOpen] = useState(false)
  const [commentCount, setCommentCount] = useState<number>(initialComments)
  // local UI state for comment count badge

  return (
    <>
      <StoryCardActions
        storyId={storyId}
        initialLikes={initialLikes}
        initialComments={commentCount}
        storySlug={storySlug}
        storyTitle={storyTitle}
        className={className}
        onComment={() => setOpen(true)}
      />

      {/* Mobile comment sheet */}
      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 bottom-0 max-h-[78vh] rounded-t-2xl bg-white shadow-2xl overflow-hidden animate-sheet-up">
            <div className="relative px-4 py-3 border-b border-gray-200">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 h-1.5 w-12 rounded-full bg-gray-300" />
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">Yorumlar</div>
                <button onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-800">Kapat</button>
              </div>
            </div>
            <div className="overflow-y-auto px-4 pb-4 pt-3 max-h-[calc(78vh-48px)]">
              <StoryComments storyId={storyId} variant="minimal" onSubmitted={async () => {
                type CountResponse = { success?: boolean; count?: number }
                type AltResponse = { data?: { success?: boolean; count?: number }; count?: number }
                const raw = await fetch(`/api/community/stories/${storyId}/comments-count`).then(r => r.json()).catch(() => null) as CountResponse | AltResponse | null
                const newCount =
                  raw && 'count' in raw && typeof raw.count === 'number' ? raw.count
                  : raw && 'data' in raw && raw.data && typeof raw.data.count === 'number' ? raw.data.count
                  : null
                if (typeof newCount === 'number') setCommentCount(newCount)
                else setCommentCount(c => c + 1)
              }} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}


