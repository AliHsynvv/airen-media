import { getServerSupabase } from '@/lib/supabase/server-ssr'
import BusinessLocationMap from '@/components/business/BusinessLocationMap'
import { 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Star, 
  Users, 
  Image as ImageIcon,
  Calendar,
  ExternalLink,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  CheckCircle2,
  Briefcase
} from 'lucide-react'

export default async function PublicBusinessPage(context: { params: Promise<{ id: string }> }) {
  const supabase = await getServerSupabase()
  const { id } = await context.params

  const [{ data: business }, { data: media }, { data: reviews }, { data: posts }, { data: services }] = await Promise.all([
    supabase.from('business_profiles').select('*').eq('id', id).maybeSingle(),
    supabase.from('business_media').select('*').eq('business_id', id).order('position', { ascending: true }).limit(12),
    supabase
      .from('business_reviews')
      .select('id,user_id,rating,comment,created_at,users:users_profiles!business_reviews_user_id_fkey(full_name,username,avatar_url)')
      .eq('business_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('business_posts')
      .select('id,title,content,published_at,status')
      .eq('business_id', id)
      .in('status', ['published'])
      .order('published_at', { ascending: false })
      .limit(10),
    supabase
      .from('business_services')
      .select('*')
      .eq('business_id', id)
      .eq('is_available', true)
      .order('created_at', { ascending: false }),
  ])

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 mx-auto mb-4 flex items-center justify-center">
            <Users className="h-12 w-12 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-gray-600">The business you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  // Use database average_rating if available, otherwise calculate from reviews
  const averageRating = business.average_rating 
    ? business.average_rating.toFixed(1)
    : (reviews && reviews.length > 0 
        ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null)
  
  const totalReviews = business.total_reviews || reviews?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-100 to-orange-100 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Hero Section with Cover */}
        <div className="relative h-72 sm:h-80 md:h-96 w-full overflow-hidden">
          {/* Cover Image */}
          {business.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={business.cover_image_url} 
              alt="Cover" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Profile Section - Below cover */}
        <div className="px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Profile Image */}
                <div className="relative shrink-0 -mt-20 sm:-mt-24">
                  {business.profile_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={business.profile_image_url} 
                      alt={business.name} 
                      className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl object-cover ring-4 ring-white shadow-2xl" 
                    />
                  ) : (
                    <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 ring-4 ring-white shadow-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-4xl sm:text-5xl">{business.name[0]}</span>
                    </div>
                  )}
                  {business.category && (
                    <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold shadow-lg">
                      {business.category}
                    </div>
                  )}
                </div>

                {/* Business Info */}
                <div className="flex-1 min-w-0 pt-4 sm:pt-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
                  {business.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{business.location}</span>
                    </div>
                  )}
                  
                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    {averageRating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-gray-900">{averageRating}</span>
                        </div>
                        <span className="text-sm text-gray-600">({totalReviews} reviews)</span>
                      </div>
                    )}
                    {media && media.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                        <span>{media.length} photos</span>
                      </div>
                    )}
                    {posts && posts.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{posts.length} posts</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                {business.website && (
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap self-start sm:self-center"
                  >
                    <Globe className="h-5 w-5" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-8 sm:pt-12 px-4 sm:px-6 pb-12">

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            {/* Main Content */}
            <main className="space-y-8">
              {/* About Section */}
              {business.description && (
                <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-600 to-purple-600"></div>
                    <h2 className="text-2xl font-bold text-gray-900">About Us</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{business.description}</p>
                </section>
              )}

              {/* Products & Services Section */}
              {services && services.length > 0 && (
                <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-600 to-purple-600"></div>
                    <h2 className="text-2xl font-bold text-gray-900">Məhsullar & Xidmətlər</h2>
                    <span className="ml-auto text-sm text-gray-500">{services.length} item</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service: any) => {
                      const hasDiscount = service.discount_percentage > 0
                      const finalPrice = service.discounted_price || service.price
                      
                      return (
                        <div 
                          key={service.id} 
                          className="group rounded-2xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                          {/* Image */}
                          {service.image_urls && service.image_urls.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={service.image_urls[0]} 
                              alt={service.name}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                              <Briefcase className="h-12 w-12 text-indigo-400" />
                            </div>
                          )}
                          
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{service.name}</h3>
                            {service.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                            )}
                            
                            {/* Price */}
                            <div className="flex items-center gap-2 mb-3">
                              {hasDiscount && (
                                <span className="text-sm text-gray-400 line-through">{service.price} {service.currency}</span>
                              )}
                              <span className="text-xl font-bold text-indigo-600">
                                {finalPrice} {service.currency}
                              </span>
                              {hasDiscount && (
                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                                  -{service.discount_percentage}%
                                </span>
                              )}
                            </div>
                            
                            {service.is_bookable && (
                              <button className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">
                                Bron et
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Gallery Section */}
              {media && media.length > 0 && (
                <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-600 to-purple-600"></div>
                    <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
                    <span className="ml-auto text-sm text-gray-500">{media.length} photos</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {media.map(m => (
                      <div key={m.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={m.url} 
                          alt={m.title || ''} 
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reviews Section */}
              {reviews && reviews.length > 0 && (
                <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-1 rounded-full bg-gradient-to-b from-amber-500 to-orange-600"></div>
                    <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                    {averageRating && (
                      <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200">
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-gray-900">{averageRating}</span>
                        <span className="text-sm text-gray-600">/ 5.0</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {reviews.map(r => {
                      const u: any = Array.isArray(r.users) ? r.users[0] : r.users
                      return (
                        <div key={r.id} className="group rounded-2xl border border-gray-200 bg-gray-50/50 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              {u?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={u.avatar_url} alt="" className="h-10 w-10 rounded-full ring-2 ring-white shadow-md" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 ring-2 ring-white shadow-md flex items-center justify-center text-white font-bold">
                                  {(u?.full_name || u?.username || 'U')[0]}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-gray-900">{u?.full_name || u?.username || 'Anonymous'}</div>
                                <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          {r.comment && (
                            <p className="text-gray-700 leading-relaxed">{r.comment}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Posts Section */}
              {posts && posts.length > 0 && (
                <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-1 rounded-full bg-gradient-to-b from-green-500 to-teal-600"></div>
                    <h2 className="text-2xl font-bold text-gray-900">Latest Updates</h2>
                    <span className="ml-auto text-sm text-gray-500">{posts.length} posts</span>
                  </div>
                  <div className="space-y-4">
                    {posts.map(p => (
                      <article key={p.id} className="group rounded-2xl border border-gray-200 bg-gray-50/50 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{p.title}</h3>
                          {p.published_at && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                              <Calendar className="h-3 w-3" />
                              {new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                        </div>
                        {p.content && (
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{p.content}</p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </main>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
              {/* Rating Card */}
              {(averageRating || totalReviews > 0) && (
                <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border border-amber-200/50 shadow-xl p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-4">
                      <Star className="h-10 w-10 text-white fill-white" />
                    </div>
                    {averageRating && (
                      <div className="mb-2">
                        <div className="text-4xl font-bold text-gray-900 mb-1">{averageRating}</div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-5 w-5 ${i < Math.round(parseFloat(averageRating)) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-sm text-gray-600 font-medium">
                      Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-600 to-purple-600"></div>
                  <h3 className="text-xl font-bold text-gray-900">Contact Info</h3>
                </div>
                <div className="space-y-4">
                  {business.email && (
                    <a 
                      href={`mailto:${business.email}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 mb-0.5">Email</div>
                        <div className="text-sm font-medium text-gray-900 truncate">{business.email}</div>
                      </div>
                    </a>
                  )}
                  {business.phone && (
                    <a 
                      href={`tel:${business.phone}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 mb-0.5">Phone</div>
                        <div className="text-sm font-medium text-gray-900">{business.phone}</div>
                      </div>
                    </a>
                  )}
                  {business.location && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 mb-0.5">Location</div>
                        <div className="text-sm font-medium text-gray-900">{business.location}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Map */}
                {(business.latitude || business.longitude) && (
                  <div className="mt-4">
                    <BusinessLocationMap latitude={business.latitude} longitude={business.longitude} />
                  </div>
                )}

                {/* Website Button */}
                {business.website && (
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="mt-4 flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Globe className="h-5 w-5" />
                    Visit Website
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Social Media */}
              {(business.social_instagram || business.social_tiktok || business.social_facebook || business.social_youtube) && (
                <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-1 rounded-full bg-gradient-to-b from-pink-500 to-purple-600"></div>
                    <h3 className="text-xl font-bold text-gray-900">Follow Us</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {business.social_instagram && (
                      <a 
                        href={business.social_instagram} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition-all duration-300 group"
                      >
                        <Instagram className="h-5 w-5 text-pink-600" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600">Instagram</span>
                      </a>
                    )}
                    {business.social_facebook && (
                      <a 
                        href={business.social_facebook} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
                      >
                        <Facebook className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Facebook</span>
                      </a>
                    )}
                    {business.social_tiktok && (
                      <a 
                        href={business.social_tiktok} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all duration-300 group"
                      >
                        <MessageCircle className="h-5 w-5 text-gray-900" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">TikTok</span>
                      </a>
                    )}
                    {business.social_youtube && (
                      <a 
                        href={business.social_youtube} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all duration-300 group"
                      >
                        <Youtube className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">YouTube</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}


