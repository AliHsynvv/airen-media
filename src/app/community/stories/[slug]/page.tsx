import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/server'
import StoryComments from '@/components/community/StoryComments'
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

  return (
    <div className="container mx-auto px-0 sm:px-4 py-4 sm:py-8">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <div className="px-4 sm:px-0">
          <Link href="/community" className="inline-flex items-center text-sm text-gray-700 hover:text-black border border-gray-200 bg-white rounded-md px-3 py-1">
            <ArrowLeft className="h-4 w-4 mr-2" /> Hikayelere Dön
          </Link>
        </div>

        {/* Story card using the same design as home/community */}
        <StoryCard story={story as any} variant="responsive" />

        {/* Comments */}
        <div className="px-4 sm:px-0" id="comments">
          <StoryComments storyId={story.id} />
        </div>
      </div>
    </div>
  )
}


