'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { UserStory } from '@/types/story'
const StoryCard = dynamic(() => import('@/components/community/StoryCard').then(m => m.StoryCard))

type Story = UserStory & {
  users_profiles?: {
    id: string
    full_name: string | null
    username: string | null
    avatar_url: string | null
  }
  community_story_comments?: Array<{ count: number }>
}

export default function SocialFeed() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch('/api/community/stories')
        const json = await res.json()
        
        if (json.success && json.data) {
          // Son 12 story'yi al
          setStories(json.data.slice(0, 12))
        }
      } catch (error) {
        console.error('Error fetching stories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  if (loading) {
    return (
      <div className="overflow-hidden py-2 sm:py-4">
        <div className="flex gap-2 sm:gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] sm:w-[200px] h-[220px] sm:h-[280px] bg-gray-200 animate-pulse rounded-xl sm:rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!stories.length) {
    return (
      <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
        Henüz story paylaşılmamış
      </div>
    )
  }

  // Stories'i iki kez tekrarla ki animasyon sonsuz görünsün
  const duplicatedStories = [...stories, ...stories]

  return (
    <div className="overflow-hidden py-2 sm:py-4 relative">
      <div className="animate-scroll-horizontal flex gap-2 sm:gap-3">
        {duplicatedStories.map((story, idx) => (
          <div key={`${story.id}-${idx}`} className="flex-shrink-0 w-[160px] sm:w-[200px]">
            <StoryCard story={story} variant="grid" />
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes scroll-horizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll-horizontal {
          animation: scroll-horizontal 60s linear infinite;
        }
        
        .animate-scroll-horizontal:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}


