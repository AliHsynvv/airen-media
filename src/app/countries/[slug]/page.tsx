import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { mockCountries } from '@/lib/data/mock-countries'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { supabaseAdmin } from '@/lib/supabase/server'
import { MapPin, Star, Users, ArrowLeft } from 'lucide-react'
import CountryActions from '@/components/countries/CountryActions'
import CountryReviews from '@/components/countries/CountryReviews'
import CountryTabs from '@/components/countries/CountryTabs'
import CountryCardReview from '@/components/countries/CountryCardReview'
import CountryReviewKPI from '@/components/countries/CountryReviewKPI'

interface CountryPageProps {
  params: { slug: string }
}

export default async function CountryDetailPage({ params }: CountryPageProps) {
  // Try Supabase first
  const { data: live } = await supabaseAdmin
    .from('countries')
    .select('*')
    .eq('slug', params.slug)
    .single()
  const country: any = live || mockCountries.find(c => c.slug === params.slug) || null
  if (!country) return notFound()

  const rating = 4.7
  const visitors = 89
  const reviews = '18.9K'
  const articles = 203
  const media = 145
  const budgetDaily = country.average_budget?.daily ?? 80
  const budgetLabel = budgetDaily >= 120 ? 'Luxury' : budgetDaily >= 70 ? 'Mid-range' : 'Budget'
  const hasImage = Boolean(country.featured_image)

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Back link */}
      <div className="mb-4">
        <Link href="/countries" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Back to Countries
        </Link>
      </div>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-xs font-medium">Featured</span>
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
            {country.culture_description || 'Experience unique culture, cuisine and history.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <CountryCardReview countryId={country.id} countrySlug={country.slug} withReviewsLabel />
            <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> {visitors} million visitors/year</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button className="h-9 px-3 rounded-md bg-black text-white hover:bg-black/90">Plan Your Trip</button>
            <CountryActions countryId={country.id} countryName={country.name} />
          </div>
        </div>

        {/* Right media box */}
        <div className="relative aspect-[4/3] rounded-xl border border-gray-200 bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
          {hasImage ? (
            <Image src={country.featured_image || '/next.svg'} alt={country.name} fill className="object-cover" sizes="50vw" />
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
                <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Facts</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                  <div className="text-gray-500">Capital:</div>
                  <div className="text-gray-900">{country.capital || '-'}</div>
                  <div className="text-gray-500">Population:</div>
                  <div className="text-gray-900">{country.population ? `${Math.round(country.population/1_000_000)}.0 million` : '-'}</div>
                  <div className="text-gray-500">Currency:</div>
                  <div className="text-gray-900">{country.currency || '-'}</div>
                  <div className="text-gray-500">Language:</div>
                  <div className="text-gray-900">{country.official_language || '-'}</div>
                  <div className="text-gray-500">Time Zone:</div>
                  <div className="text-gray-900">{country.timezone || '-'}</div>
                  <div className="text-gray-500">Best Time to Visit:</div>
                  <div className="text-gray-900">{country.best_time_to_visit || 'All year'}</div>
                  <div className="text-gray-500">Climate:</div>
                  <div className="text-gray-900">{country.climate_info || 'Temperate'}</div>
                  <div className="text-gray-500">Visa Required:</div>
                  <div className="text-gray-900">{country.visa_info ? 'Yes' : 'No'}</div>
                </div>
              </Card>
              <Card className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Top Highlights</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {country.top_places?.map(place => (
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
                <h3 className="text-base font-semibold text-gray-900 mb-4">Travel Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">{visitors} million</div>
                    <div className="text-xs text-gray-500">Annual Visitors</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900"><CountryReviewKPI countryId={country.id} countrySlug={country.slug} metric="avg" /></div>
                    <div className="text-xs text-gray-500">Average Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900"><CountryReviewKPI countryId={country.id} countrySlug={country.slug} metric="count" /></div>
                    <div className="text-xs text-gray-500">Reviews</div>
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


