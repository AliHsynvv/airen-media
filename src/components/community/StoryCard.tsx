import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { UserStory } from '@/types/story'
import { cn } from '@/lib/utils'
import StoryCardClientActions from '@/components/community/StoryCardClientActions'
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
        <div className="px-0 sm:px-3 py-2 flex items-center gap-2 sm:gap-3 max-[390px]:gap-4 min-[391px]:gap-5">
          {/* Avatar */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Link href={`/u/${(story as any).users_profiles?.id || ''}`} className="shrink-0">
            {(story as any).users_profiles?.avatar_url ? (
              <img src={(story as any).users_profiles.avatar_url} alt="avatar" className="h-12 w-12 max-[390px]:h-14 max-[390px]:w-14 min-[391px]:h-16 min-[391px]:w-16 sm:h-12 sm:w-12 lg:h-11 lg:w-11 rounded-full object-cover" />
            ) : (
              <div className="h-12 w-12 max-[390px]:h-14 max-[390px]:w-14 min-[391px]:h-16 min-[391px]:w-16 sm:h-12 sm:w-12 lg:h-11 lg:w-11 rounded-full bg-gray-200" />
            )}
          </Link>

          {/* Username + Follow on the same line */}
          <div className="flex-1 min-w-0 flex items-center justify-between gap-2 sm:gap-2">
            <div className="min-w-0">
              <Link href={`/u/${(story as any).users_profiles?.id || ''}`} className="min-w-0">
                <div className="text-[14px] max-[390px]:text-[18px] min-[391px]:text-[20px] sm:text-[15px] lg:text-[14px] font-semibold text-gray-900 truncate">
                  {(story as any).users_profiles?.username || (story as any).users_profiles?.full_name || 'Kullanıcı'}
                </div>
              </Link>
              {(story as any).location && (
                <div className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
                  <span className="truncate max-w-[60vw] sm:max-w-[240px]">{(story as any).location}</span>
                </div>
              )}
            </div>
            {(story as any).users_profiles?.id && (
              <FollowButton
                profileId={(story as any).users_profiles.id}
                className="inline-flex ml-2 shrink-0 h-7 px-2 text-xs max-[390px]:h-9 max-[390px]:px-4 max-[390px]:text-sm min-[391px]:h-10 min-[391px]:px-5 min-[391px]:text-base sm:h-8 sm:px-3 sm:text-xs"
              />
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
          <StoryCardClientActions
            storyId={story.id}
            initialLikes={story.likes_count || 0}
            initialComments={Array.isArray((story as any).community_story_comments) ? (story as any).community_story_comments[0]?.count || 0 : ((story as any).comments_count || 0)}
            storySlug={story.slug}
            storyTitle={story.title}
            className="px-0 -ml-4 sm:ml-0 pr-4 pt-2 pb-0"
          />

          {/* Post description line: bold username + real content; align to page-left on mobile */}
          <Link href={href} className="block -ml-4 sm:ml-0 pr-4 -mt-1">
            <div className="text-[16px] min-[430px]:text-[17px] sm:text-[17px] text-black leading-6 flex items-baseline gap-2">
              <span className="font-semibold shrink-0 text-black">{(story as any).users_profiles?.username || (story as any).users_profiles?.full_name || 'Kullanıcı'}</span>
              <span className="font-normal truncate flex-1 min-w-0 whitespace-nowrap text-black">
                {story.content}
              </span>
            </div>
          </Link>

          {/* Timestamp under description; align to page left using negative margin on mobile */}
          <div className="text-[12px] font-normal text-gray-500 text-left -ml-4 sm:ml-0 -mt-1">
            {formatRelativeTime(story.created_at)}
          </div>

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


