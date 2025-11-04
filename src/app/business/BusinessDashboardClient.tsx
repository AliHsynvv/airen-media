'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ReviewsPanel from '@/components/business/ReviewsPanel'
import CreatePostDialog from '@/components/business/CreatePostDialog'
import AnalyticsChart from '@/components/business/AnalyticsChart'
import BusinessProfileMedia from '@/components/business/BusinessProfileMedia'
import BusinessProfileForm from '@/components/business/BusinessProfileForm'
import MediaUploader from '@/components/business/MediaUploader'
import BusinessMediaGrid from '@/components/business/BusinessMediaGrid'
import BusinessPostsTable from '@/components/business/BusinessPostsTable'
import ServicesManager from '@/components/business/ServicesManager'
import { 
  LayoutDashboard, 
  FileText, 
  Star, 
  Image, 
  Settings, 
  User, 
  ListChecks,
  TrendingUp,
  Eye,
  MessageSquare,
  Calendar,
  Plus,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Upload,
  Package
} from 'lucide-react'

type Props = {
  business: any
  viewsCount: number
  engagementsCount: number
  averageRating: number
  recentPosts: any[]
  recentReviews: any[]
}

export default function BusinessDashboardClient({ business, viewsCount, engagementsCount, averageRating, recentPosts, recentReviews }: Props) {
  const [active, setActive] = useState<'dashboard' | 'posts' | 'reviews' | 'services' | 'listings' | 'media' | 'settings' | 'analytics' | 'profile' | 'inbox'>('dashboard')
  const [posts, setPosts] = useState<any[]>(recentPosts || [])
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  useEffect(() => { setPosts(recentPosts || []) }, [recentPosts])

  const updatePostStatus = async (id: string, toStatus: 'published' | 'draft') => {
    const prev = posts
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: toStatus, published_at: toStatus === 'published' ? new Date().toISOString() : null } : p))
    try {
      await fetch(`/api/business/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: toStatus, published_at: toStatus === 'published' ? new Date().toISOString() : null, scheduled_at: toStatus === 'published' ? null : undefined })
      })
      try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('business:post-updated')) } catch {}
    } catch (e: any) {
      setPosts(prev) // revert
      alert(e?.message || 'Güncelleme hatası')
    }
  }

  const openNewPost = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = '#new-post'
    }
  }
  const openMediaUpload = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = '#upload-media'
    }
  }

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'services', label: 'Services', icon: Package },
    { key: 'posts', label: 'Posts', icon: FileText },
    { key: 'reviews', label: 'Reviews', icon: Star },
    { key: 'listings', label: 'Listings', icon: ListChecks },
    { key: 'media', label: 'Media', icon: Image },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-100 to-orange-100 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 p-4 sm:p-6 relative">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl shadow-gray-900/50 flex items-center justify-center hover:scale-110 transition-transform duration-300"
        >
          {showMobileMenu ? (
            <ChevronRight className="h-6 w-6 rotate-90" />
          ) : (
            <LayoutDashboard className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowMobileMenu(false)}
          >
            <div 
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {business.profile_image_url ? (
                  <img src={business.profile_image_url} alt="" className="h-12 w-12 rounded-xl object-cover ring-2 ring-white shadow-lg" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ring-2 ring-white shadow-lg">
                    <span className="text-white font-bold text-lg">{business.name[0]}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">{business.name}</div>
                  <div className="text-xs text-gray-500 truncate">{business.category || 'Business'}</div>
                </div>
              </div>
              
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = active === item.key
                  return (
                    <button 
                      key={item.key}
                      onClick={() => {
                        setActive(item.key as any)
                        setShowMobileMenu(false)
                      }} 
                      className={`
                        group flex items-center gap-3 w-full text-left rounded-xl px-4 py-3 text-sm font-medium
                        transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-900/30' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span>{item.label}</span>
                      {isActive && (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-2xl shadow-gray-900/5 p-6 h-fit">
            {/* Business Header */}
            <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {business.profile_image_url ? (
                <img src={business.profile_image_url} alt="" className="h-12 w-12 rounded-xl object-cover ring-2 ring-white shadow-lg" />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ring-2 ring-white shadow-lg">
                  <span className="text-white font-bold text-lg">{business.name[0]}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">{business.name}</div>
                <div className="text-xs text-gray-500 truncate">{business.category || 'Business'}</div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = active === item.key
                return (
                  <button 
                    key={item.key}
                    onClick={() => setActive(item.key as any)} 
                    className={`
                      group flex items-center gap-3 w-full text-left rounded-xl px-4 py-3 text-sm font-medium
                      transition-all duration-300 relative overflow-hidden
                      ${isActive 
                        ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-900/30' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</div>
              <div className="space-y-2">
                <button
                  onClick={openNewPost}
                  className="flex items-center gap-2 w-full text-left rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Post
                </button>
                <button
                  onClick={openMediaUpload}
                  className="flex items-center gap-2 w-full text-left rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Upload Media
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          {/* Header */}
          {active !== 'media' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl shadow-gray-900/5 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span>Business</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-gray-900 font-medium">
                      {active === 'reviews' ? 'Reviews' : active === 'services' ? 'Services' : active === 'listings' ? 'Listings' : active === 'posts' ? 'Posts' : active === 'settings' ? 'Settings' : active === 'profile' ? 'Profile' : 'Dashboard'}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {active === 'reviews' ? 'Customer Reviews' : active === 'services' ? 'Məhsullar & Xidmətlər' : active === 'listings' ? 'Listings' : active === 'posts' ? 'Content Posts' : active === 'settings' ? 'Settings' : active === 'profile' ? 'Business Profile' : `Welcome back, ${business.name}`}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {active === 'reviews' ? 'View and respond to customer feedback' :
                     active === 'services' ? 'İşinizin məhsul və xidmətlərini idarə edin' :
                     active === 'posts' ? 'Create and manage your content' :
                     active === 'profile' ? 'Update your business information' :
                     active === 'dashboard' ? 'Here\'s what\'s happening with your business today' : 
                     'Manage your business settings'}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link 
                    href="/business/me" 
                    className="inline-flex items-center gap-2 h-11 rounded-xl border-2 border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="hidden sm:inline">View Public Profile</span>
                  </Link>
                  {active === 'dashboard' && <CreatePostDialog businessId={business.id} />}
                </div>
              </div>
            </div>
          )}

          {active === 'dashboard' && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Views Card */}
                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <TrendingUp className="h-5 w-5 text-white/80" />
                    </div>
                    <div className="text-sm font-medium text-blue-100 mb-1">Total Views</div>
                    <div className="text-3xl font-bold text-white mb-2">{viewsCount?.toLocaleString() ?? 0}</div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-white/20 text-white font-semibold">+10%</span>
                      <span className="text-blue-100">vs last month</span>
                    </div>
                  </div>
                </div>

                {/* Average Rating Card */}
                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Star className="h-6 w-6 text-white fill-white" />
                      </div>
                      <BarChart3 className="h-5 w-5 text-white/80" />
                    </div>
                    <div className="text-sm font-medium text-amber-100 mb-1">Average Rating</div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {averageRating ? averageRating.toFixed(1) : '0.0'}
                      <span className="text-lg text-amber-100 ml-1">/5.0</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-white/20 text-white font-semibold">★★★★★</span>
                      <span className="text-amber-100">Excellent</span>
                    </div>
                  </div>
                </div>

                {/* Post Engagement Card */}
                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <TrendingUp className="h-5 w-5 text-white/80" />
                    </div>
                    <div className="text-sm font-medium text-purple-100 mb-1">Post Engagement</div>
                    <div className="text-3xl font-bold text-white mb-2">{engagementsCount?.toLocaleString() ?? 0}</div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-white/20 text-white font-semibold">+15%</span>
                      <span className="text-purple-100">vs last month</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Posts/Bookings Table */}
                <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-600" />
                        Recent Posts
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">Latest activity from your business</p>
                    </div>
                    <button
                      onClick={openNewPost}
                      className="h-9 px-4 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Plus className="h-4 w-4 inline mr-1" />
                      New Post
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          <th className="py-3 pr-3">ID</th>
                          <th className="py-3 pr-3">Title</th>
                          <th className="py-3 pr-3">Date</th>
                          <th className="py-3 pr-3">Status</th>
                          <th className="py-3 pr-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(posts || []).map((p: any) => {
                          const status = p.status === 'published' ? 'Published' : p.status === 'scheduled' ? 'Scheduled' : 'Draft'
                          const pillClass = status === 'Published' 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : status === 'Scheduled' 
                            ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                          return (
                            <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 pr-3">
                                <span className="font-mono text-xs text-gray-500">#{String(p.id).slice(0,8)}</span>
                              </td>
                              <td className="py-4 pr-3">
                                <div className="font-medium text-gray-900 truncate max-w-[200px]">{p.title || 'Untitled'}</div>
                              </td>
                              <td className="py-4 pr-3 text-gray-600">
                                {p.published_at ? new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                              </td>
                              <td className="py-4 pr-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${pillClass}`}>
                                  {status}
                                </span>
                              </td>
                              <td className="py-4 pr-3 text-right">
                                {p.status !== 'published' ? (
                                  <button 
                                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-xs hover:underline transition-colors" 
                                    onClick={() => updatePostStatus(p.id, 'published')}
                                  >
                                    Publish
                                  </button>
                                ) : (
                                  <button 
                                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-700 font-medium text-xs hover:underline transition-colors" 
                                    onClick={() => updatePostStatus(p.id, 'draft')}
                                  >
                                    Unpublish
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                        {(!recentPosts || recentPosts.length === 0) && (
                          <tr>
                            <td className="py-12 text-center text-gray-500" colSpan={5}>
                              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-sm font-medium">No posts yet</p>
                              <p className="text-xs text-gray-400 mt-1">Create your first post to get started</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Reviews Panel */}
                <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                  </div>
                  <ReviewsPanel items={recentReviews || []} />
                </section>
              </div>
            </>
          )}

          {active === 'reviews' && (
            <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
              </div>
              <ReviewsPanel items={recentReviews || []} />
            </section>
          )}

          {active === 'analytics' && (
            <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                  <p className="text-sm text-gray-600">Last 30 days performance</p>
                </div>
              </div>
              <AnalyticsChart businessId={business.id} />
            </section>
          )}

          {active === 'profile' && (
            <>
              <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Image className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Profile Images</h2>
                </div>
                <BusinessProfileMedia businessId={business.id} currentProfileUrl={business.profile_image_url} currentCoverUrl={business.cover_image_url} />
              </section>
              <BusinessProfileForm business={business} />
            </>
          )}

          {active === 'media' && (
            <BusinessMediaGrid businessId={business.id} />
          )}

          {active === 'services' && (
            <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6">
              <ServicesManager businessId={business.id} />
            </section>
          )}

          {active === 'posts' && (
            <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6">
              <BusinessPostsTable businessId={business.id} />
            </section>
          )}

          {active === 'listings' && (
            <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6">
              <div className="text-center py-16">
                <ListChecks className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Listings Coming Soon</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Manage your business listings, availability, and booking settings here.
                </p>
              </div>
            </section>
          )}

          {active === 'inbox' && (
            <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6">
              <div className="text-center py-16">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Inbox Coming Soon</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Communicate with your customers directly through your inbox.
                </p>
              </div>
            </section>
          )}

          {active === 'settings' && (
            <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6">
              <div className="text-center py-16">
                <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Settings Coming Soon</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Configure your business preferences, notifications, and account settings.
                </p>
              </div>
            </section>
          )}
        </main>

        {/* Global dialog/panel mounts */}
        <MediaUploader businessId={business.id} />
      </div>
    </div>
  )
}


