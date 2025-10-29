import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { supabaseAdmin } from '@/lib/supabase/server'
import { 
  MapPin, Star, Users, ArrowLeft, Globe, Clock, DollarSign, 
  Languages, Calendar, Thermometer, Shield, Utensils, 
  Landmark, Heart, Palette, Activity, AlertCircle, Info,
  Building2, Hotel, MapPinned
} from 'lucide-react'
import dynamic from 'next/dynamic'
const CountryActions = dynamic(() => import('@/components/countries/CountryActions'))
import { getTranslations } from 'next-intl/server'
const CountryReviews = dynamic(() => import('@/components/countries/CountryReviews'))
const CountryTabs = dynamic(() => import('@/components/countries/CountryTabs'))
const CountryCardReview = dynamic(() => import('@/components/countries/CountryCardReview'))
const CountryReviewKPI = dynamic(() => import('@/components/countries/CountryReviewKPI'))
const BusinessLocationMap = dynamic(() => import('@/components/business/BusinessLocationMap'))
const CurrencyExchange = dynamic(() => import('@/components/countries/CurrencyExchange'))
const WeatherWidget = dynamic(() => import('@/components/countries/WeatherWidget'))

interface CountryPageProps {
  params: Promise<{ slug: string }>
}

export default async function CountryDetailPage(context: CountryPageProps) {
  const t = await getTranslations('countries')
  const { slug } = await context.params
  const { data: live } = await supabaseAdmin
    .from('countries')
    .select('*')
    .eq('slug', slug)
    .single()
  const country: any = live || null
  if (!country) return notFound()

  const rating = 4.7
  const visitors = 89
  const reviews = '18.9K'
  const articles = 203
  const media = 145
  const budgetDaily = country.average_budget?.daily ?? 80
  const budgetLabel = budgetDaily >= 120 ? t('card.budget.luxury') : budgetDaily >= 70 ? t('card.budget.midRange') : t('card.budget.budget')
  const hasImage = Boolean(country.featured_image)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Image */}
      {/* Recommended image size: 2560x1080px or 1920x823px (21:9 cinematic ratio) */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] min-h-[220px] sm:min-h-[300px] md:min-h-[360px] lg:min-h-[400px] max-h-[600px]">
        {hasImage ? (
          <Image 
            src={country.featured_image || '/next.svg'} 
            alt={country.name} 
            fill 
            className="object-cover" 
            style={{ objectPosition: '50% 15%' }}
            sizes="100vw" 
            priority 
            quality={95}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <Link href="/countries" className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white mb-4">
          <ArrowLeft className="h-4 w-4" /> {t('detail.back')}
        </Link>
            
            <div className="flex flex-wrap items-start gap-4 mb-6">
              {country.flag_icon && (
                <div className="relative group">
                  <div 
                    className="text-4xl sm:text-6xl transform group-hover:scale-110 transition-transform"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8)) drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
                      WebkitFilter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8)) drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
                    }}
                  >
                    {country.flag_icon}
                  </div>
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-2xl -z-10"></div>
      </div>
              )}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg px-3 py-1 font-semibold">
                    <Star className="h-3 w-3 mr-1 inline text-white fill-white" />
                    {t('detail.featured')}
                  </Badge>
                  <Badge className="bg-white/20 text-white border border-white/40 backdrop-blur-md shadow-lg px-3 py-1 font-semibold">
                    <DollarSign className="h-3 w-3 mr-1 inline text-white" />
                    {budgetLabel}
                  </Badge>
                  {country.iso_code && (
                    <Badge className="bg-white/20 text-white border border-white/40 backdrop-blur-md shadow-lg px-3 py-1 font-semibold">
                      <Globe className="h-3 w-3 mr-1 inline text-white" />
                      {country.iso_code}
                    </Badge>
                  )}
          </div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-3 drop-shadow-lg">
            {country.name}
          </h1>
          {country.capital && (
                  <div className="flex items-center gap-2 text-white/95 text-lg mb-2 drop-shadow">
                    <MapPin className="h-5 w-5" /> 
                    <span className="font-medium">{country.capital}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <CountryCardReview 
                countryId={country.id} 
                countrySlug={country.slug} 
                withReviewsLabel 
                theme="dark"
              />
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 text-white font-medium">
                <Users className="h-5 w-5" /> 
                {t('detail.visitorsPerYear', { count: visitors })}
              </span>
          </div>
          </div>
          </div>
        </div>

      <div className="container mx-auto px-4 -mt-6 sm:-mt-8 relative z-10">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button className="group px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              {t('detail.planTrip')}
            </span>
          </button>
          <CountryActions countryId={country.id} countryName={country.name} />
      </div>

      <CountryTabs
        countryId={country.id}
        countrySlug={country.slug}
        overview={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {country.culture_description && (
                <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">About {country.name}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{country.culture_description}</p>
                </Card>
              )}

              {/* Quick Facts Grid */}
              <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{t('detail.quickFacts')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {country.capital && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 font-medium">{t('detail.facts.capital')}</div>
                        <div className="text-sm font-semibold text-gray-900">{country.capital}</div>
                      </div>
                    </div>
                  )}
                  {country.population && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Users className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 font-medium">{t('detail.facts.population')}</div>
                        <div className="text-sm font-semibold text-gray-900">{t('detail.facts.populationValue', { value: Math.round(country.population/1_000_000) })}</div>
                      </div>
                    </div>
                  )}
                  {country.official_language && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Languages className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 font-medium">{t('detail.facts.language')}</div>
                        <div className="text-sm font-semibold text-gray-900">{country.official_language}</div>
                      </div>
                    </div>
                  )}
                  {country.timezone && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 font-medium">{t('detail.facts.timeZone')}</div>
                        <div className="text-sm font-semibold text-gray-900">{country.timezone}</div>
                      </div>
                    </div>
                  )}
                  {country.best_time_to_visit && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 font-medium">{t('detail.facts.bestTime')}</div>
                        <div className="text-sm font-semibold text-gray-900">{country.best_time_to_visit}</div>
                      </div>
                    </div>
                  )}
                  {country.climate_info && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Thermometer className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 font-medium">{t('detail.facts.climate')}</div>
                        <div className="text-sm font-semibold text-gray-900">{country.climate_info}</div>
                      </div>
                    </div>
                  )}
                  {country.average_budget?.daily && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 font-medium">Daily Budget</div>
                        <div className="text-sm font-semibold text-gray-900">${country.average_budget.daily}/day</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Currency Exchange - Full Width */}
                {country.currency && (
                  <div className="mt-4">
                    <CurrencyExchange 
                      currencyCode={country.currency_code}
                      currencyName={country.currency}
                      countryName={country.name}
                    />
                  </div>
                )}
              </Card>

              {/* Visa & Entry Requirements */}
              {(country.visa_info || country.entry_requirements) && (
                <Card className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Visa & Entry Requirements</h3>
                  </div>
                  {country.visa_info && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Visa Information</div>
                      <p className="text-sm text-gray-600">{country.visa_info}</p>
                    </div>
                  )}
                  {country.entry_requirements && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Entry Requirements</div>
                      <p className="text-sm text-gray-600">{country.entry_requirements}</p>
                    </div>
                  )}
                </Card>
              )}

              {/* Historical Information */}
              {country.historical_info && (
                <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Landmark className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">History & Heritage</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{country.historical_info}</p>
                </Card>
              )}

              {/* Food & Cuisine */}
              {country.food_description && (
                <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Utensils className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Food & Cuisine</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{country.food_description}</p>
                </Card>
              )}

              {/* Local Customs */}
              {country.local_customs && (
                <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Palette className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Local Customs & Culture</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{country.local_customs}</p>
                </Card>
              )}

              {/* Map */}
              {!!country.latitude && !!country.longitude && (
                <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPinned className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Location</h3>
                  </div>
                  <BusinessLocationMap 
                    latitude={country.latitude} 
                    longitude={country.longitude} 
                    height={320} 
                    theme="voyager"
                    showControls={true}
                  />
                </Card>
              )}

              {/* Top Places */}
              {!!country.top_places?.length && (
                <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t('detail.highlights')}</h3>
                  </div>
                <div className="grid sm:grid-cols-2 gap-3">
                    {country.top_places.map((place: any) => (
                      <div key={place.name} className="group hover:shadow-md transition-shadow rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-3 w-3 rounded-full bg-indigo-500 mt-1.5 group-hover:scale-110 transition-transform" />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">{place.name}</div>
                            {place.description && <p className="text-sm text-gray-600 line-clamp-2">{place.description}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Popular Activities */}
              {!!country.popular_activities?.length && (
                <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Activity className="h-5 w-5 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Popular Activities</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {country.popular_activities.map((activity: string, idx: number) => (
                      <span key={idx} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-full text-sm font-medium text-gray-800 hover:shadow-md transition-shadow">
                        <Heart className="h-4 w-4 text-pink-500" />
                        {activity}
                      </span>
                  ))}
                </div>
              </Card>
              )}

              {/* Popular Restaurants */}
              {!!country.popular_restaurants?.length && (
                <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Utensils className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Popular Restaurants</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {country.popular_restaurants.slice(0, 6).map((v: any) => (
                      <div key={v.name} className="group rounded-xl border border-gray-200 hover:shadow-lg hover:border-red-300 transition-all bg-gradient-to-br from-white to-red-50/30 overflow-hidden">
                        {/* Image Section - Full Width */}
                        <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200">
                          {v.image ? (
                            <Image src={v.image} alt={v.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, 50vw" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Utensils className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>
                        
                        {/* Content Section */}
                        <div className="p-4 space-y-2">
                          <div className="font-bold text-lg text-gray-900 line-clamp-1">{v.name}</div>
                          {v.description && (
                            <div className="text-sm text-gray-600 line-clamp-2">{v.description}</div>
                          )}
                          {v.location?.address && (
                            <div className="flex items-start gap-1.5 text-xs text-gray-500">
                              <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1">{v.location.address}</span>
                            </div>
                          )}
                          {v.url && (
                            <a 
                              href={v.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium group/link mt-3"
                            >
                              <Globe className="h-4 w-4" />
                              <span className="group-hover/link:underline">Visit Website</span>
                              <svg className="h-3 w-3 group-hover/link:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Popular Hotels */}
              {!!country.popular_hotels?.length && (
                <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Hotel className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Popular Hotels</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {country.popular_hotels.slice(0, 6).map((v: any) => (
                      <div key={v.name} className="group rounded-xl border border-gray-200 hover:shadow-lg hover:border-teal-300 transition-all bg-gradient-to-br from-white to-teal-50/30 overflow-hidden">
                        {/* Image Section - Full Width */}
                        <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200">
                          {v.image ? (
                            <Image src={v.image} alt={v.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, 50vw" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Hotel className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>
                        
                        {/* Content Section */}
                        <div className="p-4 space-y-2">
                          <div className="font-bold text-lg text-gray-900 line-clamp-1">{v.name}</div>
                          {v.description && (
                            <div className="text-sm text-gray-600 line-clamp-2">{v.description}</div>
                          )}
                          {v.location?.address && (
                            <div className="flex items-start gap-1.5 text-xs text-gray-500">
                              <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1">{v.location.address}</span>
                            </div>
                          )}
                          {v.url && (
                            <a 
                              href={v.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium group/link mt-3"
                            >
                              <Globe className="h-4 w-4" />
                              <span className="group-hover/link:underline">Visit Website</span>
                              <svg className="h-3 w-3 group-hover/link:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Weather Widget */}
              <WeatherWidget 
                countryName={country.name}
                cities={country.popular_cities}
                latitude={country.latitude}
                longitude={country.longitude}
              />

              {/* Travel Stats */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('detail.travelStats')}</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{visitors}M</div>
                    <div className="text-xs text-gray-600 mt-1">{t('detail.annualVisitors')}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-amber-600"><CountryReviewKPI countryId={country.id} countrySlug={country.slug} metric="avg" /></div>
                    <div className="text-xs text-gray-600 mt-1">{t('detail.averageRating')}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600"><CountryReviewKPI countryId={country.id} countrySlug={country.slug} metric="count" /></div>
                    <div className="text-xs text-gray-600 mt-1">{t('detail.reviews')}</div>
                  </div>
                </div>
              </Card>

              {/* AI Advice */}
              {country.airen_advice && (
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Info className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Airen's Advice</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{country.airen_advice}</p>
                </Card>
              )}

              {/* Things to Consider */}
              {!!country.negatives?.length && (
                <Card className="bg-orange-50 border border-orange-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Things to Consider</h3>
                  </div>
                  <ul className="space-y-2">
                    {country.negatives.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </div>
        }
      />
      </div>
    </div>
  )
}






