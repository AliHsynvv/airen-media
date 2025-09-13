'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Heart, Bell } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/formatters'

interface MyStoryRow {
  id: string
  title: string
  slug: string | null
  status: 'pending' | 'approved' | 'rejected' | 'featured'
  created_at: string
}

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [fullName, setFullName] = useState<string | null>(null)
  const [bio, setBio] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stories, setStories] = useState<MyStoryRow[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  // New data buckets
  const [savedArticles, setSavedArticles] = useState<Array<{ id: string; title: string; slug: string; featured_image?: string | null; image_alt?: string | null }>>([])
  const [savedCountries, setSavedCountries] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [likedArticles, setLikedArticles] = useState<Array<{ id: string; title: string; slug: string }>>([])
  const [favoriteCountries, setFavoriteCountries] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [articleComments, setArticleComments] = useState<Array<{ id: string; article_id: string; content: string; article?: { id: string; title: string; slug: string } }>>([])
  const [countryReviews, setCountryReviews] = useState<Array<{ id: string; country_id: string; comment: string | null; rating: number; country?: { id: string; name: string; slug: string } }>>([])
  const [notifications, setNotifications] = useState<Array<{ id: string; type: string; payload: any; created_at: string; is_read: boolean; liker?: { id: string; full_name?: string|null; username?: string|null; avatar_url?: string|null }; story?: { id: string; slug?: string|null; title?: string|null }; comment?: { id: string; content?: string|null } }>>([])
  const savedSectionRef = useRef<HTMLDivElement | null>(null)
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'comments' | 'notifications' | 'about'>('posts')
  const [followersCount, setFollowersCount] = useState<number>(0)
  const [followingCount, setFollowingCount] = useState<number>(0)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      const u = data.user
      setEmail(u?.email ?? null)
      setUserId(u?.id ?? null)
      if (u?.id) {
        const { data: p } = await supabase
          .from('users_profiles')
          .select('full_name, avatar_url, bio')
          .eq('id', u.id)
          .single()
        setFullName(p?.full_name ?? null)
        setAvatarUrl(p?.avatar_url ?? null)
        setBio(p?.bio || '')
        const { data: s } = await supabase
          .from('user_stories')
          .select('id,title,slug,status,created_at,image_url')
          .eq('user_id', u.id)
          .order('created_at', { ascending: false })
          .limit(100)
        setStories((s as any) || [])
        // Saved articles
        const { data: ab } = await supabase.from('article_bookmarks').select('article_id').eq('user_id', u.id)
        const articleIds = (ab || []).map((r: any) => r.article_id)
        if (articleIds.length) {
          const { data: arts } = await supabase.from('articles').select('id,title,slug,featured_image,image_alt').in('id', articleIds)
          setSavedArticles((arts as any) || [])
        }
        // Saved countries
        const { data: cb } = await supabase.from('country_bookmarks').select('country_id').eq('user_id', u.id)
        const countryIds = (cb || []).map((r: any) => r.country_id)
        if (countryIds.length) {
          const { data: cnts } = await supabase.from('countries').select('id,name,slug').in('id', countryIds)
          setSavedCountries((cnts as any) || [])
        }
        // Liked articles
        const { data: al } = await supabase.from('article_likes').select('article_id').eq('user_id', u.id)
        const likedIds = (al || []).map((r: any) => r.article_id)
        if (likedIds.length) {
          const { data: larts } = await supabase.from('articles').select('id,title,slug').in('id', likedIds)
          setLikedArticles((larts as any) || [])
        }
        // Favorite countries
        const { data: cf } = await supabase.from('country_favorites').select('country_id').eq('user_id', u.id)
        const favIds = (cf || []).map((r: any) => r.country_id)
        if (favIds.length) {
          const { data: fcnts } = await supabase.from('countries').select('id,name,slug').in('id', favIds)
          setFavoriteCountries((fcnts as any) || [])
        }
        // Article comments
        const { data: ac } = await supabase.from('article_comments').select('id,article_id,content,created_at').eq('user_id', u.id).order('created_at', { ascending: false })
        const acIds = (ac || []).map((r: any) => r.article_id)
        let acArts: any[] = []
        if (acIds.length) {
          const { data: arts2 } = await supabase.from('articles').select('id,title,slug').in('id', acIds)
          acArts = (arts2 as any) || []
        }
        setArticleComments(((ac as any) || []).map((r: any) => ({ ...r, article: acArts.find(a => a.id === r.article_id) })))
        // Country reviews
        const { data: cr } = await supabase.from('country_reviews').select('id,country_id,comment,rating,created_at').eq('user_id', u.id).order('created_at', { ascending: false })
        const crIds = (cr || []).map((r: any) => r.country_id)
        let crCnts: any[] = []
        if (crIds.length) {
          const { data: cnts2 } = await supabase.from('countries').select('id,name,slug').in('id', crIds)
          crCnts = (cnts2 as any) || []
        }
        setCountryReviews(((cr as any) || []).map((r: any) => ({ ...r, country: crCnts.find(c => c.id === r.country_id) })))

        // Notifications
        const { data: notifs } = await supabase.from('notifications').select('id,type,payload,created_at,is_read').order('created_at', { ascending: false }).limit(50)
        const likerIds = Array.from(new Set(((notifs as any[]) || []).map(n => n.payload?.liker_id).filter(Boolean)))
        const storyIds = Array.from(new Set(((notifs as any[]) || []).map(n => n.payload?.story_id).filter(Boolean)))
        const commentIds = Array.from(new Set(((notifs as any[]) || []).map(n => n.payload?.comment_id).filter(Boolean)))
        let likers: Record<string, any> = {}
        let storiesMap: Record<string, any> = {}
        let commentsMap: Record<string, any> = {}
        if (likerIds.length) {
          const { data: ps } = await supabase.from('users_profiles').select('id,full_name,username,avatar_url').in('id', likerIds)
          for (const p of (ps || [])) likers[(p as any).id] = p
        }
        if (storyIds.length) {
          const { data: ss } = await supabase.from('user_stories').select('id,slug,title').in('id', storyIds)
          for (const s of (ss || [])) storiesMap[(s as any).id] = s
        }
        if (commentIds.length) {
          const { data: cs } = await supabase.from('community_story_comments').select('id,content').in('id', commentIds)
          for (const c of (cs || [])) commentsMap[(c as any).id] = c
        }
        setNotifications(((notifs as any) || []).map((n: any) => ({
          ...n,
          liker: n.payload?.liker_id ? likers[n.payload.liker_id] : undefined,
          story: n.payload?.story_id ? storiesMap[n.payload.story_id] : undefined,
          comment: n.payload?.comment_id ? commentsMap[n.payload.comment_id] : undefined,
        })))

        // Follow counts (Instagram-like)
        const { count: followersCountRes } = await supabase
          .from('user_follows')
          .select('follower_id', { count: 'exact', head: true })
          .eq('following_id', u.id)
        const { count: followingCountRes } = await supabase
          .from('user_follows')
          .select('following_id', { count: 'exact', head: true })
          .eq('follower_id', u.id)
        setFollowersCount(followersCountRes || 0)
        setFollowingCount(followingCountRes || 0)
      }
      setLoading(false)
    }
    load()
  }, [])

  const pendingCount = useMemo(() => stories.filter(s => s.status === 'pending').length, [stories])
  const approvedCount = useMemo(() => stories.filter(s => s.status === 'approved' || s.status === 'featured').length, [stories])
  const savedTotal = useMemo(() => savedArticles.length + savedCountries.length, [savedArticles.length, savedCountries.length])

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const remove = async (id: string) => {
    if (!confirm('Hikayeyi silmek istediğinize emin misiniz?')) return
    setMsg(null)
    const { error } = await supabase.from('user_stories').delete().eq('id', id)
    if (error) setMsg(error.message)
    else {
      setStories(prev => prev.filter(s => s.id !== id))
      setMsg('Hikaye silindi')
    }
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const onPickAvatar = () => fileInputRef.current?.click()
  const onAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setMsg(null)
    setUploadingAvatar(true)
    try {
      const path = `${userId}/${Date.now()}_${file.name}`
      const candidates = [process.env.NEXT_PUBLIC_AVATARS_BUCKET || 'avatars', 'Avatars']
      let usedBucket: string | null = null
      let lastErr: any = null
      for (const b of candidates) {
        const { error: upErr } = await supabase.storage.from(b).upload(path, file, { cacheControl: '3600', upsert: false })
        if (!upErr) { usedBucket = b; break }
        lastErr = upErr
      }
      if (!usedBucket) throw lastErr || new Error('Upload failed')

      // Try public URL first; if inaccessible, fall back to signed URL
      const { data: pub } = supabase.storage.from(usedBucket).getPublicUrl(path)
      let finalUrl = pub.publicUrl
      try {
        const head = await fetch(finalUrl, { method: 'HEAD' })
        if (!head.ok) {
          const { data: signed, error: signErr } = await supabase.storage.from(usedBucket).createSignedUrl(path, 60 * 60 * 24 * 30) // 30 gün
          if (signErr) throw signErr
          finalUrl = signed.signedUrl
        }
      } catch {
        const { data: signed } = await supabase.storage.from(usedBucket).createSignedUrl(path, 60 * 60 * 24 * 30)
        if (signed?.signedUrl) finalUrl = signed.signedUrl
      }

      const { error: updErr } = await supabase.from('users_profiles').update({ avatar_url: finalUrl }).eq('id', userId)
      if (updErr) throw updErr
      setAvatarUrl(finalUrl)
      setMsg('Profil fotoğrafı güncellendi')
    } catch (err: any) {
      setMsg(err?.message || 'Yükleme başarısız')
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto px-0 sm:px-4 py-6 sm:py-10 bg-white">
      {!userId ? (
        <div className="text-black">Oturum bulunamadı. Lütfen giriş yapın.</div>
      ) : (
        <div className="space-y-6">
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onAvatarSelected} />
          {/* Header - Instagram-like */}
          <div className="rounded-none sm:rounded-xl border border-gray-200 bg-white p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <button onClick={onPickAvatar} className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-black text-xl">{(fullName || email || 'U')[0]}</span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center text-[10px] text-white">Değiştir</div>
            </button>
            <div className="flex-1 min-w-0 w-full space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-center sm:text-left">
                <div className="text-black font-semibold text-base sm:text-lg truncate">{fullName || 'Kullanıcı'}</div>
                <div className="text-gray-600 text-xs sm:text-sm truncate">{email}</div>
              </div>
              {/* Desktop actions (Instagram-like) */}
              <div className="hidden sm:flex items-center gap-2 sm:self-start sm:ml-auto">
                <Button variant="ghost" className="h-9 px-3 text-sm text-gray-700 hover:text-black" asChild>
                  <Link href="/profile/edit">Profili Düzenle</Link>
                </Button>
                <Button variant="ghost" className="h-9 px-3 text-sm text-gray-700 hover:text-black" disabled={uploadingAvatar} onClick={onPickAvatar}>Fotoğrafı Değiştir</Button>
                <Button variant="ghost" className="h-9 px-3 text-sm text-gray-700 hover:text-black" asChild>
                  <Link href="/community/stories/submit">Hikaye Paylaş</Link>
                </Button>
              </div>
              {/* Inline minimal stats */}
              <div className="mt-2">
                <div className="flex items-center gap-6 text-xs sm:text-sm text-gray-600">
                  <div><span className="text-black font-semibold">{approvedCount}</span> Gönderi</div>
                  <div><span className="text-black font-semibold">{followersCount}</span> Takipçi</div>
                  <div><span className="text-black font-semibold">{followingCount}</span> Takip</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-stretch sm:justify-end sm:hidden">
            <Button variant="secondary" className="w-full sm:w-auto h-9 text-sm border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
              <Link href="/profile/edit">Profili Düzenle</Link>
            </Button>
            <Button variant="secondary" className="w-full sm:w-auto h-9 text-sm border border-gray-200 bg-white text-black hover:bg-gray-50" disabled={uploadingAvatar} onClick={onPickAvatar}>
              {uploadingAvatar ? 'Yükleniyor...' : 'Fotoğrafı Değiştir'}
            </Button>
            <Button variant="secondary" className="w-full sm:w-auto h-9 text-sm border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
              <Link href="/community/stories/submit">Hikaye Paylaş</Link>
            </Button>
          </div>
          {/* Inline Bio under header */}
          <div className="w-full">
            <div className="mt-3 text-left">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs sm:text-sm text-gray-600">Hakkımda</div>
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {bio?.trim() ? bio : <span className="text-gray-500">Biyografi ekleyin</span>}
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-center gap-4 sm:gap-8 border-b border-gray-200 overflow-x-auto whitespace-nowrap px-2">
              {(['posts','saved','comments','notifications','about'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium shrink-0 ${activeTab === tab ? 'text-black border-b-2 border-black' : 'text-gray-600'}`}
                >
                  {tab === 'posts' ? 'Gönderiler' : tab === 'saved' ? 'Kaydedilenler' : tab === 'comments' ? 'Yorumlar' : tab === 'notifications' ? 'Bildirimler' : 'Hakkımda'}
                </button>
              ))}
            </div>

            <div className="p-4" ref={savedSectionRef}>
              {/* About (Bio) */}
              {activeTab === 'about' && (
                <div className="p-1 sm:p-2">
                  <div className="text-sm text-gray-600 mb-2">Biyografi</div>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Kendini tanıt..."
                    className="w-full h-28 rounded-md border border-gray-200 bg-white text-gray-900 p-2"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      className="h-9 px-4 bg-black text-white hover:bg-black/90"
                      onClick={async () => {
                        if (!userId) return
                        const { error } = await supabase.from('users_profiles').update({ bio }).eq('id', userId)
                        setMsg(error ? error.message : 'Biyografi güncellendi')
                      }}
                    >
                      Kaydet
                    </Button>
                  </div>
                </div>
              )}
              {activeTab === 'posts' && (
                loading ? (
                  <>
                    <h3 className="mb-2 text-sm font-medium text-gray-900">Gönderilerim</h3>
                    <div className="grid grid-cols-3 gap-[2px] sm:gap-1">
                    {Array.from({ length: 9 }).map((_, i) => (<div key={i} className="aspect-square bg-gray-100 animate-pulse" />))}
                    </div>
                  </>
                ) : approvedCount ? (
                  <>
                    <h3 className="mb-2 text-sm font-medium text-gray-900">Gönderilerim</h3>
                    <div className="grid grid-cols-3 gap-[2px] sm:gap-1">
                    {stories.filter(s => s.status === 'approved' || s.status === 'featured').map(s => (
                      <Link key={s.id} href={s.slug ? `/community/stories/${s.slug}` : '#'} className="block group">
                        <div className="relative aspect-square overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={(s as any).image_url || '/next.svg'} alt={s.title} className="h-full w-full object-cover group-hover:opacity-95" />
            </div>
                      </Link>
                ))}
              </div>
                  </>
                ) : (
                  <div className="text-gray-600 text-sm">Henüz gönderi yok.</div>
                )
              )}

              {activeTab === 'saved' && (
                <div className="space-y-4">
                    <div>
                    <div className="text-sm text-gray-500 mb-2">Haberler</div>
                    {savedArticles.length ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {savedArticles.map(a => (
                          <Link key={a.id} href={`/articles/${a.slug}`} className="block group">
                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                              <div className="relative aspect-[4/3] overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={a.featured_image || '/next.svg'} alt={a.image_alt || a.title} className="h-full w-full object-cover group-hover:opacity-95" />
                              </div>
                              <div className="p-2">
                                <div className="text-[13px] text-black line-clamp-2 min-h-[34px]">{a.title}</div>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                    ) : (
                      <div className="text-gray-600 text-sm">Kayıtlı haber yok.</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Ülkeler</div>
                    {savedCountries.length ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {savedCountries.map(c => (
                          <Link key={c.id} href={`/countries/${c.slug}`} className="block group">
                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                              <div className="relative aspect-[4/3] overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={"/next.svg"} alt={c.name} className="h-full w-full object-cover group-hover:opacity-95" />
                              </div>
                              <div className="p-2">
                                <div className="text-[13px] text-black line-clamp-2 min-h-[34px]">{c.name}</div>
                    </div>
                  </div>
                          </Link>
                ))}
              </div>
            ) : (
                      <div className="text-gray-600 text-sm">Kayıtlı ülke yok.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-200 p-3">
                    <div className="text-sm text-gray-500 mb-2">Haberler</div>
                    {articleComments.length ? (
                      <ul className="space-y-1">{articleComments.map(c => (<li key={c.id} className="text-black"><Link className="hover:underline" href={`/articles/${c.article?.slug || ''}`}>{c.article?.title || '—'}</Link>: <span className="text-gray-700">{c.content}</span></li>))}</ul>
                    ) : (
                      <div className="text-gray-600 text-sm">Yorum yok.</div>
                    )}
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <div className="text-sm text-gray-500 mb-2">Ülkeler</div>
                    {countryReviews.length ? (
                      <ul className="space-y-1">{countryReviews.map(r => (<li key={r.id} className="text-black"><Link className="hover:underline" href={`/countries/${r.country?.slug || ''}`}>{r.country?.name || '—'}</Link>: <span className="text-gray-700">{r.comment || `${r.rating}/5`}</span></li>))}</ul>
                    ) : (
                      <div className="text-gray-600 text-sm">Yorum yok.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="rounded-lg border border-gray-200 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Bildirimler</div>
                    {!!notifications.filter(n => !n.is_read).length && (
                      <Button
                        variant="secondary"
                        className="h-8 px-3 border border-gray-200 bg-white text-black hover:bg-gray-50"
                        onClick={async () => {
                          if (!userId) return
                          await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
                          setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                        }}
                      >
                        Tümünü okundu yap
                      </Button>
                    )}
                  </div>
                  {notifications.length ? (
                    <ul className="divide-y divide-gray-200">
                      {notifications.map(n => (
                        <li key={n.id} className="py-3">
                          <div className="flex items-start gap-3">
                            {n.type === 'comment_like' && n.liker?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={n.liker.avatar_url} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <div className={`h-8 w-8 rounded-full border flex items-center justify-center ${n.type === 'comment_like' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                {n.type === 'comment_like' ? <Heart className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              {n.type === 'comment_like' ? (
                                <div className="text-sm text-gray-900">
                                  <span className="font-medium">{n.liker?.full_name || n.liker?.username || 'Bir kullanıcı'}</span> yorumunu beğendi.
                                  {n.story?.slug && (
                                    <> <Link href={`/community/stories/${n.story.slug}`} className="underline">Hikayeyi gör</Link></>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-900">Bildirim</div>
                              )}
                              {n.type === 'comment_like' && n.comment?.content && (
                                <div className="mt-2 text-xs text-gray-700 border border-gray-200 bg-gray-50 rounded-md p-2 line-clamp-3">{n.comment.content}</div>
                              )}
                              <div className="text-xs text-gray-500 mt-0.5">{formatRelativeTime(n.created_at)}</div>
                            </div>
                            {!n.is_read && (
                              <Button
                                variant="secondary"
                                className="h-8 px-3 border border-gray-200 bg-white text-black hover:bg-gray-50"
                                onClick={async () => {
                                  await supabase.from('notifications').update({ is_read: true }).eq('id', n.id)
                                  setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x))
                                }}
                              >
                                Okundu
                              </Button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-600 text-sm">Bildirim yok.</div>
                  )}
                </div>
              )}
              {msg && <div className="mt-3 text-sm text-gray-600">{msg}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


