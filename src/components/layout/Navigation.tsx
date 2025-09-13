'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/utils/constants'

interface NavigationItem {
  name: string
  href: string
  description?: string
  external?: boolean
}

const mainNavigation: NavigationItem[] = [
  { 
    name: 'Ana Sayfa', 
    href: ROUTES.HOME,
    description: 'Airen ile seyahat dünyasını keşfet'
  },
  { 
    name: 'Haberler', 
    href: ROUTES.NEWS,
    description: 'Turizm dünyasından son haberler'
  },
  { 
    name: 'Makaleler', 
    href: ROUTES.ARTICLES,
    description: 'Şehir rehberleri ve seyahat ipuçları'
  },
  { 
    name: 'Medya', 
    href: ROUTES.MEDIA,
    description: 'Videolar ve podcast\'ler'
  },
  { 
    name: 'Ülkeler', 
    href: ROUTES.COUNTRIES,
    description: 'Detaylı ülke bilgileri ve rehberler'
  },
  { 
    name: 'Topluluk', 
    href: ROUTES.COMMUNITY,
    description: 'Seyahat hikayeleri ve deneyimler'
  },
  { 
    name: 'Etkileşim', 
    href: ROUTES.INTERACTION,
    description: 'Airen AI ile konuş'
  },
]

interface NavigationProps {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'minimal' | 'sidebar'
  className?: string
}

export function Navigation({ 
  orientation = 'horizontal', 
  variant = 'default',
  className 
}: NavigationProps) {
  const pathname = usePathname()

  if (variant === 'sidebar') {
    return (
      <nav className={cn('space-y-1', className)}>
        {mainNavigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== ROUTES.HOME && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-start gap-2 px-3 py-2 rounded-md transition-all duration-150',
                isActive
                  ? 'bg-gray-100 text-black shadow-sm'
                  : 'text-black hover:bg-gray-100 hover:text-black'
              )}
            >
              <div className="flex-1">
                <div className={cn('text-sm font-medium', 'text-black')}>{item.name}</div>
                {item.description && (
                  <div className={cn('text-[11px] mt-0.5', 'text-black')}>{item.description}</div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>
    )
  }

  if (variant === 'minimal') {
    return (
      <nav className={cn(
        orientation === 'horizontal' 
          ? 'flex items-center space-x-6' 
          : 'flex flex-col space-y-2',
        className
      )}>
        {mainNavigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== ROUTES.HOME && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors duration-200 focus-ring rounded-lg px-2 py-1',
                isActive
                  ? 'text-airen-blue'
                  : 'text-gray-700 hover:text-airen-blue'
              )}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>
    )
  }

  // Default variant
  return (
    <nav className={cn(
      orientation === 'horizontal' 
        ? 'flex items-center space-x-8' 
        : 'flex flex-col space-y-4',
      className
    )}>
      {mainNavigation.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== ROUTES.HOME && pathname.startsWith(item.href))
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group relative transition-colors duration-200 focus-ring rounded-lg',
              orientation === 'horizontal' ? 'px-2 py-1' : 'px-3 py-2'
            )}
          >
            <span className={cn(
              'font-medium',
              isActive
                ? 'text-airen-blue'
                : 'text-gray-700 group-hover:text-airen-blue'
            )}>
              {item.name}
            </span>
            
            {/* Active indicator for horizontal layout */}
            {orientation === 'horizontal' && isActive && (
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-airen-blue rounded-full" />
            )}
            
            {/* Description for vertical layout */}
            {orientation === 'vertical' && item.description && (
              <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-700">
                {item.description}
              </div>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export { mainNavigation, type NavigationItem }
