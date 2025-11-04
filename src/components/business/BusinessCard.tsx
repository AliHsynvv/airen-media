'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { MapPin, Star, Phone, Globe, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BusinessCardProps {
  business: {
    id: string
    name: string
    description?: string | null
    category?: string | null
    profile_image_url?: string | null
    cover_image_url?: string | null
    location?: string | null
    phone?: string | null
    email?: string | null
    website?: string | null
    average_rating?: number | null
    is_active?: boolean
  }
  className?: string
}

export function BusinessCard({ business, className }: BusinessCardProps) {
  const featuredImage = business.cover_image_url || business.profile_image_url
  const hasImage = Boolean(featuredImage)
  const rating = business.average_rating || 4.5

  return (
    <Link href={`/business/${business.id}`} className={cn('block group', className)}>
      <Card className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
        {/* Image Header */}
        <div className="relative h-48 overflow-hidden">
          {hasImage ? (
            <>
              <Image
                src={featuredImage || '/next.svg'}
                alt={business.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-400">
                {business.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {business.is_active && (
              <span className="inline-flex items-center rounded-full bg-green-500 text-white px-3 py-1 text-xs font-semibold shadow-lg">
                ✓ Active
              </span>
            )}
            {business.category && (
              <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 text-xs font-medium shadow-md">
                {business.category}
              </span>
            )}
          </div>

          {/* Rating Badge */}
          {rating && (
            <div className="absolute top-3 right-3">
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-white px-3 py-1 text-sm font-bold shadow-lg">
                <Star className="h-3.5 w-3.5 fill-current" />
                {rating.toFixed(1)}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2 group-hover:text-indigo-600 transition-colors">
            {business.name}
          </h3>
          
          {business.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
              {business.description}
            </p>
          )}

          {/* Location */}
          {business.location && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{business.location}</span>
            </div>
          )}

          {/* Contact Info */}
          {(business.phone || business.website) && (
            <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
              {business.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="truncate">{business.phone}</span>
                </div>
              )}
              {business.website && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="truncate">Website</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end pt-3 border-t border-gray-100">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">
              View Details <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default BusinessCard

