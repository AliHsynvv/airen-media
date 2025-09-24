'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { logoutAndRedirect } from '@/lib/auth/logout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle, Search, Users, LayoutGrid, Bookmark, MessageSquareText, Plus, LogIn, UserPlus } from 'lucide-react'
import EnlargeableAvatar from '@/components/common/EnlargeableAvatar'
import { ROUTES } from '@/lib/utils/constants'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  const [username, setUsername] = useState<string | null>(null)
  const [bio, setBio] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stories, setStories] = useState<MyStoryRow[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ type: 'user' | 'story' | 'hashtag'; id: string; title?: string; username?: string; slug?: string; avatar_url?: string | null }>>([])
  // New data buckets
  const [savedArticles, setSavedArticles] = useState<Array<{ id: string; title: string; slug: string; featured_image?: string | null; image_alt?: string | null }>>([])
  const [savedCountries, setSavedCountries] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [likedArticles, setLikedArticles] = useState<Array<{ id: string; title: string; slug: string }>>([])
  const [favoriteCountries, setFavoriteCountries] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [articleComments, setArticleComments] = useState<Array<{ id: string; article_id: string; content: string; article?: { id: string; title: string; slug: string } }>>([])
  const [countryReviews, setCountryReviews] = useState<Array<{ id: string; country_id: string; comment: string | null; rating: number; country?: { id: string; name: string; slug: string } }>>([])
  const savedSectionRef = useRef<HTMLDivElement | null>(null)
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'comments'>('posts')
  const notifRef = useRef<HTMLDivElement | null>(null)
  const [followersCount, setFollowersCount] = useState<number>(0)
  const [followingCount, setFollowingCount] = useState<number>(0)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      const u = data.user
      setEmail(u?.email ?? null)
      setUserId(u?.id ?? null)
      if (!u?.id) { setLoading(false); return }

      const userIdLocal = u.id

      // Fast path: fetch essential profile payload via RPC for instant render
      try {
        const { data: rp } = await supabase.rpc('get_profile_payload', { p_user: userIdLocal })
        if (rp) {
          const profile = (rp as any).profile || {}
          const stories = (rp as any).stories || []
          const followers = (rp as any).followers || 0
          const following = (rp as any).following || 0
          setFullName(profile.full_name ?? null)
          setUsername(profile.username ?? null)
          setAvatarUrl(profile.avatar_url ?? null)
          setBio(profile.bio || '')
          setStories(stories)
          setFollowersCount(followers)
          setFollowingCount(following)
          // Allow UI to render quickly with essential data
          setLoading(false)
        }
      } catch {}

      // Load the rest of the data in background (bookmarks, likes, comments, reviews, counts)
      ;(async () => {
        const [
        profileRes,
        storiesRes,
        bookmarksRes,
        countryBookmarksRes,
        likesRes,
        favoritesRes,
        commentsRes,
        reviewsRes,
        followersCountQuery,
        followingCountQuery,
        ] = await Promise.all([
          supabase
            .from('users_profiles')
            .select('full_name, username, avatar_url, bio')
            .eq('id', userIdLocal)
            .single(),
          supabase
            .from('user_stories')
            .select('id,title,slug,status,created_at,image_url')
            .eq('user_id', userIdLocal)
            .order('created_at', { ascending: false })
            .limit(100),
          supabase.from('article_bookmarks').select('article_id').eq('user_id', userIdLocal),
          supabase.from('country_bookmarks').select('country_id').eq('user_id', userIdLocal),
          supabase.from('article_likes').select('article_id').eq('user_id', userIdLocal),
          supabase.from('country_favorites').select('country_id').eq('user_id', userIdLocal),
          supabase
            .from('article_comments')
            .select('id,article_id,content,created_at')
            .eq('user_id', userIdLocal)
            .order('created_at', { ascending: false }),
          supabase
            .from('country_reviews')
            .select('id,country_id,comment,rating,created_at')
            .eq('user_id', userIdLocal)
            .order('created_at', { ascending: false }),
          supabase
            .from('user_follows')
            .select('follower_id', { count: 'exact', head: true })
            .eq('following_id', userIdLocal),
          supabase
            .from('user_follows')
            .select('following_id', { count: 'exact', head: true })
            .eq('follower_id', userIdLocal),
        ])

        const articleIds = (bookmarksRes?.data || []).map((r: any) => r.article_id)
        const likedIds = (likesRes?.data || []).map((r: any) => r.article_id)
        const acIds = (commentsRes?.data || []).map((r: any) => r.article_id)
        const savedCountryIds = (countryBookmarksRes?.data || []).map((r: any) => r.country_id)
        const favCountryIds = (favoritesRes?.data || []).map((r: any) => r.country_id)
        const reviewCountryIds = (reviewsRes?.data || []).map((r: any) => r.country_id)

        const [
          savedArticlesRes,
          likedArticlesRes,
          commentArticlesRes,
          savedCountriesRes,
          favCountriesRes,
          reviewCountriesRes,
        ] = await Promise.all([
          articleIds.length ? supabase.from('articles').select('id,title,slug,featured_image,image_alt').in('id', articleIds) : Promise.resolve({ data: [] }),
          likedIds.length ? supabase.from('articles').select('id,title,slug').in('id', likedIds) : Promise.resolve({ data: [] }),
          acIds.length ? supabase.from('articles').select('id,title,slug').in('id', acIds) : Promise.resolve({ data: [] }),
          savedCountryIds.length ? supabase.from('countries').select('id,name,slug').in('id', savedCountryIds) : Promise.resolve({ data: [] }),
          favCountryIds.length ? supabase.from('countries').select('id,name,slug').in('id', favCountryIds) : Promise.resolve({ data: [] }),
          reviewCountryIds.length ? supabase.from('countries').select('id,name,slug').in('id', reviewCountryIds) : Promise.resolve({ data: [] }),
        ])

        // If RPC already populated some fields, these will refine/expand them
        setFullName(prev => prev ?? (profileRes?.data?.full_name ?? null))
        setUsername(prev => prev ?? (profileRes?.data?.username ?? null))
        setAvatarUrl(prev => prev ?? (profileRes?.data?.avatar_url ?? null))
        setBio(prev => prev || (profileRes?.data?.bio || ''))
        setStories(prev => prev?.length ? prev : ((storiesRes?.data as any) || []))
        setSavedArticles((savedArticlesRes?.data as any) || [])
        setSavedCountries((savedCountriesRes?.data as any) || [])
        setLikedArticles((likedArticlesRes?.data as any) || [])
        setFavoriteCountries((favCountriesRes?.data as any) || [])

        const commentArticles = (commentArticlesRes?.data as any[]) || []
        setArticleComments(((commentsRes?.data as any[]) || []).map((r: any) => ({ ...r, article: commentArticles.find(a => a.id === r.article_id) })))

        const reviewCountries = (reviewCountriesRes?.data as any[]) || []
        setCountryReviews(((reviewsRes?.data as any[]) || []).map((r: any) => ({ ...r, country: reviewCountries.find(c => c.id === r.country_id) })))

        setFollowersCount(c => c || (followersCountQuery?.count || 0))
        setFollowingCount(c => c || (followingCountQuery?.count || 0))
      })()
    }
    load()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        // signed out – reset state quickly
        setEmail(null)
        setUserId(null)
        setFullName(null)
        setAvatarUrl(null)
        setStories([])
      }
      // re-fetch to be safe
      load()
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (notifRef.current && notifRef.current.contains(target)) return
      setShowSearch(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSearch(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  // Realtime: notifications badge on profile header (mobile button removed earlier, keep counts fresh)
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`notif-profile-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => {
        // increment unread count quickly
        // We no longer render a badge here, but keep parity with header count updates if used elsewhere
      })
      .subscribe()
    return () => { try { channel.unsubscribe() } catch {} }
  }, [userId])

  const pendingCount = useMemo(() => stories.filter(s => s.status === 'pending').length, [stories])
  const approvedCount = useMemo(() => stories.filter(s => s.status === 'approved' || s.status === 'featured').length, [stories])
  const savedTotal = useMemo(() => savedArticles.length + savedCountries.length, [savedArticles.length, savedCountries.length])
  

  const logout = async () => {
    await logoutAndRedirect('/')
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

  const runCommunitySearch = async (q: string) => {
    const term = q.trim()
    if (!term) { setSearchResults([]); return }
    // Simple combined search: users by username/full_name (with avatar), stories by title, hashtags by tag
    const usersP = supabase.from('users_profiles').select('id,username,full_name,avatar_url').ilike('username', `%${term}%`).limit(5)
    const usersP2 = supabase.from('users_profiles').select('id,username,full_name,avatar_url').ilike('full_name', `%${term}%`).limit(5)
    const storiesP = supabase.from('user_stories').select('id,slug,title').ilike('title', `%${term}%`).limit(5)
    const tagsP = supabase.from('user_stories').select('id,slug,title,tags').contains('tags', [term]).limit(5)
    const [users, users2, stories, tags] = await Promise.all([usersP, usersP2, storiesP, tagsP])
    const uMap = new Map<string, any>()
    ;(users.data || []).concat(users2.data || []).forEach((u: any) => { uMap.set(u.id, u) })
    const results: Array<{ type: 'user' | 'story' | 'hashtag'; id: string; title?: string; username?: string; slug?: string; avatar_url?: string | null }> = []
    for (const u of Array.from(uMap.values())) results.push({ type: 'user', id: u.id, username: u.username || u.full_name, avatar_url: u.avatar_url || null })
    for (const s of (stories.data || [])) results.push({ type: 'story', id: s.id, title: s.title, slug: s.slug || undefined })
    for (const t of (tags.data || [])) results.push({ type: 'hashtag', id: t.id, title: `#${term}`, slug: t.slug || undefined })
    setSearchResults(results.slice(0, 12))
  }

  // Debounced live search
  useEffect(() => {
    const term = searchQuery.trim()
    if (!term) { setSearchResults([]); return }
    const t = setTimeout(() => { runCommunitySearch(term) }, 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const onPickAvatar = () => fileInputRef.current?.click()
  const onShareProfile = async () => {
    const url = typeof window !== 'undefined' ? window.location.origin + '/u/' + (userId || '') : ''
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Profilim', url })
        return
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(url)
      setMsg('Profil bağlantısı kopyalandı')
    } catch {
      setMsg('Bağlantı kopyalanamadı')
    }
  }
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
    <div className="container mx-auto px-0 sm:px-4 py-0 bg-white">
      {loading ? (
        <div className="max-w-md mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm p-6 text-center mt-8">
          <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 animate-pulse" />
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">Yükleniyor...</h1>
          <p className="mt-1 text-sm text-gray-600">Lütfen bekleyin</p>
        </div>
      ) : !userId ? (
        <div className="max-w-md mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm p-6 text-center mt-8">
          <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
            <LogIn className="h-7 w-7 text-gray-700" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">Oturum bulunamadı</h1>
          <p className="mt-1 text-sm text-gray-600">Devam etmek için lütfen hesabınıza giriş yapın veya yeni bir hesap oluşturun.</p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button asChild className="h-10 rounded-full bg-black text-white hover:bg-black/90">
              <Link href={ROUTES.AUTH.LOGIN}>
                <LogIn className="h-4 w-4 mr-2" /> Giriş Yap
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-10 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50">
              <Link href={ROUTES.AUTH.REGISTER}>
                <UserPlus className="h-4 w-4 mr-2" /> Kayıt Ol
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-0">
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onAvatarSelected} />
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-7">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="relative">
                <EnlargeableAvatar src={avatarUrl || undefined} alt="avatar" fallbackLabel={(fullName || email || 'U')} className="h-28 w-28 sm:h-32 sm:w-32" />
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-black text-white flex items-center justify-center ring-2 ring-white">
                  <Plus className="h-4 w-4" />
                </div>
              </div>
              <div className="max-w-xl">
                <div className="text-2xl sm:text-3xl font-semibold text-black">{fullName || username || 'Kullanıcı'}</div>
                <div className="text-gray-600 text-base">@{username || (userId ? userId.slice(0,6) : 'user')}</div>
                <div className="mt-2 text-base text-gray-700 whitespace-pre-wrap px-2">
                {bio?.trim() ? bio : <span className="text-gray-500">Biyografi ekleyin</span>}
              </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-xl font-semibold text-black">{approvedCount}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <Link href="/followers" className="text-center block hover:opacity-90" aria-label="Followers sayfasına git">
                  <div className="text-xl font-semibold text-black">{followersCount}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </Link>
                <Link href="/following" className="text-center block hover:opacity-90" aria-label="Following sayfasına git">
                  <div className="text-xl font-semibold text-black">{followingCount}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </Link>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Button variant="secondary" className="h-11 px-6 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
                  <Link href="/profile/edit">Edit Profile</Link>
                </Button>
                <Button variant="secondary" className="h-11 px-6 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" onClick={onShareProfile}>
                  Share Profile
                </Button>
              </div>
            </div>
          </div>
            {showSearch && (
              <div ref={notifRef} className="fixed right-4 top-20 w-[92vw] max-w-2xl rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden z-50">
                <div className="flex items-center gap-2 p-3 border-b border-gray-200">
                  <Search className="h-5 w-5 text-gray-600" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') runCommunitySearch(searchQuery) }}
                    placeholder="Kullanıcı, gönderi veya #etiket ara"
                    className="flex-1 outline-none text-sm bg-transparent"
                  />
                  <Button className="h-8 px-3" onClick={() => runCommunitySearch(searchQuery)}>Ara</Button>
                </div>
                <div className="max-h-[70vh] overflow-auto p-2">
                  {searchResults.length ? (
                    <ul className="divide-y divide-gray-100">
                      {searchResults.map(r => (
                        <li key={`${r.type}-${r.id}`} className="py-2">
                          {r.type === 'user' ? (
                            <Link href={`/u/${r.id}`} className="flex items-center gap-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {r.avatar_url ? (
                                <img src={r.avatar_url} alt="avatar" className="h-7 w-7 rounded-full object-cover" />
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-gray-100" />
                              )}
                              <span className="text-sm text-gray-900">@{r.username}</span>
                            </Link>
                          ) : r.type === 'story' ? (
                            <Link href={r.slug ? `/community/stories/${r.slug}` : '#'} className="text-sm text-gray-900 hover:underline">{r.title}</Link>
                          ) : (
                            <Link href={`/community?tag=${encodeURIComponent((r.title||'').replace('#',''))}`} className="text-sm text-gray-900 hover:underline">{r.title}</Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-600">Sonuç yok.</div>
                  )}
                </div>
              </div>
            )}
          
          {/* Removed duplicate Bio under header */}
          {/* Tabs */}
          <div className="border-t border-gray-200 bg-white">
            <div className="flex items-center justify-center gap-8 border-b border-gray-200 overflow-x-auto whitespace-nowrap px-2">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium shrink-0 ${activeTab === 'posts' ? 'text-black border-b-2 border-black' : 'text-gray-600'}`}
                aria-label="Gönderiler"
              >
                <LayoutGrid className="h-5 w-5" />
                <span className="hidden sm:inline">Gönderiler</span>
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium shrink-0 ${activeTab === 'saved' ? 'text-black border-b-2 border-black' : 'text-gray-600'}`}
                aria-label="Kaydedilenler"
              >
                <Bookmark className="h-5 w-5" />
                <span className="hidden sm:inline">Kaydedilenler</span>
              </button>
                <button
                onClick={() => setActiveTab('comments')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium shrink-0 ${activeTab === 'comments' ? 'text-black border-b-2 border-black' : 'text-gray-600'}`}
                aria-label="Yorumlar"
              >
                <MessageSquareText className="h-5 w-5" />
                <span className="hidden sm:inline">Yorumlar</span>
                </button>
            </div>

            <div className="p-4" ref={savedSectionRef}>
              {activeTab === 'posts' && (
                loading ? (
                  <>
                    <div className="mb-3 flex items-center justify-center gap-3">
                      <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
                        <Link href="/community/stories/submit" aria-label="Hikaye Paylaş">
                          <PlusCircle className="h-6 w-6" />
                        </Link>
                      </Button>
                      <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
                        <Link href="/community" aria-label="Topluluğa Dön">
                          <Users className="h-6 w-6" />
                        </Link>
                      </Button>
                      <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" onClick={() => setShowSearch(true)} aria-label="Toplulukta Ara">
                        <Search className="h-6 w-6" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-[1px] sm:gap-[2px]">
                    {Array.from({ length: 9 }).map((_, i) => (<div key={i} className="aspect-square bg-gray-100 animate-pulse" />))}
                    </div>
                  </>
                ) : approvedCount ? (
                  <>
                    <div className="mb-3 flex items-center justify-center gap-3">
                      <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
                        <Link href="/community/stories/submit" aria-label="Hikaye Paylaş">
                          <PlusCircle className="h-6 w-6" />
                        </Link>
                      </Button>
                      <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
                        <Link href="/community" aria-label="Topluluğa Dön">
                          <Users className="h-6 w-6" />
                        </Link>
                      </Button>
                      <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" onClick={() => setShowSearch(true)} aria-label="Toplulukta Ara">
                        <Search className="h-6 w-6" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-[1px] sm:gap-[2px]">
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
                  <>
                    <div className="mb-3 flex items-center justify-center gap-3">
                      <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
                        <Link href="/community/stories/submit" aria-label="Hikaye Paylaş">
                          <PlusCircle className="h-6 w-6" />
                        </Link>
                      </Button>
                      <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
                        <Link href="/community" aria-label="Topluluğa Dön">
                          <Users className="h-6 w-6" />
                        </Link>
                      </Button>
                      <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" onClick={() => setShowSearch(true)} aria-label="Toplulukta Ara">
                        <Search className="h-6 w-6" />
                      </Button>
                    </div>
                  <div className="text-gray-600 text-sm">Henüz gönderi yok.</div>
                  </>
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

              {/* notifications moved to header popover */}
              {msg && <div className="mt-3 text-sm text-gray-600">{msg}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


