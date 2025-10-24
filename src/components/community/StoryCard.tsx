'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { UserStory } from '@/types/story'
import { cn } from '@/lib/utils'
import StoryCardClientActions from '@/components/community/StoryCardClientActions'
// import { MapPin } from 'lucide-react'
import StoryMediaClient from '@/components/community/StoryMediaClient'
import { formatRelativeTime } from '@/lib/utils/formatters'
// import FollowButton from '@/components/profile/FollowButton'
import StoryCardHeaderClient from '@/components/community/StoryCardHeaderClient'
import StoryCardOwnerMenu from '@/components/community/StoryCardOwnerMenu'
import { useTranslations, useLocale } from 'next-intl'

type StoryWithAggregates = UserStory & {
  users_profiles?: {
    id?: string
    avatar_url?: string | null
    username?: string | null
    full_name?: string | null
  }
  community_story_comments?: Array<{ count?: number }>
  comments_count?: number
}

interface StoryCardProps {
  story: UserStory
  className?: string
  variant?: 'fixed' | 'responsive' | 'grid'
}

export function StoryCard({ story, className, variant = 'fixed' }: StoryCardProps) {
  const t = useTranslations('community.storyCard')
  const locale = useLocale()
  const s = story as StoryWithAggregates
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
              sizes="(max-width: 640px) 50vw, 200px"
              loading="lazy"
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
        {/* Header: compact, minimal (client logic to route to /profile if self) */}
        <div className="px-0 sm:px-3 py-2 flex items-center justify-between gap-2 sm:gap-3 max-[390px]:gap-4 min-[391px]:gap-5 relative">
          <StoryCardHeaderClient
            profileId={s.users_profiles?.id}
            avatarUrl={s.users_profiles?.avatar_url}
            username={s.users_profiles?.username}
            fullName={s.users_profiles?.full_name}
          />
          <div className="ml-auto">
            <StoryCardOwnerMenu storyId={story.id} storySlug={story.slug || null} ownerId={story.user_id} className="" />
          </div>
        </div>

        {/* Media: full-bleed on mobile (edge-to-edge), contained on desktop; double-tap to like */}
        <StoryMediaClient href={href} imageUrl={story.image_url} imageAlt={story.image_alt || story.title} variant={variant} storyId={story.id} />

        {/* Content block */}
        <div className="py-2 px-3 sm:px-4 flex-1 flex flex-col gap-2">
          {/* Actions directly under the image, minimal spacing */}
          <StoryCardClientActions
            storyId={story.id}
            initialLikes={story.likes_count || 0}
            initialComments={Array.isArray(s.community_story_comments) ? s.community_story_comments[0]?.count || 0 : s.comments_count || 0}
            storySlug={story.slug}
            storyTitle={story.title}
            className="px-0 -ml-4 sm:ml-0 pr-4 pt-2 pb-0"
          />

          {/* Post description line: bold username + real content; align to page-left on mobile */}
          <Link href={href} className="block -ml-4 sm:ml-0 pr-4 -mt-1">
            <div className="text-[16px] min-[430px]:text-[17px] sm:text-[17px] text-black leading-6 flex items-baseline gap-2">
              <span className="font-semibold shrink-0 text-black">{s.users_profiles?.username || s.users_profiles?.full_name || t('user')}</span>
              <span className="font-normal truncate flex-1 min-w-0 whitespace-nowrap text-black">
                {story.content}
              </span>
            </div>
          </Link>

          {/* Timestamp under description; align to page left using negative margin on mobile */}
          <div className="text-[12px] font-normal text-gray-500 text-left -ml-4 sm:ml-0 -mt-1">
            {formatRelativeTime(story.created_at, locale)}
          </div>

          {/* Meta link (desktop) */}
          <div className="hidden sm:block text-xs text-gray-500">
            <Link href={href + '#comments'} className="hover:underline">{t('viewAllComments')}</Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default StoryCard


