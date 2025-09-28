import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'
const StoryComments = dynamic(() => import('@/components/community/StoryComments.lazy'))
import { Card } from '@/components/ui/card'
import StoryCard from '@/components/community/StoryCard'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CommunityStoryDetailPage(context: Props) {
  const { slug } = await context.params
  const { data: story } = await supabaseAdmin
    .from('user_stories')
    .select('*, community_story_comments(count), users_profiles:users_profiles!user_stories_user_id_fkey(id,full_name,username,avatar_url)')
    .eq('slug', slug)
    .in('status', ['approved', 'featured'])
    .single()

  if (!story) return notFound()

  // More posts from the same user (exclude current)
  const moreRes = await supabaseAdmin
    .from('user_stories')
    .select('id,title,content,slug,image_url,image_alt,created_at, community_story_comments(count), users_profiles:users_profiles!user_stories_user_id_fkey(id,full_name,username,avatar_url)')
    .eq('user_id', (story as any).user_id)
    .neq('id', (story as any).id)
    .in('status', ['approved', 'featured'])
    .order('created_at', { ascending: false })
    .limit(12)
  const moreStories = moreRes.data || []

  return (
    <div className="container mx-auto px-0 sm:px-4 py-4 sm:py-8">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <div className="px-4 sm:px-0">
          <Link
            href="/community"
            className="inline-flex items-center h-9 px-3 rounded-full border border-gray-200/80 bg-white text-gray-800 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
            aria-label="Hikayelere dön"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Hikayelere Dön
          </Link>
        </div>

        {/* Story card using the same design as home/community */}
        <StoryCard story={story as any} variant="responsive" />

        {/* More from this user - use the same StoryCard design, vertical list */}
        {moreStories.length > 0 && (
          <div className="px-4 sm:px-0">
            <div className="mt-2 mb-3 text-sm text-gray-600">Bu kullanıcının diğer gönderileri</div>
            <div className="space-y-4">
              {moreStories.map((s: any) => (
                <StoryCard key={s.id} story={s as any} variant="responsive" />
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="px-4 sm:px-0" id="comments">
          <StoryComments storyId={story.id} />
        </div>
      </div>
    </div>
  )
}


