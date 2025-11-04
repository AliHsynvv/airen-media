import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, MapPin, Users, Video, BookOpen, MessageCircle, Play, ArrowRight, Newspaper, Building2 } from "lucide-react"
import { supabaseAdmin } from "@/lib/supabase/server"
import Link from "next/link"
import nextDynamic from "next/dynamic"
import { getTranslations } from 'next-intl/server'
const ArticleCard = nextDynamic(() => import("@/components/articles/ArticleCard"))
const MeetAirenButton = nextDynamic(() => import("@/components/home/MeetAirenButton").then(mod => mod.default))
const HeroSearch = nextDynamic(() => import("@/components/home/HeroSearch").then(mod => mod.default))
const HeroLiveStats = nextDynamic(() => import("@/components/home/HeroLiveStats").then(mod => mod.default))
const HomeStoriesGridLazy = nextDynamic(() => import("@/components/home/HomeStoriesGrid.lazy").then(mod => mod.default))
import HeroTitle from "@/components/home/HeroTitle"
const StoryCard = nextDynamic(() => import("@/components/community/StoryCard").then(mod => mod.default))
const AnimatedNumber = nextDynamic(() => import("@/components/common/AnimatedNumber").then(mod => mod.default))
const HomeCompaniesSection = nextDynamic(() => import("@/components/home/HomeCompaniesSection").then(mod => mod.default))
const HomeCountriesSection = nextDynamic(() => import("@/components/home/HomeCountriesSection").then(mod => mod.default))
const AutoScrollCarousel = nextDynamic(() => import("@/components/home/AutoScrollCarousel").then(mod => mod.default))

export const dynamic = 'force-dynamic'

export default async function Home() {
  const t = await getTranslations('home')
  const [countriesRes, usersRes, storiesRes, newsCountRes, businessCountRes] = await Promise.all([
    supabaseAdmin.from('countries').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('users_profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('user_stories').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabaseAdmin.from('articles').select('id', { count: 'exact', head: true }).eq('type', 'news').eq('status', 'published'),
    supabaseAdmin.from('business_profiles').select('id', { count: 'exact', head: true })
  ])
  const stats = {
    countries: countriesRes.count || 0,
    travelers: usersRes.count || 0,
    stories: storiesRes.count || 0,
    news: newsCountRes.count || 0,
    businesses: businessCountRes.count || 0,
  }
  const [newsRes, storiesListRes, businessRes, countriesListRes] = await Promise.all([
    supabaseAdmin
      .from('articles')
      .select('id,title,slug,excerpt,featured_image,image_alt,category_id,view_count,reading_time,published_at,featured,type, article_tags:article_tags(tags(id,name,slug,color)), article_likes(count), article_comments(count)')
      .eq('type', 'news')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(12),
    supabaseAdmin
      .from('user_stories')
      .select('id,title,content,slug,image_url,image_alt,location,category,tags,created_at, community_story_comments(count), users_profiles:users_profiles!user_stories_user_id_fkey(id,full_name,username,avatar_url)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(12),
    supabaseAdmin
      .from('business_profiles')
      .select('id,name,description,category,profile_image_url,cover_image_url,location,phone,email,website,average_rating,is_active,created_at')
      .eq('is_active', true)
      .order('average_rating', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(12),
    supabaseAdmin
      .from('countries')
      .select('*')
      .order('featured', { ascending: false, nullsFirst: false })
      .order('name', { ascending: true })
      .limit(20)
  ])
  const latestNews = newsRes.data ?? []
  const latestStories = storiesListRes.data ?? []
  const featuredBusinesses = businessRes.data ?? []
  const featuredCountries = countriesListRes.data ?? []
  return (
    <div className="space-y-8 py-6 sm:py-12">
      {/* Hero Section - Light minimal style with large orb */}
      <section className="relative overflow-hidden">
        {/* light backdrop gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
        <div className="relative container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-4 md:py-10 lg:py-16">
            {/* Left: Heading & CTAs */}
            <div className="space-y-8 text-left">
              {/* Live Stats above heading */}
              <HeroLiveStats />
              <div className="space-y-6">
                <HeroTitle />
                <p className="text-lg lg:text-xl text-gray-600 max-w-xl">
                  {t('hero.description')}
                </p>
              </div>

              {/* Hero Search */}
              <HeroSearch />

              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full">
                <div className="w-full sm:w-1/2 min-w-0">
                  <Button asChild size="lg" className="h-12 w-full rounded-full text-white font-semibold uppercase tracking-wide px-5 sm:px-6 shadow-lg bg-gradient-to-r from-[#141432] via-[#5b21b6] to-[#a21caf] hover:from-[#1a1a44] hover:via-[#6d28d9] hover:to-[#db2777] border-0 text-xs sm:text-sm">
                    <Link href="/profile">
                      <span className="inline-flex items-center justify-center">
                        {t('hero.socialMediaButton')}
                        <span className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/10">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </span>
                    </Link>
                  </Button>
                </div>
                <div className="w-full sm:w-1/2 min-w-0">
                  <MeetAirenButton fullWidth className="text-xs sm:text-sm" />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 pt-6">
                {/* 1. News */}
                <Link href="/news" aria-label="View news" className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur p-3 sm:p-4 shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-50 text-gray-600">
                      <Newspaper className="h-5 w-5" />
                    </span>
                    <AnimatedNumber value={stats.news} className="text-2xl sm:text-3xl font-bold text-gray-900" />
                  </div>
                  <div className="mt-1 text-[10px] sm:text-xs text-gray-600 group-hover:text-gray-900 uppercase tracking-wide">{t('stats.news')}</div>
                </Link>

                {/* 2. Stories */}
                <Link href="/community" aria-label="View stories" className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur p-3 sm:p-4 shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-50 text-gray-600">
                      <BookOpen className="h-5 w-5" />
                    </span>
                    <AnimatedNumber value={stats.stories} className="text-2xl sm:text-3xl font-bold text-gray-900" />
                  </div>
                  <div className="mt-1 text-[10px] sm:text-xs text-gray-600 group-hover:text-gray-900 uppercase tracking-wide">{t('stats.stories')}</div>
                </Link>

                {/* 3. Companies */}
                <Link href="/community/business" aria-label="View companies" className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur p-3 sm:p-4 shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-50 text-gray-600">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <AnimatedNumber value={stats.businesses} className="text-2xl sm:text-3xl font-bold text-gray-900" />
                  </div>
                  <div className="mt-1 text-[10px] sm:text-xs text-gray-600 group-hover:text-gray-900 uppercase tracking-wide">Companies</div>
                </Link>

                {/* 4. Countries */}
                <Link href="/countries" aria-label="View countries" className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur p-3 sm:p-4 shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-50 text-gray-600">
                      <Globe className="h-5 w-5" />
                    </span>
                    <AnimatedNumber value={stats.countries} className="text-2xl sm:text-3xl font-bold text-gray-900" />
                  </div>
                  <div className="mt-1 text-[10px] sm:text-xs text-gray-600 group-hover:text-gray-900 uppercase tracking-wide">{t('stats.countries')}</div>
                </Link>

                {/* 5. Travelers */}
                <Link href="/travelers" aria-label="View travelers" className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur p-3 sm:p-4 shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-50 text-gray-600">
                      <Users className="h-5 w-5" />
                    </span>
                    <AnimatedNumber value={stats.travelers} className="text-2xl sm:text-3xl font-bold text-gray-900" />
                  </div>
                  <div className="mt-1 text-[10px] sm:text-xs text-gray-600 group-hover:text-gray-900 uppercase tracking-wide">{t('stats.travelers')}</div>
                </Link>
              </div>
            </div>

            {/* Right: Large orb with embedded video */}
            <div className="relative mx-auto lg:mx-0">
              {/* floating globe badge */}
              <div className="absolute -top-2 right-12 hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 shadow-sm animate-gentle-bounce">
                <Globe className="h-5 w-5" />
              </div>
            <div className="relative h-[320px] w-[320px] sm:h-[400px] sm:w-[400px] lg:h-[520px] lg:w-[520px] max-w-full rounded-full mx-auto overflow-hidden shadow-inner">
                {/* Background video */}
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  src="/Airen%208.mp4"
                  playsInline
                  muted
                  loop
                  autoPlay
                  preload="metadata"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="w-full px-2 sm:px-4">
        <div className="relative mb-6 sm:mb-8">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl opacity-50 blur-xl" />
          
          {/* Content Card */}
          <div className="relative bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Newspaper className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                
                {/* Title & Badge */}
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    {t('latestNews.title')}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 mt-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-blue-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    {t('latestNews.badge')}
                  </span>
                </div>
              </div>
              
              {/* View All Links */}
              <Link href="/news" className="sm:hidden inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md text-xs font-medium hover:shadow-lg transition-all">
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/news" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all">
                {t('latestNews.viewMore')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        {/* Auto Scroll Carousel */}
        <AutoScrollCarousel autoScrollInterval={3000} gradientColor="gray-50">
          {latestNews.map((a: any, i: number) => (
            <div 
              key={a.id} 
              className="carousel-item flex-shrink-0 w-[85vw] sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] opacity-0 translate-x-8 animate-[slideIn_0.6s_ease_forwards]" 
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <ArticleCard article={a} theme="light" className="h-[480px] sm:h-[500px] lg:h-[560px]" />
            </div>
          ))}
        </AutoScrollCarousel>
      </section>

      {/* Latest Community */}
      <section className="container mx-auto px-2 sm:px-4">
        <div className="relative mb-6 sm:mb-8">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl opacity-50 blur-xl" />
          
          {/* Content Card */}
          <div className="relative bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                
                {/* Title & Subtitle */}
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    {t('community.title')}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 mt-1.5 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    {t('community.subtitle')}
                  </span>
                </div>
              </div>
              
              {/* View All Links */}
              <Link href="/community" className="sm:hidden inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md text-xs font-medium hover:shadow-lg transition-all">
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/community" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all">
                {t('community.viewMore')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        <HomeStoriesGridLazy stories={latestStories} />
      </section>

      {/* Companies */}
      <HomeCompaniesSection companies={featuredBusinesses} />

      {/* Explore Countries */}
      <HomeCountriesSection countries={featuredCountries} />

      {/* Why Airen - now placed here */}
      <section className="container mx-auto px-4">
        <div className="text-left mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            {t('whyAiren.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            {t('whyAiren.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Video className="h-5 w-5 text-gray-600" />
              </div>
              <CardTitle className="text-gray-900">{t('whyAiren.features.aiInfluencer.title')}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('whyAiren.features.aiInfluencer.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <MapPin className="h-5 w-5 text-gray-600" />
              </div>
              <CardTitle className="text-gray-900">{t('whyAiren.features.detailedGuides.title')}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('whyAiren.features.detailedGuides.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <CardTitle className="text-gray-900">{t('whyAiren.features.community.title')}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('whyAiren.features.community.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <BookOpen className="h-5 w-5 text-gray-600" />
              </div>
              <CardTitle className="text-gray-900">{t('whyAiren.features.articlesNews.title')}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('whyAiren.features.articlesNews.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Video className="h-5 w-5 text-gray-600" />
              </div>
              <CardTitle className="text-gray-900">{t('whyAiren.features.videoContent.title')}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('whyAiren.features.videoContent.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <MessageCircle className="h-5 w-5 text-gray-600" />
              </div>
              <CardTitle className="text-gray-900">{t('whyAiren.features.interactive.title')}</CardTitle>
              <CardDescription className="text-gray-600">
                {t('whyAiren.features.interactive.description')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section - simple light card */}
      <section className="container mx-auto px-4">
        <Card className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-2xl">
          <CardContent className="p-6 sm:p-10">
            <div className="text-center space-y-5">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {t('cta.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="h-11 px-6 rounded-md bg-black text-white hover:bg-black/90">
                  {t('cta.getStarted')}
                </Button>
                <Button size="lg" variant="outline" className="h-11 rounded-md border-gray-200 bg-white text-gray-900 hover:bg-gray-50">
                  {t('cta.learnMore')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}