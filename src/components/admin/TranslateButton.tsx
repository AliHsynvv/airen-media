'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Languages, Loader2 } from 'lucide-react'

interface TranslateButtonProps {
  text: string
  field: string
  sourceLang: 'tr' | 'en' | 'ru'
  targetLangs: Array<'tr' | 'en' | 'ru'>
  onTranslated: (translations: Record<string, string>) => void
  className?: string
  buttonText?: string
}

export function TranslateButton({ 
  text, 
  field, 
  sourceLang,
  targetLangs,
  onTranslated, 
  className,
  buttonText 
}: TranslateButtonProps) {
  const [translating, setTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTranslate = async () => {
    if (!text || text.trim() === '') {
      setError('Çevrilecek metin yok')
      setTimeout(() => setError(null), 3000)
      return
    }

    setTranslating(true)
    setError(null)

    try {
      // Tüm hedef dillere paralel olarak çeviri yap
      const translationPromises = targetLangs.map(targetLang => 
        fetch('/api/admin/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            sourceLang,
            targetLang,
            field
          })
        })
      )

      const responses = await Promise.all(translationPromises)
      const dataPromises = responses.map(r => r.json())
      const results = await Promise.all(dataPromises)

      // Hata kontrolü
      const hasError = results.some(r => !r.success)
      if (hasError) {
        const errorMsg = results.find(r => !r.success)?.error || 'Çeviri başarısız'
        throw new Error(errorMsg)
      }

      // Sonuçları obje formatına çevir
      const translations: Record<string, string> = {}
      targetLangs.forEach((lang, index) => {
        translations[lang] = results[index].translation
      })

      onTranslated(translations)

      setError('✅ Çevrildi')
      setTimeout(() => setError(null), 2000)

    } catch (err: any) {
      console.error('Translation error:', err)
      setError(err.message || 'Çeviri hatası')
      setTimeout(() => setError(null), 5000)
    } finally {
      setTranslating(false)
    }
  }

  // Dil isimleri
  const langNames = {
    tr: 'TR',
    en: 'EN',
    ru: 'RU'
  }

  const defaultButtonText = targetLangs.length === 1 
    ? `${langNames[targetLangs[0]]}'ye Çevir`
    : targetLangs.map(l => langNames[l]).join(' & ') + "'ya Çevir"

  return (
    <div className="relative inline-block">
      <Button
        type="button"
        onClick={handleTranslate}
        disabled={translating || !text}
        className={`
          bg-gradient-to-r from-purple-600 to-indigo-600 
          hover:from-purple-700 hover:to-indigo-700 
          disabled:opacity-50 disabled:cursor-not-allowed
          whitespace-nowrap
          ${className}
        `}
      >
        {translating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Çevriliyor...
          </>
        ) : (
          <>
            <Languages className="w-4 h-4 mr-2" />
            {buttonText || defaultButtonText}
          </>
        )}
      </Button>
      {error && (
        <div className={`
          absolute top-full mt-1 left-0 right-0 text-xs px-2 py-1 rounded z-10
          ${error.startsWith('✅') ? 'bg-green-900/80 text-green-200' : 'bg-red-900/80 text-red-200'}
        `}>
          {error}
        </div>
      )}
    </div>
  )
}

