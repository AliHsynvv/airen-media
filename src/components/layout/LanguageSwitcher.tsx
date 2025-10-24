"use client"

import { useTransition } from 'react'
import { useLocale } from 'next-intl'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { locales, localeNames, type Locale } from '@/i18n/config'
import { useEffect, useRef, useState } from 'react'

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition()
  const locale = useLocale() as Locale
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!open) return
      const target = e.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const handleLocaleChange = (newLocale: Locale) => {
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
      window.location.reload()
    })
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-700 hover:text-gray-900"
        disabled={isPending}
        aria-label="Change language"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <Globe className="h-5 w-5" />
        <span className="sr-only">Change language</span>
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
          <div className="p-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                disabled={isPending}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  locale === loc ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {localeNames[loc]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

