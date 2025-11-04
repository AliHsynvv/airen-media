'use client'

import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Building2, Calendar, ArrowRight, Image as ImageIcon, FileText, Sparkles, Search, X, LayoutGrid, List, Star, MapPin, Tag, Eye, Mail, Phone, Globe } from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
const MeetAirenButton = dynamic(() => import('@/components/home/MeetAirenButton'))

type ViewKey = 'grid' | 'list'

export default function CommunityBusinessMediaPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sections, setSections] = useState<Array<{ business: any, media: any[], posts: any[] }>>([])
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewKey>('grid')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Fetch all active business profiles
        const businessRes = await supabase
          .from('business_profiles')
          .select('id, name, profile_image_url, cover_image_url, description, category, location, phone, email, website, average_rating, is_active')
          .eq('is_active', true)
          .order('average_rating', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(100)

        if (businessRes.error) throw businessRes.error

        const businesses = (businessRes.data || []) as any[]

        // Fetch media and posts for each business
        const [allMediaRes, allPostsRes] = await Promise.all([
    supabase
      .from('business_media')
            .select('id, url, media_type, created_at, business_id')
            .order('created_at', { ascending: false }),
    supabase
      .from('business_posts')
            .select('id, title, status, published_at, created_at, business_id')
            .order('created_at', { ascending: false }),
        ])

        const allMedia = (allMediaRes.data || []) as any[]
        const allPosts = (allPostsRes.data || []) as any[]

        // Group media and posts by business_id
        const mediaByBusiness = new Map<string, any[]>()
        const postsByBusiness = new Map<string, any[]>()

        for (const m of allMedia) {
          if (!mediaByBusiness.has(m.business_id)) {
            mediaByBusiness.set(m.business_id, [])
          }
          mediaByBusiness.get(m.business_id)!.push(m)
        }

        for (const p of allPosts) {
          if (!postsByBusiness.has(p.business_id)) {
            postsByBusiness.set(p.business_id, [])
          }
          postsByBusiness.get(p.business_id)!.push(p)
        }

        // Create sections for each business
        const sectionsData = businesses.map(business => ({
          business,
          media: mediaByBusiness.get(business.id) || [],
          posts: postsByBusiness.get(business.id) || [],
        }))

        setSections(sectionsData)
      } catch (err: any) {
        console.error('Error loading business data:', err)
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return sections.filter(sec =>
      !q || sec.business?.name?.toLowerCase().includes(q)
    )
  }, [sections, query])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <h1 className="text-2xl font-bold text-red-900 mb-2">Error Loading Content</h1>
            <div className="text-sm text-red-600">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        {/* Modern Hero Section - News Style */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-orange-900 to-amber-900 p-8 sm:p-16 text-center max-w-6xl mx-auto mb-12 sm:mb-16 shadow-2xl">
          {/* Animated gradient orbs */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/30 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-amber-500/30 to-yellow-500/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-3xl" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="text-xs sm:text-sm font-medium text-white/90 uppercase tracking-wider">
                <Sparkles className="inline h-4 w-4 mr-1.5" />
                Topluluktan İşletme Paylaşımları
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-orange-100 to-amber-200 drop-shadow-2xl">
                Business Community
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              Dünyanın dört bir yanından işletmelerin paylaşımları, medya galerileri ve güncellemeleri
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Button 
                asChild 
                size="lg" 
                className="h-14 w-full sm:w-auto rounded-full text-white font-bold px-8 shadow-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-700 hover:via-amber-700 hover:to-yellow-700 border-0 transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/business">İşletme Paneli <ArrowRight className="inline ml-2 h-5 w-5" /></Link>
              </Button>
              <MeetAirenButton fullWidth className="h-14" />
            </div>
          </div>
        </div>

        {/* Modern Search Bar - News Style */}
        <div className="max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-full blur-lg opacity-25 group-hover:opacity-40 transition duration-300" />
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
              <Input 
                className="pl-14 pr-14 h-16 rounded-full border-2 border-gray-200 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 shadow-xl text-base font-medium transition-all duration-300" 
                placeholder="İşletme ara..." 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
              />
              {query && (
                <button
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-orange-600 transition-all duration-300 shadow-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Controls - News Style */}
        <div className="max-w-7xl mx-auto mb-10">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600 font-medium">
              {filtered.length} İşletme bulundu
            </div>

            {/* View toggle */}
            <div className="inline-flex p-1.5 rounded-xl border-2 border-gray-200 bg-white shadow-sm">
              <button 
                className={`h-9 w-9 inline-flex items-center justify-center rounded-lg transition-all duration-300 ${
                  view === 'grid' 
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`} 
                onClick={() => setView('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button 
                className={`h-9 w-9 inline-flex items-center justify-center rounded-lg transition-all duration-300 ${
                  view === 'list' 
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`} 
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border-2 border-gray-100 h-96 animate-pulse shadow-lg">
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-2xl" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 mb-6">
                <Building2 className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sonuç bulunamadı</h3>
              <p className="text-gray-500 mb-6">Aradığınız kriterlere uygun işletme bulunamadı</p>
              <Button asChild className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                <Link href="/business">İşletme Paneline Git</Link>
              </Button>
            </div>
          ) : view === 'list' ? (
            <div className="space-y-6">
              {filtered.map(sec => (
                <div 
                  key={sec.business?.id} 
                  className="group"
                >
                  <div className="relative rounded-2xl bg-white border-2 border-gray-100 overflow-hidden hover:border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                      {/* Business Avatar */}
                      <div className="flex-shrink-0">
                        {sec.business?.profile_image_url ? (
                          <Image 
                            src={sec.business.profile_image_url} 
                            alt={sec.business?.name || 'Business'} 
                            width={120}
                            height={120}
                            className="h-28 w-28 md:h-32 md:w-32 rounded-xl object-cover ring-2 ring-gray-100 group-hover:ring-orange-200 transition-all shadow-md"
                          />
                        ) : (
                          <div className="h-28 w-28 md:h-32 md:w-32 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md">
                            <Building2 className="h-14 w-14 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Business Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                              {sec.business?.name || 'Business'}
                            </h3>
                            
                            {/* Rating & Category */}
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              {sec.business?.average_rating && (
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`h-4 w-4 ${
                                          i < Math.floor(sec.business.average_rating) 
                                            ? 'fill-amber-400 text-amber-400' 
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700">
                                    {sec.business.average_rating.toFixed(1)}
                                  </span>
              </div>
            )}

                              {sec.business?.category && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-700">
                                  <Tag className="h-3 w-3" />
                                  {sec.business.category}
                                </span>
                              )}
                            </div>

                            {/* Location */}
                            {sec.business?.location && (
                              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                                <MapPin className="h-4 w-4" />
                                {sec.business.location}
                              </div>
                            )}

                            {/* Description */}
                            {sec.business?.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                {sec.business.description}
                              </p>
                            )}

                            {/* Contact Info */}
                            <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-gray-600">
                              {sec.business?.phone && (
                                <a 
                                  href={`tel:${sec.business.phone}`}
                                  className="inline-flex items-center gap-1.5 hover:text-orange-600 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                  {sec.business.phone}
                                </a>
                              )}
                              {sec.business?.email && (
                                <a 
                                  href={`mailto:${sec.business.email}`}
                                  className="inline-flex items-center gap-1.5 hover:text-orange-600 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                  {sec.business.email}
                                </a>
                              )}
                              {sec.business?.website && (
                                <a 
                                  href={sec.business.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 hover:text-orange-600 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Globe className="h-3.5 w-3.5" />
                                  Website
                                </a>
                              )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="inline-flex items-center gap-1.5">
                                <ImageIcon className="h-4 w-4" />
                                {sec.media.length} Medya
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <FileText className="h-4 w-4" />
                                {sec.posts.length} Gönderi
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <div className="flex-shrink-0 self-start md:self-center">
                        <Link href={`/business/${sec.business?.id || ''}`}>
                          <Button className="w-full md:w-auto bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 shadow-md hover:shadow-lg transition-all">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filtered.map((sec, i) => (
                <div 
                  key={sec.business?.id} 
                  className="group transform hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="relative rounded-2xl bg-white border-2 border-gray-100 overflow-hidden shadow-lg hover:shadow-2xl hover:border-orange-200 transition-all duration-300 h-full flex flex-col">
                    {/* Media Preview */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                      {sec.media.length > 0 ? (
                        sec.media[0].media_type === 'video' ? (
                          <video 
                            src={sec.media[0].url} 
                            className="w-full h-full object-cover" 
                            muted 
                            playsInline 
                            controls={false} 
                          />
                        ) : (
                          <Image 
                            src={sec.media[0].url} 
                            alt="Business media" 
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 className="h-16 w-16 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Category Badge */}
                      {sec.business?.category && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-white/20 text-xs font-semibold text-gray-700 shadow-lg">
                            <Tag className="h-3 w-3" />
                            {sec.business.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Business Info */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        {sec.business?.profile_image_url ? (
                          <Image 
                            src={sec.business.profile_image_url} 
                            alt={sec.business?.name || 'Business'} 
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-lg object-cover ring-2 ring-gray-100 shadow-sm"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Building2 className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors mb-1">
                            {sec.business?.name || 'Business'}
                          </h3>
                          
                          {/* Rating */}
                          {sec.business?.average_rating && (
                            <div className="flex items-center gap-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-3.5 w-3.5 ${
                                      i < Math.floor(sec.business.average_rating) 
                                        ? 'fill-amber-400 text-amber-400' 
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-semibold text-gray-700">
                                {sec.business.average_rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location */}
                      {sec.business?.location && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="line-clamp-1">{sec.business.location}</span>
                        </div>
                      )}

                      {/* Description */}
                      {sec.business?.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {sec.business.description}
                        </p>
                      )}

                      {/* Contact Info */}
                      <div className="flex flex-col gap-1.5 mb-3 text-xs text-gray-600">
                        {sec.business?.phone && (
                          <a 
                            href={`tel:${sec.business.phone}`}
                            className="inline-flex items-center gap-1.5 hover:text-orange-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{sec.business.phone}</span>
                          </a>
                        )}
                        {sec.business?.email && (
                          <a 
                            href={`mailto:${sec.business.email}`}
                            className="inline-flex items-center gap-1.5 hover:text-orange-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{sec.business.email}</span>
                          </a>
                        )}
                        {sec.business?.website && (
                          <a 
                            href={sec.business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 hover:text-orange-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">Website</span>
                          </a>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-4 mt-auto">
                        <span className="inline-flex items-center gap-1">
                          <ImageIcon className="h-3.5 w-3.5" />
                          {sec.media.length}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {sec.posts.length}
                        </span>
                      </div>

                      {/* View Details Button */}
                      <Link href={`/business/${sec.business?.id || ''}`} className="w-full">
                        <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 shadow-md hover:shadow-lg transition-all text-sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                  </Link>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
