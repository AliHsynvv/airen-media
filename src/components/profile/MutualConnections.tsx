'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import FollowButton from '@/components/profile/FollowButton'

interface MutualProfile {
  id: string
  full_name?: string | null
  username?: string | null
  avatar_url?: string | null
}

export default function MutualConnections({ mutuals }: { mutuals: MutualProfile[] }) {
  const [open, setOpen] = useState(false)
  if (!Array.isArray(mutuals) || mutuals.length === 0) return null
  const firstThree = mutuals.slice(0, 3)
  const extra = Math.max(0, mutuals.length - firstThree.length)

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {firstThree.map(m => (
          <Link key={m.id} href={`/u/${m.id}`} className="block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {m.avatar_url ? (
              <img src={m.avatar_url} alt="avatar" className="h-full w-full object-cover" />
            ) : null}
          </Link>
        ))}
      </div>
      {extra > 0 && (
        <button type="button" onClick={() => setOpen(true)} className="text-xs text-gray-700 hover:underline">
          ve {extra} kişi
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ortak bağlantılar</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <ul className="divide-y divide-gray-200">
              {mutuals.map(m => (
                <li key={m.id} className="py-2">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gray-100" />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link href={`/u/${m.id}`} className="text-sm font-medium text-gray-900 hover:underline truncate">{m.full_name || m.username || 'Kullanıcı'}</Link>
                      <div className="text-xs text-gray-600 truncate">@{m.username || m.id.slice(0,6)}</div>
                    </div>
                    <FollowButton profileId={m.id} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


