import { getServerSupabase } from '@/lib/supabase/server-ssr'
import Link from 'next/link'
import BusinessProfileMedia from '@/components/business/BusinessProfileMedia'
import BusinessQuickCreate from '@/components/business/BusinessQuickCreate'
import ReviewsPanel from '@/components/business/ReviewsPanel'
import CreatePostDialog from '@/components/business/CreatePostDialog'
import AnalyticsChart from '@/components/business/AnalyticsChart'
import BusinessProfileForm from '@/components/business/BusinessProfileForm'
import MediaUploader from '@/components/business/MediaUploader'
import BusinessDashboardClient from './BusinessDashboardClient'

export default async function BusinessDashboardPage() {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-3">İşletme Paneli</h1>
        <p className="text-gray-600">Devam etmek için lütfen giriş yapın.</p>
        <div className="mt-4"><Link href="/auth/login" className="underline">Giriş yap</Link></div>
      </div>
    )
  }

  const { data: business } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!business) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">İşletme Paneli</h1>
        <p className="text-gray-600">Henüz işletme oluşturmadınız. Aşağıdan hızlıca oluşturun.</p>
        <BusinessQuickCreate ownerId={user.id} />
      </div>
    )
  }

  // KPIs
  const [{ count: viewsCount }, { count: engagementsCount }] = await Promise.all([
    supabase.from('business_analytics_events').select('*', { count: 'exact', head: true }).eq('business_id', business.id).eq('event_type', 'view'),
    supabase.from('business_analytics_events').select('*', { count: 'exact', head: true }).eq('business_id', business.id).eq('event_type', 'post_engagement'),
  ])
  // Use database average_rating if available, otherwise calculate from reviews
  const averageRating = business.average_rating || 0

  // Lists
  const [{ data: recentPosts }, { data: recentReviews }] = await Promise.all([
    supabase
      .from('business_posts')
      .select('id,title,status,scheduled_at,published_at,created_at')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('business_reviews')
      .select('id,user_id,rating,comment,created_at,status,users:users_profiles!business_reviews_user_id_fkey(full_name,username,avatar_url)')
      .eq('business_id', business.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <BusinessDashboardClient
      business={business}
      viewsCount={viewsCount || 0}
      engagementsCount={engagementsCount || 0}
      averageRating={averageRating || 0}
      recentPosts={recentPosts || []}
      recentReviews={recentReviews || []}
    />
  )
}
