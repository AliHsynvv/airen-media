import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { supabaseAdmin } from '@/lib/supabase/server'
import { MapPin, Star, Users, ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'
const CountryActions = dynamic(() => import('@/components/countries/CountryActions'))
import { getTranslations } from 'next-intl/server'
const CountryReviews = dynamic(() => import('@/components/countries/CountryReviews'))
const CountryTabs = dynamic(() => import('@/components/countries/CountryTabs'))
const CountryCardReview = dynamic(() => import('@/components/countries/CountryCardReview'))
const CountryReviewKPI = dynamic(() => import('@/components/countries/CountryReviewKPI'))

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
    <div className="container mx-auto px-4 py-10">
      {/* Back link */}
      <div className="mb-4">
        <Link href="/countries" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> {t('detail.back')}
        </Link>
      </div>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-xs font-medium">{t('detail.featured')}</span>
            <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 border border-gray-200 px-2 py-0.5 text-xs font-medium">{budgetLabel}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-baseline gap-2">
            {country.name}
            {country.iso_code && <span className="text-base font-medium text-gray-500">{country.iso_code}</span>}
          </h1>
          {country.capital && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" /> {country.capital}
            </div>
          )}
          <p className="text-gray-600 max-w-xl">
            {country.culture_description || t('detail.fallbackDescription')}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <CountryCardReview countryId={country.id} countrySlug={country.slug} withReviewsLabel />
            <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> {t('detail.visitorsPerYear', { count: visitors })}</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button className="h-9 px-3 rounded-md bg-black text-white hover:bg-black/90">{t('detail.planTrip')}</button>
            <CountryActions countryId={country.id} countryName={country.name} />
          </div>
        </div>

        {/* Right media box */}
        <div className="relative aspect-[4/3] rounded-xl border border-gray-200 bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
          {hasImage ? (
            <Image src={country.featured_image || '/next.svg'} alt={country.name} fill className="object-cover" sizes="50vw" priority />
          ) : (
            <div className="text-6xl font-semibold tracking-widest text-gray-600">{country.iso_code || '—'}</div>
          )}
        </div>
      </div>

      <CountryTabs
        countryId={country.id}
        countrySlug={country.slug}
        overview={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">{t('detail.quickFacts')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                  <div className="text-gray-500">{t('detail.facts.capital')}:</div>
                  <div className="text-gray-900">{country.capital || '-'}</div>
                  <div className="text-gray-500">{t('detail.facts.population')}:</div>
                  <div className="text-gray-900">{country.population ? t('detail.facts.populationValue', { value: Math.round(country.population/1_000_000) }) : '-'}</div>
                  <div className="text-gray-500">{t('detail.facts.currency')}:</div>
                  <div className="text-gray-900">{country.currency || '-'}</div>
                  <div className="text-gray-500">{t('detail.facts.language')}:</div>
                  <div className="text-gray-900">{country.official_language || '-'}</div>
                  <div className="text-gray-500">{t('detail.facts.timeZone')}:</div>
                  <div className="text-gray-900">{country.timezone || '-'}</div>
                  <div className="text-gray-500">{t('detail.facts.bestTime')}:</div>
                  <div className="text-gray-900">{country.best_time_to_visit || t('card.allYear')}</div>
                  <div className="text-gray-500">{t('detail.facts.climate')}:</div>
                  <div className="text-gray-900">{country.climate_info || t('card.temperate')}</div>
                  <div className="text-gray-500">{t('detail.facts.visaRequired')}:</div>
                  <div className="text-gray-900">{country.visa_info ? t('detail.facts.yes') : t('detail.facts.no')}</div>
                </div>
              </Card>
              <Card className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">{t('detail.highlights')}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {country.top_places?.map((place: { name: string }) => (
                    <div key={place.name} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
                      <span className="h-2 w-2 rounded-full bg-gray-400" />
                      <span className="text-sm text-gray-800">{place.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">{t('detail.travelStats')}</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">{visitors} million</div>
                    <div className="text-xs text-gray-500">{t('detail.annualVisitors')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900"><CountryReviewKPI countryId={country.id} countrySlug={country.slug} metric="avg" /></div>
                    <div className="text-xs text-gray-500">{t('detail.averageRating')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900"><CountryReviewKPI countryId={country.id} countrySlug={country.slug} metric="count" /></div>
                    <div className="text-xs text-gray-500">{t('detail.reviews')}</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        }
      />
    </div>
  )
}


