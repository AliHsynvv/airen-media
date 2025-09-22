'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import FollowButton from '@/components/profile/FollowButton'

interface Props {
  profileId?: string | null
  avatarUrl?: string | null
  username?: string | null
  fullName?: string | null
}

export default function StoryCardHeaderClient({ profileId, avatarUrl, username, fullName }: Props) {
  const [meId, setMeId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setMeId(data.user?.id || null)
    })
    return () => { mounted = false }
  }, [])

  const targetId = profileId || ''
  const isSelf = !!meId && !!targetId && meId === targetId
  const href = isSelf ? '/profile' : (targetId ? `/u/${targetId}` : '#')

  return (
    <div className="flex-1 min-w-0 flex items-center justify-between gap-2 sm:gap-2">
      <div className="min-w-0 flex items-center gap-3">
        <Link href={href} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="h-12 w-12 max-[390px]:h-14 max-[390px]:w-14 min-[391px]:h-16 min-[391px]:w-16 sm:h-12 sm:w-12 lg:h-11 lg:w-11 rounded-full object-cover" />
          ) : (
            <div className="h-12 w-12 max-[390px]:h-14 max-[390px]:w-14 min-[391px]:h-16 min-[391px]:w-16 sm:h-12 sm:w-12 lg:h-11 lg:w-11 rounded-full bg-gray-200" />
          )}
        </Link>
        <div className="min-w-0">
          <Link href={href} className="min-w-0">
            <div className="text-[14px] max-[390px]:text-[18px] min-[391px]:text-[20px] sm:text-[15px] lg:text-[14px] font-semibold text-gray-900 truncate">
              {username || fullName || 'Kullanıcı'}
            </div>
          </Link>
        </div>
      </div>
      {!!targetId && !isSelf && (
        <FollowButton
          profileId={targetId}
          className="inline-flex ml-2 shrink-0 h-7 px-2 text-xs max-[390px]:h-9 max-[390px]:px-4 max-[390px]:text-sm min-[391px]:h-10 min-[391px]:px-5 min-[391px]:text-base sm:h-8 sm:px-3 sm:text-xs"
        />
      )}
    </div>
  )
}


