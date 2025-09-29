'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  storyId: string
  storySlug: string | null
  ownerId: string
  className?: string
}

export default function StoryCardOwnerMenu({ storyId, storySlug, ownerId, className }: Props) {
  const [meId, setMeId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data }) => { if (mounted) setMeId(data.user?.id || null) })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setMeId(session?.user?.id || null)
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  const isSelf = !!meId && meId === ownerId
  if (!isSelf) return null

  return (
    <div className={cn('relative', className)}>
        <button
          className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700"
          aria-label="Seçenekler"
          onClick={() => setOpen(v => !v)}
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg z-20">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => {
                setOpen(false)
                window.location.href = storySlug ? `/community/stories/${storySlug}/edit` : '/community/stories/submit?edit=1'
              }}
            >
              <Pencil className="h-4 w-4" /> Düzenle
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={async () => {
                setOpen(false)
                const ok = confirm('Hikayeyi silmek istediğinize emin misiniz?')
                if (!ok) return
                const { error } = await supabase.from('user_stories').delete().eq('id', storyId)
                if (error) {
                  alert(error.message)
                } else {
                  const el = document.getElementById(`story-${storyId}`)
                  if (el && el.parentElement) el.parentElement.removeChild(el)
                }
              }}
            >
              <Trash2 className="h-4 w-4" /> Sil
            </button>
          </div>
        )}
    </div>
  )
}


