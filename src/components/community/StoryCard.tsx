import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { UserStory } from '@/types/story'
import { cn } from '@/lib/utils'
import StoryCardActions from '@/components/community/StoryCardActions'
import { MapPin } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/formatters'
import FollowButton from '@/components/profile/FollowButton'

interface StoryCardProps {
  story: UserStory
  className?: string
  variant?: 'fixed' | 'responsive' | 'grid'
}

export function StoryCard({ story, className, variant = 'fixed' }: StoryCardProps) {
  const href = story.slug ? `/community/stories/${story.slug}` : '#'
  if (variant === 'grid') {
    return (
      <div className={cn('block w-full', className)}>
        <Link href={href} className="block">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={story.image_url || '/next.svg'}
              alt={story.image_alt || story.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 200px"
            />
          </div>
        </Link>
      </div>
    )
  }
  return (
    <div className={cn('block w-full group', className)}>
      <Card className={cn(
        'overflow-hidden transition-transform hover:-translate-y-0.5 bg-white flex flex-col shadow-sm hover:shadow-md',
        // Full-width on mobile, rounded corners preserved; tighter on desktop
        variant === 'fixed' ? 'w-[220px] border border-gray-200' : 'w-full sm:max-w-none rounded-xl sm:rounded-2xl border-0 sm:border border-gray-200'
      )}>
        {/* Header: compact, minimal */}
        <div className="px-0 sm:px-3 py-2 flex items-center gap-3">
          {/* Avatar */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Link href={`/u/${(story as any).users_profiles?.id || ''}`} className="shrink-0">
            {(story as any).users_profiles?.avatar_url ? (
              <img src={(story as any).users_profiles.avatar_url} alt="avatar" className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gray-200" />
            )}
          </Link>

          {/* Username + Follow on the same line */}
          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
            <Link href={`/u/${(story as any).users_profiles?.id || ''}`} className="min-w-0">
              <div className="text-[14px] sm:text-base font-semibold text-gray-900 truncate">
                {(story as any).users_profiles?.full_name || (story as any).users_profiles?.username || 'Kullanıcı'}
              </div>
            </Link>
            {(story as any).users_profiles?.id && (
              <FollowButton profileId={(story as any).users_profiles.id} className="inline-flex ml-2 shrink-0" />
            )}
          </div>
        </div>

        {/* Media: full-bleed on mobile (edge-to-edge), contained on desktop */}
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
              src={story.image_url || '/next.svg'}
              alt={story.image_alt || story.title}
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

        {/* Content block */}
        <div className="py-2 px-3 sm:px-4 flex-1 flex flex-col gap-2">
          {/* Actions directly under the image, minimal spacing */}
          <StoryCardActions
            storyId={story.id}
            initialLikes={story.likes_count || 0}
            initialComments={(story as any).comments_count || 0}
            storySlug={story.slug}
            storyTitle={story.title}
            className="px-0 -ml-4 sm:ml-0 pr-4 pt-2 pb-0"
          />

          {/* Post description line: bold username + real content; align to page-left on mobile */}
          <Link href={href} className="block -ml-4 sm:ml-0 pr-4 -mt-1">
            <div className="text-[15px] sm:text-[16px] text-black leading-6 flex items-baseline gap-2">
              <span className="font-semibold shrink-0 text-black">{(story as any).users_profiles?.full_name || (story as any).users_profiles?.username || 'Kullanıcı'}</span>
              <span className="font-normal truncate flex-1 min-w-0 whitespace-nowrap text-black">
                {story.content}
              </span>
            </div>
          </Link>

          {/* Timestamp under description; align to page left using negative margin on mobile */}
          <div className="text-[12px] font-normal text-gray-500 text-left -ml-4 sm:ml-0 -mt-1">
            {formatRelativeTime(story.created_at)}
          </div>

          {/* Location metadata */}
          {(story as any).location && (
            <div className="flex items-center gap-2 text-gray-600 text-[12px] sm:text-[13px]">
              <MapPin className="h-4 w-4 text-gray-500" aria-hidden="true" />
              <span className="truncate">{(story as any).location}</span>
            </div>
          )}

          {/* Meta link (desktop) */}
          <div className="hidden sm:block text-xs text-gray-500">
            <Link href={href + '#comments'} className="hover:underline">Tüm yorumları görüntüle</Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default StoryCard


