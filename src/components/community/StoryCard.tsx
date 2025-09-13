import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserStory } from '@/types/story'
import { cn } from '@/lib/utils'

interface StoryCardProps {
  story: UserStory
  className?: string
  variant?: 'fixed' | 'responsive'
}

export function StoryCard({ story, className, variant = 'fixed' }: StoryCardProps) {
  const href = story.slug ? `/community/stories/${story.slug}` : '#'
  return (
    <div className={cn('block w-full group', className)}>
      <Card className={cn(
        'overflow-hidden transition-transform hover:-translate-y-0.5 bg-white flex flex-col',
        variant === 'fixed' ? 'w-[240px] border border-gray-200' : 'w-full rounded-none sm:rounded-xl border-0 sm:border sm:border-gray-200'
      )}>
        <Link href={href} className="block">
          <div className={cn(
            'relative rounded-none sm:rounded-t-xl',
            variant === 'fixed' ? 'w-full' : 'w-[100vw] sm:w-full left-1/2 right-1/2 -ml-[50vw] sm:ml-0 sm:left-0 sm:right-0',
            'aspect-[3/4]'
          )}>
            <Image
              src={story.image_url || '/next.svg'}
              alt={story.image_alt || story.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute top-2 left-2">
              <Badge className="bg-black/60 text-white">
                {story.category || 'story'}
              </Badge>
            </div>
          </div>
        </Link>
        <div className="py-2 px-0 sm:px-3 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Link href={`/u/${(story as any).users_profiles?.id || ''}`} className="inline-flex items-center gap-2">
              { (story as any).users_profiles?.avatar_url ? (
                <img src={(story as any).users_profiles.avatar_url} alt="avatar" className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gray-200" />
              )}
              <div className="text-xs text-gray-700 hover:underline">{(story as any).users_profiles?.full_name || (story as any).users_profiles?.username || 'Kullanıcı'}</div>
            </Link>
          </div>
          <Link href={href} className="block">
            <h3 className="text-gray-900 font-semibold text-sm sm:text-base leading-5 line-clamp-2 min-h-[36px] sm:min-h-[40px]">
              {story.title}
            </h3>
            <p className="text-gray-700 text-xs sm:text-sm mt-2 leading-5 line-clamp-2 min-h-[36px] sm:min-h-[40px]">
              {story.content}
            </p>
          </Link>
          {story.tags?.length ? (
            <div className="mt-auto pt-2 flex flex-wrap gap-1">
              {story.tags.slice(0, 3).map(tag => (
                <Badge key={tag} className="border border-gray-200 bg-white text-gray-700">#{tag}</Badge>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}

export default StoryCard


