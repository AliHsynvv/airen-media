'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { logoutAndRedirect } from '@/lib/auth/logout'
import { Button } from '@/components/ui/button'
import { PlusCircle, Search, Users, LayoutGrid, Bookmark, MessageSquareText, Plus, LogIn, UserPlus } from 'lucide-react'
import { ROUTES } from '@/lib/utils/constants'
import { useTranslations } from 'next-intl'

interface MyStoryRow {
  id: string
  title: string
  slug: string | null
  status: 'pending' | 'approved' | 'rejected' | 'featured'
  created_at: string
  image_url?: string | null
}

interface ProfileClientProps {
  initialUserId: string
  initialEmail: string
  initialFullName: string | null
  initialUsername: string | null
  initialBio: string
  initialAvatarUrl: string | null
  initialStories: MyStoryRow[]
  initialFollowersCount: number
  initialFollowingCount: number
}

export default function ProfileClient(props: ProfileClientProps) {
  const t = useTranslations('profile.private')
  const [email, setEmail] = useState<string | null>(props.initialEmail || null)
  const [userId, setUserId] = useState<string | null>(props.initialUserId || null)
  const [fullName, setFullName] = useState<string | null>(props.initialFullName)
  const [username, setUsername] = useState<string | null>(props.initialUsername)
  const [bio, setBio] = useState<string>(props.initialBio || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(props.initialAvatarUrl)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stories, setStories] = useState<MyStoryRow[]>(props.initialStories || [])
  const [msg, setMsg] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ type: 'user' | 'story' | 'hashtag'; id: string; title?: string; username?: string; slug?: string }>>([])
  const [savedArticles, setSavedArticles] = useState<Array<{ id: string; title: string; slug: string; featured_image?: string | null; image_alt?: string | null }>>([])
  const [savedCountries, setSavedCountries] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [likedArticles, setLikedArticles] = useState<Array<{ id: string; title: string; slug: string }>>([])
  const [articleComments, setArticleComments] = useState<Array<{ id: string; article_id: string; content: string; article?: { id: string; title: string; slug: string } }>>([])
  const [countryReviews, setCountryReviews] = useState<Array<{ id: string; country_id: string; comment: string | null; rating: number; country?: { id: string; name: string; slug: string } }>>([])
  const [favoriteCountries, setFavoriteCountries] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const savedSectionRef = useRef<HTMLDivElement | null>(null)
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'comments'>('posts')
  const notifRef = useRef<HTMLDivElement | null>(null)
  const [followersCount, setFollowersCount] = useState<number>(props.initialFollowersCount || 0)
  const [followingCount, setFollowingCount] = useState<number>(props.initialFollowingCount || 0)
  const [savedLoaded, setSavedLoaded] = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState(false)

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      if (!u) {
        setEmail(null)
        setUserId(null)
        setFullName(null)
        setAvatarUrl(null)
        setStories([])
      } else {
        setEmail(u.email || null)
        setUserId(u.id)
      }
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  // Lazy load: saved
  useEffect(() => {
    if (activeTab !== 'saved' || savedLoaded || !userId) return
    ;(async () => {
      const [bookmarksRes, savedCountriesRes, likesRes, favoritesRes] = await Promise.all([
        supabase.from('article_bookmarks').select('article_id').eq('user_id', userId),
        supabase.from('country_bookmarks').select('country_id').eq('user_id', userId),
        supabase.from('article_likes').select('article_id').eq('user_id', userId),
        supabase.from('country_favorites').select('country_id').eq('user_id', userId),
      ])
      const articleIds = (bookmarksRes.data || []).map((r: any) => r.article_id)
      const likedIds = (likesRes.data || []).map((r: any) => r.article_id)
      const savedCountryIds = (savedCountriesRes.data || []).map((r: any) => r.country_id)
      const favCountryIds = (favoritesRes.data || []).map((r: any) => r.country_id)
      const [savedArticlesRes, likedArticlesRes2, savedCountriesRes2, favCountriesRes] = await Promise.all([
        articleIds.length ? supabase.from('articles').select('id,title,slug,featured_image,image_alt').in('id', articleIds) : Promise.resolve({ data: [] }),
        likedIds.length ? supabase.from('articles').select('id,title,slug').in('id', likedIds) : Promise.resolve({ data: [] }),
        savedCountryIds.length ? supabase.from('countries').select('id,name,slug').in('id', savedCountryIds) : Promise.resolve({ data: [] }),
        favCountryIds.length ? supabase.from('countries').select('id,name,slug').in('id', favCountryIds) : Promise.resolve({ data: [] }),
      ])
      setSavedArticles((savedArticlesRes.data as any) || [])
      setLikedArticles((likedArticlesRes2.data as any) || [])
      setSavedCountries((savedCountriesRes2.data as any) || [])
      setFavoriteCountries((favCountriesRes.data as any) || [])
      setSavedLoaded(true)
    })()
  }, [activeTab, savedLoaded, userId])

  // Lazy load: comments
  useEffect(() => {
    if (activeTab !== 'comments' || commentsLoaded || !userId) return
    ;(async () => {
      const [commentsRes, reviewsRes] = await Promise.all([
        supabase
          .from('article_comments')
          .select('id,article_id,content,created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('country_reviews')
          .select('id,country_id,comment,rating,created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
      ])
      const acIds = (commentsRes.data || []).map((r: any) => r.article_id)
      const reviewCountryIds = (reviewsRes.data || []).map((r: any) => r.country_id)
      const [commentArticlesRes, reviewCountriesRes] = await Promise.all([
        acIds.length ? supabase.from('articles').select('id,title,slug').in('id', acIds) : Promise.resolve({ data: [] }),
        reviewCountryIds.length ? supabase.from('countries').select('id,name,slug').in('id', reviewCountryIds) : Promise.resolve({ data: [] }),
      ])
      const commentArticles = (commentArticlesRes.data as any[]) || []
      setArticleComments(((commentsRes.data as any[]) || []).map((r: any) => ({ ...r, article: commentArticles.find(a => a.id === r.article_id) })))
      const reviewCountries = (reviewCountriesRes.data as any[]) || []
      setCountryReviews(((reviewsRes.data as any[]) || []).map((r: any) => ({ ...r, country: reviewCountries.find(c => c.id === r.country_id) })))
      setCommentsLoaded(true)
    })()
  }, [activeTab, commentsLoaded, userId])

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

  // Removed duplicate notifications realtime channel; Header handles notification updates

  const pendingCount = useMemo(() => stories.filter(s => s.status === 'pending').length, [stories])
  const approvedCount = useMemo(() => stories.filter(s => s.status === 'approved' || s.status === 'featured').length, [stories])
  const savedTotal = useMemo(() => savedArticles.length + savedCountries.length, [savedArticles.length, savedCountries.length])

  const onPickAvatar = () => fileInputRef.current?.click()
  const onShareProfile = async () => {
    const url = typeof window !== 'undefined' ? window.location.origin + '/u/' + (userId || '') : ''
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Profile', url })
        return
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(url)
      setMsg(t('shareCopySuccess'))
    } catch {
      setMsg(t('shareCopyFail'))
    }
  }

  const logout = async () => { await logoutAndRedirect('/') }
  const remove = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return
    setMsg(null)
    const { error } = await supabase.from('user_stories').delete().eq('id', id)
    if (error) setMsg(error.message)
    else {
      setStories(prev => prev.filter(s => s.id !== id))
      setMsg(t('deleteSuccess'))
    }
  }
  const runCommunitySearch = async (q: string) => {
    const term = q.trim()
    if (!term) { setSearchResults([]); return }
    const usersP = supabase.from('users_profiles').select('id,username,full_name').ilike('username', `%${term}%`).limit(5)
    const usersP2 = supabase.from('users_profiles').select('id,username,full_name').ilike('full_name', `%${term}%`).limit(5)
    const storiesP = supabase.from('user_stories').select('id,slug,title').ilike('title', `%${term}%`).limit(5)
    const tagsP = supabase.from('user_stories').select('id,slug,title,tags').contains('tags', [term]).limit(5)
    const [users, users2, stories, tags] = await Promise.all([usersP, usersP2, storiesP, tagsP])
    const uMap = new Map<string, any>()
    ;(users.data || []).concat(users2.data || []).forEach((u: any) => { uMap.set(u.id, u) })
    const results: Array<{ type: 'user' | 'story' | 'hashtag'; id: string; title?: string; username?: string; slug?: string }> = []
    for (const u of Array.from(uMap.values())) results.push({ type: 'user', id: u.id, username: u.username || u.full_name })
    for (const s of (stories.data || [])) results.push({ type: 'story', id: s.id, title: s.title, slug: s.slug || undefined })
    for (const t of (tags.data || [])) results.push({ type: 'hashtag', id: t.id, title: `#${term}`, slug: t.slug || undefined })
    setSearchResults(results.slice(0, 12))
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {!userId ? (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-2xl p-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
              <LogIn className="h-8 w-8 text-gray-700" />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-gray-900">{t('sessionMissingTitle')}</h1>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{t('sessionMissingDesc')}</p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button asChild className="h-11 rounded-full bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href={ROUTES.AUTH.LOGIN}>
                  <LogIn className="h-4 w-4 mr-2" /> {t('login')}
                </Link>
              </Button>
              <Button asChild variant="secondary" className="h-11 rounded-full border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-300">
                <Link href={ROUTES.AUTH.REGISTER}>
                  <UserPlus className="h-4 w-4 mr-2" /> {t('register')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-0">
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={async (e) => {
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
              const { data: pub } = supabase.storage.from(usedBucket).getPublicUrl(path)
              let finalUrl = pub.publicUrl
              try {
                const head = await fetch(finalUrl, { method: 'HEAD' })
                if (!head.ok) {
                  const { data: signed, error: signErr } = await supabase.storage.from(usedBucket).createSignedUrl(path, 60 * 60 * 24 * 30)
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
          }} />
          <div className="relative bg-gradient-to-br from-white via-gray-50 to-white border-b border-gray-200 px-4 sm:px-6 py-10 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-20 -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-50 to-orange-50 rounded-full blur-3xl opacity-20 -z-10" />
            
            <div className="flex flex-col items-center text-center gap-4 relative z-10 max-w-4xl mx-auto">
              {/* Avatar with modern styling */}
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="relative group"
              >
                <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-4 ring-white shadow-2xl transition-all duration-300 group-hover:ring-8 group-hover:ring-gray-100">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <span className="text-gray-900 text-4xl font-bold">{(fullName || email || 'U')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center ring-4 ring-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-gray-800 group-hover:to-gray-600">
                  <Plus className="h-5 w-5" />
                </div>
              </button>
              
              {/* User Info */}
              <div className="max-w-2xl space-y-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{fullName || username || 'User'}</h1>
                  <p className="text-gray-500 text-sm sm:text-base font-medium mt-1">@{username || (userId ? userId.slice(0,6) : 'user')}</p>
                </div>
                <div className="mt-3 text-sm sm:text-base text-gray-700 whitespace-pre-wrap px-4 leading-relaxed max-w-xl mx-auto">
                  {bio?.trim() ? bio : <span className="text-gray-400 italic">Henüz bio eklenmemiş</span>}
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="mt-6 grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-lg">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{approvedCount}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">{t('posts')}</div>
                </div>
                <Link 
                  href="/followers" 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:scale-105" 
                  aria-label={t('followersAria')}
                >
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{followersCount}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">{t('followers')}</div>
                </Link>
                <Link 
                  href="/following" 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:scale-105" 
                  aria-label={t('followingAria')}
                >
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{followingCount}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">{t('following')}</div>
                </Link>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6">
                <Button 
                  variant="secondary" 
                  className="h-11 px-6 rounded-full border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 font-semibold" 
                  asChild
                >
                  <Link href="/profile/edit">{t('editProfile')}</Link>
                </Button>
                <Button 
                  variant="secondary" 
                  className="h-11 px-6 rounded-full border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 font-semibold" 
                  onClick={onShareProfile}
                >
                  {t('shareProfile')}
                </Button>
              </div>
            </div>
          </div>

          {showSearch && (
            <div ref={notifRef} className="fixed inset-x-4 sm:right-4 sm:left-auto top-20 w-auto sm:w-[92vw] sm:max-w-2xl rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-lg shadow-2xl overflow-hidden z-50">
              <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <Search className="h-5 w-5 text-gray-500" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') runCommunitySearch(searchQuery) }}
                  placeholder={t('searchPlaceholder')}
                  className="flex-1 outline-none text-sm bg-transparent placeholder:text-gray-400"
                />
                <Button 
                  className="h-9 px-4 rounded-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 shadow-md" 
                  onClick={() => runCommunitySearch(searchQuery)}
                >
                  {t('search')}
                </Button>
              </div>
              <div className="max-h-[70vh] overflow-auto p-3">
                {searchResults.length ? (
                  <ul className="divide-y divide-gray-100">
                    {searchResults.map(r => (
                      <li key={`${r.type}-${r.id}`} className="py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                        {r.type === 'user' ? (
                          <Link href={`/u/${r.id}`} className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold">
                              {(r.username || 'U')[0].toUpperCase()}
                            </div>
                            @{r.username}
                          </Link>
                        ) : r.type === 'story' ? (
                          <Link href={r.slug ? `/community/stories/${r.slug}` : '#'} className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4 text-gray-500" />
                            {r.title}
                          </Link>
                        ) : (
                          <Link href={`/community?tag=${encodeURIComponent((r.title||'').replace('#',''))}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2">
                            <span className="text-base">#</span>
                            {r.title}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">{t('noResults')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white shadow-sm">
            <div className="flex items-center justify-center gap-3 sm:gap-6 border-b border-gray-200 overflow-x-auto whitespace-nowrap px-2 bg-gradient-to-b from-white to-gray-50/30">
              <button 
                onClick={() => setActiveTab('posts')} 
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold shrink-0 transition-all duration-300 relative group ${
                  activeTab === 'posts' 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`} 
                aria-label={t('tabs.posts')}
              >
                <LayoutGrid className={`h-5 w-5 transition-transform duration-300 ${activeTab === 'posts' ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className="hidden sm:inline">{t('tabs.posts')}</span>
                {activeTab === 'posts' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-900 to-gray-700 rounded-t-full" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('saved')} 
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold shrink-0 transition-all duration-300 relative group ${
                  activeTab === 'saved' 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`} 
                aria-label={t('tabs.saved')}
              >
                <Bookmark className={`h-5 w-5 transition-transform duration-300 ${activeTab === 'saved' ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className="hidden sm:inline">{t('tabs.saved')}</span>
                {activeTab === 'saved' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-900 to-gray-700 rounded-t-full" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('comments')} 
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold shrink-0 transition-all duration-300 relative group ${
                  activeTab === 'comments' 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`} 
                aria-label={t('tabs.comments')}
              >
                <MessageSquareText className={`h-5 w-5 transition-transform duration-300 ${activeTab === 'comments' ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className="hidden sm:inline">{t('tabs.comments')}</span>
                {activeTab === 'comments' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-900 to-gray-700 rounded-t-full" />
                )}
              </button>
            </div>

            <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white min-h-[400px]" ref={savedSectionRef}>
              {activeTab === 'posts' && (
                approvedCount ? (
                  <>
                    <div className="mb-6 flex items-center justify-center gap-3">
                      <Button 
                        variant="secondary" 
                        className="h-12 w-12 p-0 rounded-full border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110" 
                        asChild
                      >
                        <Link href="/community/stories/submit" aria-label={t('submitStoryAria')}>
                          <PlusCircle className="h-6 w-6" />
                        </Link>
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="h-12 w-12 p-0 rounded-full border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110" 
                        asChild
                      >
                        <Link href="/community" aria-label={t('backToCommunityAria')}>
                          <Users className="h-6 w-6" />
                        </Link>
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="h-12 w-12 p-0 rounded-full border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110" 
                        onClick={() => setShowSearch(true)} 
                        aria-label={t('searchCommunityAria')}
                      >
                        <Search className="h-6 w-6" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {stories.filter(s => s.status === 'approved' || s.status === 'featured').map(s => (
                        <Link key={s.id} href={s.slug ? `/community/stories/${s.slug}` : '#'} className="block group">
                          <div className="relative aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={(s as any).image_url || '/next.svg'} 
                              alt={s.title} 
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                              {s.title}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-6 flex items-center justify-center gap-3">
                      <Button 
                        variant="secondary" 
                        className="h-12 w-12 p-0 rounded-full border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110" 
                        asChild
                      >
                        <Link href="/community/stories/submit" aria-label="Hikaye Paylaş">
                          <PlusCircle className="h-6 w-6" />
                        </Link>
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="h-12 w-12 p-0 rounded-full border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110" 
                        asChild
                      >
                        <Link href="/community" aria-label="Topluluğa Dön">
                          <Users className="h-6 w-6" />
                        </Link>
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="h-12 w-12 p-0 rounded-full border-2 border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110" 
                        onClick={() => setShowSearch(true)} 
                        aria-label="Toplulukta Ara"
                      >
                        <Search className="h-6 w-6" />
                      </Button>
                    </div>
                    <div className="text-gray-500 text-base">{t('noPosts')}</div>
                  </div>
                )
              )}

              {activeTab === 'saved' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                      {t('news')}
                    </h3>
                    {savedArticles.length ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {savedArticles.map(a => (
                          <Link key={a.id} href={`/articles/${a.slug}`} className="block group">
                            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:border-gray-300">
                              <div className="relative aspect-[4/3] overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  src={a.featured_image || '/next.svg'} 
                                  alt={a.image_alt || a.title} 
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                              <div className="p-3">
                                <div className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px] leading-relaxed">{a.title}</div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white/50 rounded-2xl border border-gray-200">
                        <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">{t('noSavedNews')}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-green-500 to-teal-500" />
                      {t('countries')}
                    </h3>
                    {savedCountries.length ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {savedCountries.map(c => (
                          <Link key={c.id} href={`/countries/${c.slug}`} className="block group">
                            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:border-gray-300">
                              <div className="relative aspect-[4/3] overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  src={'/next.svg'} 
                                  alt={c.name} 
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                              <div className="p-3">
                                <div className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px] leading-relaxed">{c.name}</div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white/50 rounded-2xl border border-gray-200">
                        <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">{t('noSavedCountries')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                      {t('news')}
                    </h3>
                    {articleComments.length ? (
                      <ul className="space-y-4">
                        {articleComments.map(c => (
                          <li key={c.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                            <Link 
                              className="font-semibold text-gray-900 hover:text-gray-700 transition-colors duration-200 line-clamp-1" 
                              href={`/articles/${c.article?.slug || ''}`}
                            >
                              {c.article?.title || '—'}
                            </Link>
                            <p className="text-gray-600 text-sm mt-2 leading-relaxed">{c.content}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquareText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">{t('noComments')}</p>
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-green-500 to-teal-500" />
                      {t('countries')}
                    </h3>
                    {countryReviews.length ? (
                      <ul className="space-y-4">
                        {countryReviews.map(r => (
                          <li key={r.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                            <Link 
                              className="font-semibold text-gray-900 hover:text-gray-700 transition-colors duration-200 line-clamp-1" 
                              href={`/countries/${r.country?.slug || ''}`}
                            >
                              {r.country?.name || '—'}
                            </Link>
                            <p className="text-gray-600 text-sm mt-2 leading-relaxed">{r.comment || `${r.rating}/5 ⭐`}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquareText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Yorum yok.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {msg && (
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                  <p className="text-sm font-medium text-gray-900 text-center">{msg}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


