'use client'

import { Eye, MessageSquare, Share2, Bookmark, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

type CardActionsProps = {
  views?: number
  comments?: number
  // Story like support
  showViews?: boolean
  likes?: number
  liked?: boolean
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
  onSave?: () => void
  saved?: boolean
  hideLabels?: boolean
  className?: string
}

export default function CardActions({
  views = 0,
  comments = 0,
  showViews = true,
  likes = 0,
  liked = false,
  onLike,
  onComment,
  onShare,
  onSave,
  saved = false,
  hideLabels = true,
  className,
}: CardActionsProps) {
  const firstItem = showViews
    ? { key: 'views' as const, label: 'Görüntülenme', aria: 'Görüntülenme', Icon: Eye, onClick: undefined }
    : { key: 'like' as const, label: liked ? 'Beğenmekten vazgeç' : 'Beğen', aria: liked ? 'Beğenmekten vazgeç' : 'Beğen', Icon: Heart, onClick: onLike }

  const items = [
    firstItem,
    { key: 'comment' as const, label: 'Comment', aria: 'Yorum yap', Icon: MessageSquare, onClick: onComment },
    { key: 'share' as const, label: 'Paylaş', aria: 'Paylaş', Icon: Share2, onClick: onShare },
    { key: 'save' as const, label: saved ? 'Kaydedildi' : 'Kaydet', aria: saved ? 'Kaydedildi' : 'Kaydet', Icon: Bookmark, onClick: onSave },
  ]

  return (
    <div
      className={cn(
        'mt-auto border-t border-gray-200/70 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/60',
        className
      )}
    >
      <div className="grid grid-cols-4">
        {items.map(({ key, label, aria, Icon, onClick }) => (
          <button
            key={key}
            type="button"
            aria-label={aria}
            title={label}
            onClick={onClick}
            className={cn(
              'group flex items-center justify-center gap-2 py-3 min-h-11 rounded-md',
              key === 'like' && liked
                ? 'text-red-600 bg-red-50'
                : key === 'like'
                ? 'text-gray-600 hover:text-red-600'
                : key === 'save' && saved
                ? 'text-blue-700 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900',
              'transition-colors duration-150 ease-in-out',
              key === 'like' ? 'hover:bg-red-50' : key === 'save' ? 'hover:bg-blue-50' : 'hover:bg-gray-50',
              'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 transition-transform duration-150 ease-in-out group-hover:scale-110',
                key === 'like' && liked ? 'fill-red-600' : key === 'save' && saved ? 'fill-blue-700' : 'fill-transparent'
              )}
            />
            {!hideLabels && (
              <span className="text-sm font-medium max-[480px]:hidden">
                {key === 'views'
                  ? views.toLocaleString()
                  : key === 'comment'
                  ? comments.toLocaleString()
                  : key === 'like'
                  ? likes.toLocaleString()
                  : label}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}


