import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, MapPin, Users, Video, BookOpen, MessageCircle, Play, ArrowRight } from "lucide-react"
import { supabaseAdmin } from "@/lib/supabase/server"
import Link from "next/link"
import { ArticleCard } from "@/components/articles/ArticleCard"
import MeetAirenButton from "@/components/home/MeetAirenButton"
import StoryCard from "@/components/community/StoryCard"
import ElevenLabsInlineEmbed from "@/components/home/ElevenLabsInlineEmbed"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [countriesRes, usersRes, storiesRes] = await Promise.all([
    supabaseAdmin.from('countries').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('users_profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('user_stories').select('id', { count: 'exact', head: true }).eq('status', 'approved')
  ])
  const stats = {
    countries: countriesRes.count || 0,
    travelers: usersRes.count || 0,
    stories: storiesRes.count || 0,
  }
  const [newsRes, storiesListRes] = await Promise.all([
    supabaseAdmin
      .from('articles')
      .select('id,title,slug,excerpt,featured_image,image_alt,category_id,view_count,reading_time,published_at,featured,type, article_tags:article_tags(tags(id,name,slug,color)), article_likes(count), article_comments(count)')
      .eq('type', 'news')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(4),
    supabaseAdmin
      .from('user_stories')
      .select('id,title,slug,image_url,image_alt,category,tags,created_at, users_profiles:users_profiles!user_stories_user_id_fkey(id,full_name,username,avatar_url)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(4)
  ])
  const latestNews = newsRes.data ?? []
  const latestStories = storiesListRes.data ?? []
  return (
    <div className="space-y-8 py-12">
      {/* Hero Section - Light minimal style with large orb */}
      <section className="relative overflow-hidden">
        {/* light backdrop gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
        <div className="relative container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-16 lg:py-24">
            {/* Left: Heading & CTAs */}
            <div className="space-y-8 text-left">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900">
                  Discover the World with AI
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 max-w-xl">
                  Meet Airen, your AI travel companion who helps you explore amazing
                  destinations through personalized recommendations and immersive content.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Button size="lg" className="h-11 px-5 rounded-md bg-black text-white hover:bg-black/90">
                  Start Exploring
                  <span className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/10">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
                <MeetAirenButton />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-8">
                <div>
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span>{stats.countries.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-500">Countries</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{stats.travelers.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-500">Travelers</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span>{stats.stories.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-500">Stories</div>
                </div>
              </div>
            </div>

            {/* Right: Large orb with embedded video */}
            <div className="relative mx-auto lg:mx-0">
              {/* floating globe badge */}
              <div className="absolute -top-2 right-12 hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 shadow-sm">
                <Globe className="h-5 w-5" />
              </div>
              <div className="relative h-[320px] w-[320px] sm:h-[400px] sm:w-[400px] lg:h-[520px] lg:w-[520px] max-w-full rounded-full mx-auto">
                {/* Video as circular background */}
                <div className="absolute inset-0 rounded-full overflow-hidden shadow-inner">
                  <video
                    className="h-full w-full object-cover"
                    src="/Airen%208.mp4"
                    playsInline
                    loop
                    muted
                    autoPlay
                  />
                </div>
                {/* subtle overlays and rings */}
                <div className="absolute inset-0 rounded-full ring-1 ring-black/5" />
                <div className="absolute inset-12 rounded-full ring-1 ring-black/5" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent" />

                {/* content overlay removed as requested */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="w-full px-0 sm:px-4">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Son Haberler</h2>
            <p className="text-gray-600 text-sm">Gündemdeki 4 içerik</p>
          </div>
          <Link href="/news" className="text-sm text-gray-700 hover:underline hidden sm:inline">Daha fazla</Link>
        </div>
        <div className="sm:hidden mb-4">
          <Link href="/news" className="inline-block text-sm px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900">Daha fazla</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {latestNews.map((a: any, i: number) => (
            <div key={a.id} className="opacity-0 translate-y-4 animate-[fadein_0.6s_ease_forwards]" style={{ animationDelay: `${i * 80}ms` }}>
              <ArticleCard article={a} theme="light" />
            </div>
          ))}
        </div>
      </section>

      {/* Latest Community */}
      <section className="container mx-auto px-0 sm:px-4">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Topluluk</h2>
            <p className="text-gray-600 text-sm">Son 4 hikaye</p>
          </div>
          <Link href="/community" className="text-sm text-gray-700 hover:underline hidden sm:inline">Daha fazla</Link>
        </div>
        <div className="sm:hidden mb-4">
          <Link href="/community" className="inline-block text-sm px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900">Daha fazla</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 sm:gap-3">
          {latestStories.map((s: any, i: number) => (
            <div key={s.id} className="opacity-0 translate-y-4 animate-[fadein_0.6s_ease_forwards] sm:px-0" style={{ animationDelay: `${i * 80}ms` }}>
              <StoryCard story={s as any} variant="responsive" />
            </div>
          ))}
        </div>
      </section>

      {/* Inline ElevenLabs embed on Home (moved below Community) */}
      <section className="container mx-auto px-4">
        <ElevenLabsInlineEmbed />
      </section>

      {/* Why Airen - now placed here */}
      <section className="container mx-auto px-4">
        <div className="text-left mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Why Airen?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Explore the features that elevate your travel experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Video className="h-5 w-5 text-gray-600" />
              </div>
              <CardTitle className="text-gray-900">AI Influencer</CardTitle>
              <CardDescription className="text-gray-600">
                Real-time chat with Airen, get personalized suggestions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <MapPin className="h-5 w-5 text-gray-600" />
              </div>
              <CardTitle className="text-gray-900">Detailed Guides</CardTitle>
              <CardDescription className="text-gray-600">
                Comprehensive country guides and practical tips.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <CardTitle className="text-gray-900">Community</CardTitle>
              <CardDescription className="text-gray-600">
                Share experiences with a vibrant travel community.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <BookOpen className="h-5 w-5 text-gray-600" />
              </div>
              <CardTitle className="text-gray-900">Articles & News</CardTitle>
              <CardDescription className="text-gray-600">
                Stay up to date with curated travel news and insights.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Video className="h-5 w-5 text-gray-600" />
              </div>
              <CardTitle className="text-gray-900">Video Content</CardTitle>
              <CardDescription className="text-gray-600">
                Watch city overviews and engaging travel stories.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <MessageCircle className="h-5 w-5 text-gray-600" />
              </div>
              <CardTitle className="text-gray-900">Interactive</CardTitle>
              <CardDescription className="text-gray-600">
                Social integrations and real-time interactions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section - simple light card */}
      <section className="container mx-auto px-4">
        <Card className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-2xl">
          <CardContent className="p-10">
            <div className="text-center space-y-5">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Start your journey
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Plan your next trip with Airen and connect with travelers worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="h-11 px-6 rounded-md bg-black text-white hover:bg-black/90">
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="h-11 rounded-md border-gray-200 bg-white text-gray-900 hover:bg-gray-50">
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}