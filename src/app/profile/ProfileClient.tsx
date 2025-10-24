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
    <div className="container mx-auto px-0 sm:px-4 py-0 bg-white">
      {!userId ? (
        <div className="max-w-md mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm p-6 text-center mt-8">
          <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
            <LogIn className="h-7 w-7 text-gray-700" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">{t('sessionMissingTitle')}</h1>
          <p className="mt-1 text-sm text-gray-600">{t('sessionMissingDesc')}</p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button asChild className="h-10 rounded-full bg-black text-white hover:bg-black/90">
              <Link href={ROUTES.AUTH.LOGIN}>
                <LogIn className="h-4 w-4 mr-2" /> {t('login')}
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-10 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50">
              <Link href={ROUTES.AUTH.REGISTER}>
                <UserPlus className="h-4 w-4 mr-2" /> {t('register')}
              </Link>
            </Button>
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
          <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-6">
            <div className="flex flex-col items-center text-center gap-3">
              <button onClick={() => fileInputRef.current?.click()} className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center group">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-black text-2xl">{(fullName || email || 'U')[0]}</span>
                )}
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-black text-white flex items-center justify-center ring-2 ring-white">
                  <Plus className="h-4 w-4" />
                </div>
              </button>
              <div className="max-w-xl">
                <div className="text-xl sm:text-2xl font-semibold text-black">{fullName || username || 'User'}</div>
                <div className="text-gray-600 text-sm">@{username || (userId ? userId.slice(0,6) : 'user')}</div>
                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap px-2">
                  {bio?.trim() ? bio : <span className="text-gray-500">Add a bio</span>}
                </div>
              </div>
              <div className="mt-1 grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-black">{approvedCount}</div>
                  <div className="text-xs text-gray-600">{t('posts')}</div>
                </div>
                <Link href="/followers" className="text-center block hover:opacity-90" aria-label={t('followersAria')}>
                  <div className="text-lg font-semibold text-black">{followersCount}</div>
                  <div className="text-xs text-gray-600">{t('followers')}</div>
                </Link>
                <Link href="/following" className="text-center block hover:opacity-90" aria-label={t('followingAria')}>
                  <div className="text-lg font-semibold text-black">{followingCount}</div>
                  <div className="text-xs text-gray-600">{t('following')}</div>
                </Link>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <Button variant="secondary" className="h-9 px-5 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
                  <Link href="/profile/edit">{t('editProfile')}</Link>
                </Button>
                <Button variant="secondary" className="h-9 px-5 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" onClick={onShareProfile}>
                  {t('shareProfile')}
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
                  placeholder={t('searchPlaceholder')}
                  className="flex-1 outline-none text-sm bg-transparent"
                />
                <Button className="h-8 px-3" onClick={() => runCommunitySearch(searchQuery)}>{t('search')}</Button>
              </div>
              <div className="max-h-[70vh] overflow-auto p-2">
                {searchResults.length ? (
                  <ul className="divide-y divide-gray-100">
                    {searchResults.map(r => (
                      <li key={`${r.type}-${r.id}`} className="py-2">
                        {r.type === 'user' ? (
                          <Link href={`/u/${r.id}`} className="text-sm text-gray-900 hover:underline">@{r.username}</Link>
                        ) : r.type === 'story' ? (
                          <Link href={r.slug ? `/community/stories/${r.slug}` : '#'} className="text-sm text-gray-900 hover:underline">{r.title}</Link>
                        ) : (
                          <Link href={`/community?tag=${encodeURIComponent((r.title||'').replace('#',''))}`} className="text-sm text-gray-900 hover:underline">{r.title}</Link>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-600">{t('noResults')}</div>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 bg-white">
            <div className="flex items-center justify-center gap-8 border-b border-gray-200 overflow-x-auto whitespace-nowrap px-2">
              <button onClick={() => setActiveTab('posts')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium shrink-0 ${activeTab === 'posts' ? 'text-black border-b-2 border-black' : 'text-gray-600'}`} aria-label={t('tabs.posts')}>
                <LayoutGrid className="h-5 w-5" />
                <span className="hidden sm:inline">{t('tabs.posts')}</span>
              </button>
              <button onClick={() => setActiveTab('saved')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium shrink-0 ${activeTab === 'saved' ? 'text-black border-b-2 border-black' : 'text-gray-600'}`} aria-label={t('tabs.saved')}>
                <Bookmark className="h-5 w-5" />
                <span className="hidden sm:inline">{t('tabs.saved')}</span>
              </button>
              <button onClick={() => setActiveTab('comments')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium shrink-0 ${activeTab === 'comments' ? 'text-black border-b-2 border-black' : 'text-gray-600'}`} aria-label={t('tabs.comments')}>
                <MessageSquareText className="h-5 w-5" />
                <span className="hidden sm:inline">{t('tabs.comments')}</span>
              </button>
            </div>

            <div className="p-4" ref={savedSectionRef}>
              {activeTab === 'posts' && (
                approvedCount ? (
                  <>
                    <div className="mb-3 flex items-center justify-center gap-3">
                      <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
                        <Link href="/community/stories/submit" aria-label={t('submitStoryAria')}>
                          <PlusCircle className="h-6 w-6" />
                        </Link>
                      </Button>
                      <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" asChild>
                        <Link href="/community" aria-label={t('backToCommunityAria')}>
                          <Users className="h-6 w-6" />
                        </Link>
                      </Button>
                      <Button variant="secondary" className="h-11 w-11 p-0 rounded-full border border-gray-200 bg-white text-black hover:bg-gray-50" onClick={() => setShowSearch(true)} aria-label={t('searchCommunityAria')}>
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
                    <div className="text-gray-600 text-sm">{t('noPosts')}</div>
                  </>
                )
              )}

              {activeTab === 'saved' && (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-2">{t('news')}</div>
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
                      <div className="text-gray-600 text-sm">{t('noSavedNews')}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-2">{t('countries')}</div>
                    {savedCountries.length ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {savedCountries.map(c => (
                          <Link key={c.id} href={`/countries/${c.slug}`} className="block group">
                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                              <div className="relative aspect-[4/3] overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={'/next.svg'} alt={c.name} className="h-full w-full object-cover group-hover:opacity-95" />
                              </div>
                              <div className="p-2">
                                <div className="text-[13px] text-black line-clamp-2 min-h-[34px]">{c.name}</div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-600 text-sm">{t('noSavedCountries')}</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-200 p-3">
                    <div className="text-sm text-gray-500 mb-2">{t('news')}</div>
                    {articleComments.length ? (
                      <ul className="space-y-1">{articleComments.map(c => (<li key={c.id} className="text-black"><Link className="hover:underline" href={`/articles/${c.article?.slug || ''}`}>{c.article?.title || '—'}</Link>: <span className="text-gray-700">{c.content}</span></li>))}</ul>
                    ) : (
                      <div className="text-gray-600 text-sm">{t('noComments')}</div>
                    )}
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <div className="text-sm text-gray-500 mb-2">{t('countries')}</div>
                    {countryReviews.length ? (
                      <ul className="space-y-1">{countryReviews.map(r => (<li key={r.id} className="text-black"><Link className="hover:underline" href={`/countries/${r.country?.slug || ''}`}>{r.country?.name || '—'}</Link>: <span className="text-gray-700">{r.comment || `${r.rating}/5`}</span></li>))}</ul>
                    ) : (
                      <div className="text-gray-600 text-sm">Yorum yok.</div>
                    )}
                  </div>
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


