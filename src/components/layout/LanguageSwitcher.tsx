'use client'

import { useTransition } from 'react'
import { useLocale } from 'next-intl'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { locales, localeNames, type Locale } from '@/i18n/config'

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition()
  const locale = useLocale() as Locale

  const handleLocaleChange = (newLocale: Locale) => {
    startTransition(() => {
      // Set cookie for locale
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
      // Reload to apply new locale
      window.location.reload()
    })
  }

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-700 hover:text-gray-900"
        disabled={isPending}
      >
        <Globe className="h-5 w-5" />
        <span className="sr-only">Change language</span>
      </Button>
      
      <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg border border-gray-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2 space-y-1">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              disabled={isPending}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                locale === loc
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {localeNames[loc]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

