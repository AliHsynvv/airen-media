import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import RestaurantsList from '@/components/countries/RestaurantsList'

interface RestaurantsPageProps {
  params: Promise<{ slug: string }>
}

export default async function CountryRestaurantsPage(context: RestaurantsPageProps) {
  const { slug } = await context.params

  const { data: country } = await supabaseAdmin
    .from('countries')
    .select('name, slug, flag_icon, popular_restaurants')
    .eq('slug', slug)
    .single()

  if (!country) return notFound()

  const restaurants = country.popular_restaurants || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header - Enhanced Modern Design */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-rose-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <Link 
            href={`/countries/${slug}`}
            className="inline-flex items-center gap-2.5 text-white/90 hover:text-white mb-8 transition-all bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/20 font-semibold"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to {country.name}</span>
          </Link>

          <div className="flex items-center gap-6">
            {country.flag_icon && (
              <div className="text-7xl drop-shadow-2xl">{country.flag_icon}</div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                  <span className="text-sm font-bold uppercase tracking-wider">🍽️ Restaurants</span>
                </div>
              </div>
              <h1 className="text-5xl font-black mb-3 drop-shadow-lg">
                Restaurants in {country.name}
              </h1>
              <p className="text-red-100 text-xl font-medium flex items-center gap-2">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/30">
                  {restaurants.length} dining experiences
                </span>
                <span>• Curated & Rated</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12">
            <path d="M0 48h1440V0c-120 32-240 48-360 48S840 32 720 0 480 32 360 48C240 32 120 0 0 0v48z" fill="white" fillOpacity="0.1"/>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <RestaurantsList restaurants={restaurants} />
      </div>
    </div>
  )
}
