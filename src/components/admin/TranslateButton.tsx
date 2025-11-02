'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Languages, Loader2 } from 'lucide-react'

interface TranslateButtonProps {
  text: string
  field: string
  onTranslated: (translations: { tr: string; ru: string }) => void
  className?: string
}

export function TranslateButton({ text, field, onTranslated, className }: TranslateButtonProps) {
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
      // Türkçe ve Rusça çevirileri paralel olarak al
      const [trResponse, ruResponse] = await Promise.all([
        fetch('/api/admin/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            sourceLang: 'en',
            targetLang: 'tr',
            field
          })
        }),
        fetch('/api/admin/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            sourceLang: 'en',
            targetLang: 'ru',
            field
          })
        })
      ])

      const [trData, ruData] = await Promise.all([
        trResponse.json(),
        ruResponse.json()
      ])

      if (!trData.success || !ruData.success) {
        throw new Error(trData.error || ruData.error || 'Çeviri başarısız')
      }

      onTranslated({
        tr: trData.translation,
        ru: ruData.translation
      })

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
            TR & RU'ya Çevir
          </>
        )}
      </Button>
      {error && (
        <div className={`
          absolute top-full mt-1 left-0 right-0 text-xs px-2 py-1 rounded
          ${error.startsWith('✅') ? 'bg-green-900/80 text-green-200' : 'bg-red-900/80 text-red-200'}
        `}>
          {error}
        </div>
      )}
    </div>
  )
}

