import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Country } from '@/types/country'
import { ROUTES } from '@/lib/utils/constants'
import { cn } from '@/lib/utils'
import { MapPin, Calendar, Thermometer, Wallet, ArrowRight } from 'lucide-react'
import CountryCardReview from '@/components/countries/CountryCardReview'
import CountryCardActions from '@/components/countries/CountryCardActions'
import { useTranslations } from 'next-intl'

interface CountryCardProps {
  country: Country
  className?: string
}

export function CountryCard({ country, className }: CountryCardProps) {
  const t = useTranslations('countries')
  const hasImage = Boolean(country.featured_image)
  const budgetDaily = country.average_budget?.daily ?? 80
  const budgetLabel = budgetDaily >= 120 ? t('card.budget.luxury') : budgetDaily >= 70 ? t('card.budget.midRange') : t('card.budget.budget')
  const rating = 4.6 + (country.name.length % 3) * 0.1
  const trending = (country.popular_activities || []).length >= 3
  const featured = (country.top_places || []).length >= 2

  return (
    <Link href={`${ROUTES.COUNTRIES}/${country.slug}`} className={cn('block group', className)}>
      <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
        {/* Header / Media */}
        <div className="relative h-40 rounded-xl overflow-hidden">
          {hasImage ? (
            <>
              <Image
                src={country.featured_image || '/next.svg'}
                alt={country.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 flex items-center justify-center">
              <div className="text-5xl font-bold tracking-widest text-gray-600 drop-shadow">
                {country.iso_code || country.id?.toUpperCase()}
              </div>
            </div>
          )}

          {/* badges */}
          <div className="absolute top-2 left-2 flex items-center gap-2">
            {trending && (
              <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 text-xs font-medium">{t('card.trending')}</span>
            )}
            {featured && (
              <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-xs font-medium">{t('card.featured')}</span>
            )}
          </div>
          <CountryCardReview countryId={country.id} countrySlug={country.slug} variant="badge" fallbackRating={rating} />
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-baseline gap-2">
            <h3 className="text-gray-900 font-semibold text-lg">{country.name}</h3>
            {country.iso_code && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200">
                {country.iso_code}
              </span>
            )}
          </div>
          {country.capital && (
            <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5" /> {country.capital}
            </div>
          )}

          {/* description */}
          <p className="mt-3 text-sm text-gray-600">
            {country.culture_description || country.food_description || t('card.fallbackDescription')}
          </p>

          {/* meta */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-gray-600">
            <div className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate">{country.best_time_to_visit || t('card.allYear')}</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Thermometer className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate">{country.climate_info || t('card.temperate')}</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate">{budgetLabel}</span>
            </div>
          </div>

          {/* tags */}
          {!!country.top_places?.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {country.top_places.slice(0, 3).map(place => (
                <span key={place.name} className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 text-xs">
                  {place.name}
                </span>
              ))}
              {country.top_places.length > 3 && (
                <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 text-xs">
                  +{country.top_places.length - 3}
                </span>
              )}
            </div>
          )}

          {/* footer */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="inline-flex items-center gap-3">
                <CountryCardReview countryId={country.id} countrySlug={country.slug} fallbackRating={rating} />
              </div>
              <span className="inline-flex items-center gap-1 text-gray-700 group-hover:text-gray-900">
                {t('card.explore')} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <CountryCardActions countryId={country.id} countrySlug={country.slug} />
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default CountryCard


