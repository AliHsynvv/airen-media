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
      <div className={cn('block w-full group', className)}>
        <Link href={href} className="block">
          <div className="relative aspect-square overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
            <Image
              src={story.image_url || '/next.svg'}
              alt={story.image_alt || story.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, 200px"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Story Info Overlay on Hover */}
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white text-xs font-semibold line-clamp-2 drop-shadow-lg">
                {story.title || story.content}
              </p>
            </div>
          </div>
        </Link>
      </div>
    )
  }
  return (
    <div className={cn('block w-full group', className)}>
      <Card className={cn(
        'overflow-hidden transition-all duration-300 bg-white flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-1',
        // Full-width on mobile, rounded corners preserved; tighter on desktop
        variant === 'fixed' ? 'w-[220px] border-2 border-gray-100 rounded-3xl' : 'w-full sm:max-w-none rounded-2xl sm:rounded-3xl border-0 sm:border-2 border-gray-100'
      )}>
        {/* Header: compact, minimal (client logic to route to /profile if self) */}
        <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-2 sm:gap-3 max-[390px]:gap-4 min-[391px]:gap-5 relative">
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
        <div className="py-3 px-3 sm:px-4 flex-1 flex flex-col gap-3">
          {/* Actions directly under the image, minimal spacing */}
          <StoryCardClientActions
            storyId={story.id}
            initialLikes={story.likes_count || 0}
            initialComments={Array.isArray(s.community_story_comments) ? s.community_story_comments[0]?.count || 0 : s.comments_count || 0}
            storySlug={story.slug}
            storyTitle={story.title}
            className="px-0 pr-2"
          />

          {/* Post description line: bold username + real content */}
          <Link href={href} className="block">
            <div className="text-base sm:text-[17px] text-gray-900 leading-relaxed">
              <span className="font-bold text-gray-900">{s.users_profiles?.username || s.users_profiles?.full_name || t('user')}</span>
              {' '}
              <span className="font-normal text-gray-800">
                {story.content}
              </span>
            </div>
          </Link>

          {/* Timestamp under description */}
          <div className="text-xs font-medium text-gray-500">
            {formatRelativeTime(story.created_at, locale)}
          </div>

          {/* Meta link (desktop) */}
          <div className="hidden sm:block">
            <Link 
              href={href + '#comments'} 
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors"
            >
              {t('viewAllComments')}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default StoryCard


