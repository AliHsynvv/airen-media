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
        <div className="px-3 py-2 flex items-center gap-3">
          {/* Avatar */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Link href={`/u/${(story as any).users_profiles?.id || ''}`} className="shrink-0">
            {(story as any).users_profiles?.avatar_url ? (
              <img src={(story as any).users_profiles.avatar_url} alt="avatar" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gray-200" />
            )}
          </Link>

          {/* Username + Follow on the same line */}
          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
            <Link href={`/u/${(story as any).users_profiles?.id || ''}`} className="min-w-0">
              <div className="text-[13px] font-semibold text-gray-900 truncate">
                {(story as any).users_profiles?.full_name || (story as any).users_profiles?.username || 'Kullanıcı'}
              </div>
            </Link>
            {(story as any).users_profiles?.id && (
              <FollowButton profileId={(story as any).users_profiles.id} className="inline-flex ml-2 shrink-0" />
            )}
          </div>
        </div>

        {/* Media: full card width on mobile with rounded corners preserved */}
        <Link href={href} className="block">
          <div
            className={cn(
              'relative w-full overflow-hidden rounded-t-xl sm:rounded-t-2xl',
              // compact aspect for mobile and desktop
              'aspect-[16/10] sm:aspect-[4/3]'
            )}
          >
            <Image
              src={story.image_url || '/next.svg'}
              alt={story.image_alt || story.title}
              fill
              priority={false}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>

        {/* Content: tighter spacing and line-clamp */}
        <div className="py-2 px-3 sm:px-4 flex-1 flex flex-col gap-2">
          <Link href={href} className="block">
            <h3 className="text-gray-900 font-semibold text-[14px] sm:text-[15px] leading-5 line-clamp-2">
              {story.title}
            </h3>
            <p className="text-gray-600 text-[14px] sm:text-[14px] mt-1 leading-6 line-clamp-2">
              {story.content}
            </p>
          </Link>

          {/* Timestamp below post info */}
          <div className="text-[12px] text-gray-500">
            {formatRelativeTime(story.created_at)}
          </div>

          {/* Location metadata */}
          {(story as any).location && (
            <div className="flex items-center gap-2 text-gray-600 text-[12px] sm:text-[13px]">
              <MapPin className="h-4 w-4 text-gray-500" aria-hidden="true" />
              <span className="truncate">{(story as any).location}</span>
            </div>
          )}

          {/* Meta: hidden on mobile for minimalism */}
          <div className="hidden sm:block text-xs text-gray-500">
            <Link href={href + '#comments'} className="hover:underline">Tüm yorumları görüntüle</Link>
          </div>

          {/* Actions */}
          <StoryCardActions
            storyId={story.id}
            initialLikes={story.likes_count || 0}
            initialComments={(story as any).comments_count || 0}
            storySlug={story.slug}
            storyTitle={story.title}
          />
        </div>
      </Card>
    </div>
  )
}

export default StoryCard


