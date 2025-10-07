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

type Props = {
  business: any
  viewsCount: number
  engagementsCount: number
  averageRating: number
  recentPosts: any[]
  recentReviews: any[]
}

export default function BusinessDashboardClient({ business, viewsCount, engagementsCount, averageRating, recentPosts, recentReviews }: Props) {
  const [active, setActive] = useState<'dashboard' | 'posts' | 'reviews' | 'listings' | 'media' | 'settings' | 'analytics' | 'profile' | 'inbox'>('dashboard')
  const [posts, setPosts] = useState<any[]>(recentPosts || [])
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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="w-full grid grid-cols-[220px_1fr] gap-6 p-6">
        <aside className="rounded-2xl bg-white border border-gray-100 p-4 h-fit">
          <div className="flex items-center gap-3 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {business.profile_image_url ? <img src={business.profile_image_url} alt="" className="h-8 w-8 rounded-full object-cover" /> : <div className="h-8 w-8 rounded-full bg-gray-200" />}
            <div className="text-sm font-medium truncate">{business.name}</div>
          </div>
          <nav className="space-y-1 text-sm">
            <button onClick={() => setActive('dashboard')} className={`block w-full text-left rounded-lg px-3 py-2 ${active === 'dashboard' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}>Home</button>
            <button onClick={() => setActive('posts')} className={`block w-full text-left rounded-lg px-3 py-2 ${active === 'posts' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}>Posts</button>
            <button onClick={() => setActive('reviews')} className={`block w-full text-left rounded-lg px-3 py-2 ${active === 'reviews' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}>Reviews</button>
            <button onClick={() => setActive('listings')} className={`block w-full text-left rounded-lg px-3 py-2 ${active === 'listings' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}>Listings</button>
            <button onClick={() => setActive('media')} className={`block w-full text-left rounded-lg px-3 py-2 ${active === 'media' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}>Media</button>
            <button onClick={() => setActive('profile')} className={`block w-full text-left rounded-lg px-3 py-2 ${active === 'profile' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}>Profile</button>
            <button onClick={() => setActive('settings')} className={`block w-full text-left rounded-lg px-3 py-2 ${active === 'settings' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}>Settings</button>
          </nav>
        </aside>

        <main className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{active === 'media' ? 'Media' : active === 'reviews' ? 'Reviews' : active === 'listings' ? 'Listings' : active === 'posts' ? 'Posts' : active === 'settings' ? 'Settings' : 'Dashboard'}</h1>
              <p className="text-sm text-gray-600">{active === 'media' ? 'Manage your photos and videos' : active === 'posts' ? '' : 'Tekrar hoş geldiniz, ' + business.name + '. İşletme performansınıza genel bakış.'}</p>
            </div>
            <div className="flex items-center gap-2">
              {active !== 'media' && <Link href="/business/me" className="h-9 inline-flex items-center rounded-full border border-gray-200 px-4 text-sm hover:bg-gray-50">Public Profile</Link>}
              {active === 'dashboard' && <CreatePostDialog businessId={business.id} />}
              {active === 'media' && <button onClick={openMediaUpload} className="h-9 inline-flex items-center rounded-full border border-gray-200 px-4 text-sm hover:bg-gray-50">Upload Media</button>}
            </div>
          </div>

          {active === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
                  <div className="text-sm text-gray-500">Total Views</div>
                  <div className="mt-1 text-2xl font-semibold">{viewsCount ?? 0}</div>
                  <div className="text-xs text-emerald-600 mt-1">+10%</div>
                </div>
                <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
                  <div className="text-sm text-gray-500">Average Rating</div>
                  <div className="mt-1 text-2xl font-semibold">{averageRating ? averageRating.toFixed(1) : '—'}</div>
                  <div className="text-xs text-rose-600 mt-1">-2%</div>
                </div>
                <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
                  <div className="text-sm text-gray-500">Post Engagement</div>
                  <div className="mt-1 text-2xl font-semibold">{engagementsCount ?? 0}</div>
                  <div className="text-xs text-emerald-600 mt-1">+15%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section className="rounded-2xl bg-white border border-gray-100 p-4 lg:col-span-2 shadow-sm">
                  <h2 className="font-semibold mb-3">Recent Bookings</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="py-2 pr-3">BOOKING ID</th>
                          <th className="py-2 pr-3">LISTING</th>
                          <th className="py-2 pr-3">CUSTOMER</th>
                          <th className="py-2 pr-3">DATE</th>
                          <th className="py-2 pr-3">STATUS</th>
                          <th className="py-2 pr-3">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(posts || []).map((p: any) => {
                          const status = p.status === 'published' ? 'Confirmed' : p.status === 'scheduled' ? 'Pending' : 'Draft'
                          const pillClass = status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' : status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-700'
                          return (
                            <tr key={p.id} className="border-t">
                              <td className="py-2 pr-3">#{String(p.id).slice(0,6)}</td>
                              <td className="py-2 pr-3">{p.title || '—'}</td>
                              <td className="py-2 pr-3">—</td>
                              <td className="py-2 pr-3">{p.published_at ? new Date(p.published_at).toLocaleDateString() : '—'}</td>
                              <td className="py-2 pr-3"><span className={`px-2 py-1 rounded-full text-xs ${pillClass}`}>{status}</span></td>
                              <td className="py-2 pr-3">
                                {p.status !== 'published' ? (
                                  <button className="text-emerald-600 hover:underline" onClick={() => updatePostStatus(p.id, 'published')}>Publish</button>
                                ) : (
                                  <button className="text-gray-600 hover:underline" onClick={() => updatePostStatus(p.id, 'draft')}>Unpublish</button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                        {(!recentPosts || recentPosts.length === 0) && (
                          <tr><td className="py-4 text-gray-500" colSpan={5}>Kayıt yok.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
                  <h2 className="font-semibold mb-3">Reviews</h2>
                  <ReviewsPanel items={recentReviews || []} />
                </section>
              </div>
            </>
          )}

          {active === 'reviews' && (
            <section className="rounded-2xl bg-white border border-gray-100 p-4">
              <h2 className="font-semibold mb-3">Yorumlar</h2>
              <ReviewsPanel items={recentReviews || []} />
            </section>
          )}

          {active === 'analytics' && (
            <section className="rounded-2xl bg-white border border-gray-100 p-4">
              <h2 className="font-semibold mb-2">Analitik (Son 30 gün)</h2>
              <AnalyticsChart businessId={business.id} />
            </section>
          )}

          {active === 'profile' && (
            <>
              <section className="rounded-2xl bg-white border border-gray-100 p-4">
                <h2 className="font-semibold mb-2">Profil Görselleri</h2>
                <BusinessProfileMedia businessId={business.id} currentProfileUrl={business.profile_image_url} currentCoverUrl={business.cover_image_url} />
              </section>
              <BusinessProfileForm business={business} />
            </>
          )}

          {active === 'media' && (
            <section className="rounded-2xl bg-white border border-gray-100 p-4">
              <BusinessMediaGrid businessId={business.id} />
            </section>
          )}

          {active === 'posts' && (
            <section className="rounded-2xl bg-white border border-gray-100 p-4">
              <BusinessPostsTable businessId={business.id} />
            </section>
          )}

          {active === 'listings' && (
            <section className="rounded-2xl bg-white border border-gray-100 p-4">
              <div className="text-sm text-gray-600">Listings bölümü yakında.</div>
            </section>
          )}

          {active === 'inbox' && (
            <section className="rounded-2xl bg-white border border-gray-100 p-4">
              <div className="text-sm text-gray-600">Inbox bölümü yakında.</div>
            </section>
          )}

          {active === 'settings' && (
            <section className="rounded-2xl bg-white border border-gray-100 p-4">
              <div className="text-sm text-gray-600">Settings bölümü yakında.</div>
            </section>
          )}
        </main>

        {/* Global dialog/panel mounts */}
        <MediaUploader businessId={business.id} />
      </div>
    </div>
  )
}


