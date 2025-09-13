import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import StoryComments from '@/components/community/StoryComments'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CommunityStoryDetailPage(context: Props) {
  const { slug } = await context.params
  const { data: story } = await supabaseAdmin
    .from('user_stories')
    .select('*, users_profiles:users_profiles!user_stories_user_id_fkey(id,full_name,username,avatar_url)')
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

        {/* Full-bleed image on mobile */}
        {story.image_url && (
          <div className="relative w-[100vw] sm:w-full left-1/2 right-1/2 -ml-[50vw] sm:ml-0 sm:left-0 sm:right-0 aspect-[4/5] sm:aspect-video overflow-hidden rounded-none sm:rounded-xl">
            <Image src={story.image_url} alt={story.image_alt || story.title} fill className="object-cover" />
          </div>
        )}

        <div className="px-4 sm:px-0 space-y-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Link href={`/u/${story.users_profiles?.id || ''}`} className="inline-flex items-center gap-3">
              {story.users_profiles?.avatar_url ? (
                <img src={story.users_profiles.avatar_url} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gray-200" />
              )}
              <div>
                <div className="text-sm font-semibold text-gray-900 hover:underline">{story.users_profiles?.full_name || story.users_profiles?.username || 'Kullanıcı'}</div>
                <div className="text-xs text-gray-500">{new Date(story.created_at).toLocaleDateString()}</div>
              </div>
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{story.title}</h1>
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
            {story.category && (
              <Badge className="border border-gray-200 bg-white text-gray-700">{story.category}</Badge>
            )}
            {Array.isArray(story.tags) && story.tags.length > 0 && story.tags.slice(0, 8).map((t: string) => (
              <Badge key={t} className="border border-gray-200 bg-white text-gray-700 text-xs">#{t}</Badge>
            ))}
          </div>
        </div>

        <Card className="rounded-none sm:rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          <div className="prose max-w-none whitespace-pre-wrap text-gray-800">{story.content}</div>
        </Card>

        {/* Comments */}
        <div className="px-4 sm:px-0">
          <StoryComments storyId={story.id} />
        </div>
      </div>
    </div>
  )
}


