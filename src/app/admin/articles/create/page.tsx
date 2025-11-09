'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TranslateButton } from '@/components/admin/TranslateButton'

export default function AdminArticleCreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentLang, setCurrentLang] = useState<'tr' | 'en' | 'ru'>('tr')
  const [defaultLanguage, setDefaultLanguage] = useState<'tr' | 'en' | 'ru'>('tr')
  
  // Multilingual content
  const [translations, setTranslations] = useState<{
    tr: { title: string; content: string; excerpt: string }
    en: { title: string; content: string; excerpt: string }
    ru: { title: string; content: string; excerpt: string }
  }>({
    tr: { title: '', content: '', excerpt: '' },
    en: { title: '', content: '', excerpt: '' },
    ru: { title: '', content: '', excerpt: '' }
  })
  
  const [featuredImage, setFeaturedImage] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Helper functions to update translations
  const updateTranslation = (lang: 'tr' | 'en' | 'ru', field: 'title' | 'content' | 'excerpt', value: string) => {
    setTranslations(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value
      }
    }))
  }

  const currentContent = translations[currentLang]

  const submit = async () => {
    setLoading(true)
    setMessage(null)
    try {
      // Use default language as the primary content
      const defaultContent = translations[defaultLanguage]
      
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: defaultContent.title,
          content: defaultContent.content,
          excerpt: defaultContent.excerpt || undefined,
          featured_image: featuredImage || undefined,
          type: 'article',
          status: 'published',
          translations: translations,
          default_language: defaultLanguage,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Hata')
      setMessage({ text: 'Makale başarıyla yayınlandı!', type: 'success' })
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push('/admin/articles')
        router.refresh()
      }, 1500)
    } catch (e: any) {
      setMessage({ text: `Hata: ${e.message}`, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const wordCount = currentContent.content.trim().split(/\s+/).filter(Boolean).length
  const charCount = currentContent.content.length
  
  // Check if current language has content
  const hasContent = (lang: 'tr' | 'en' | 'ru') => {
    return translations[lang].title.trim() !== '' || translations[lang].content.trim() !== ''
  }
  
  // Check if default language has required content
  const canSubmit = translations[defaultLanguage].title.trim() !== '' && translations[defaultLanguage].content.trim() !== ''

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link href="/admin/articles">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Yeni Makale</h1>
            <p className="text-xs text-gray-500">Makale ekle</p>
          </div>
        </div>
        <Button 
          onClick={submit} 
          disabled={loading || !canSubmit}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {loading ? 'Yayınlanıyor...' : 'Yayınla'}
        </Button>
      </div>

      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300 ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
          {message.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language Selector */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center text-sm font-semibold text-purple-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Dil Seçimi
              </label>
              <div className="text-xs text-purple-600">
                Ana Dil: <strong>{defaultLanguage.toUpperCase()}</strong>
              </div>
            </div>
            
            <div className="flex gap-2 mb-4">
              {(['tr', 'en', 'ru'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCurrentLang(lang)}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    currentLang === lang
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">
                      {lang === 'tr' ? '🇹🇷' : lang === 'en' ? '🇬🇧' : '🇷🇺'}
                    </span>
                    <span>{lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : 'Русский'}</span>
                    {hasContent(lang) && (
                      <span className="ml-1 w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setDefaultLanguage('tr')}
                className={`px-3 py-1 rounded ${defaultLanguage === 'tr' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                Ana Dil: TR
              </button>
              <button
                onClick={() => setDefaultLanguage('en')}
                className={`px-3 py-1 rounded ${defaultLanguage === 'en' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                Ana Dil: EN
              </button>
              <button
                onClick={() => setDefaultLanguage('ru')}
                className={`px-3 py-1 rounded ${defaultLanguage === 'ru' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                Ana Dil: RU
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 Ana dil varsayılan gösterim dilidir. Çeviri yoksa ana dil gösterilir.
            </p>
          </div>

          {/* Title Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Başlık ({currentLang.toUpperCase()}) {currentLang === defaultLanguage && '*'}
              </label>
              {currentContent.title.trim() && (
                <TranslateButton
                  text={currentContent.title}
                  field="title"
                  sourceLang={currentLang}
                  targetLangs={(['tr', 'en', 'ru'] as const).filter(lang => lang !== currentLang)}
                  onTranslated={(translations) => {
                    Object.entries(translations).forEach(([lang, text]) => {
                      updateTranslation(lang as 'tr' | 'en' | 'ru', 'title', text)
                    })
                  }}
                  className="text-xs h-8"
                />
              )}
            </div>
            <Input 
              value={currentContent.title} 
              onChange={e => updateTranslation(currentLang, 'title', e.target.value)} 
              placeholder={`Makale başlığını ${currentLang === 'tr' ? 'Türkçe' : currentLang === 'en' ? 'İngilizce' : 'Rusça'} yazın...`} 
              className="text-lg font-semibold h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">{currentContent.title.length}/100 karakter</p>
          </div>

          {/* Excerpt Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Kısa Özet ({currentLang.toUpperCase()})
              </label>
              {currentContent.excerpt.trim() && (
                <TranslateButton
                  text={currentContent.excerpt}
                  field="excerpt"
                  sourceLang={currentLang}
                  targetLangs={(['tr', 'en', 'ru'] as const).filter(lang => lang !== currentLang)}
                  onTranslated={(translations) => {
                    Object.entries(translations).forEach(([lang, text]) => {
                      updateTranslation(lang as 'tr' | 'en' | 'ru', 'excerpt', text)
                    })
                  }}
                  className="text-xs h-8"
                />
              )}
            </div>
            <Input 
              value={currentContent.excerpt} 
              onChange={e => updateTranslation(currentLang, 'excerpt', e.target.value)} 
              placeholder={`Makale özetini ${currentLang === 'tr' ? 'Türkçe' : currentLang === 'en' ? 'İngilizce' : 'Rusça'} yazın`} 
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">Bu özet, makale kartlarında görünecek</p>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Makale İçeriği ({currentLang.toUpperCase()}) {currentLang === defaultLanguage && '*'}
              </label>
              {currentContent.content.trim() && (
                <TranslateButton
                  text={currentContent.content}
                  field="content"
                  sourceLang={currentLang}
                  targetLangs={(['tr', 'en', 'ru'] as const).filter(lang => lang !== currentLang)}
                  onTranslated={(translations) => {
                    Object.entries(translations).forEach(([lang, text]) => {
                      updateTranslation(lang as 'tr' | 'en' | 'ru', 'content', text)
                    })
                  }}
                  className="text-xs h-8"
                />
              )}
            </div>
            <Textarea 
              value={currentContent.content} 
              onChange={e => updateTranslation(currentLang, 'content', e.target.value)} 
              rows={16} 
              placeholder={`Makale içeriğini ${currentLang === 'tr' ? 'Türkçe' : currentLang === 'en' ? 'İngilizce' : 'Rusça'} yazın...`} 
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {wordCount} kelime • {charCount} karakter
              </p>
              {currentContent.content.length > 0 && (
                <Badge variant={currentContent.content.length > 500 ? 'default' : 'outline'} className="text-xs">
                  {currentContent.content.length > 500 ? '✓ Yeterli' : '⚠ Çok kısa'}
                </Badge>
              )}
            </div>
          </div>

          {/* Featured Image Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Kapak Görseli
            </label>
            <Input 
              value={featuredImage} 
              onChange={e => setFeaturedImage(e.target.value)} 
              placeholder="Görsel URL'si girin..." 
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">İstatistikler</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Kelime</span>
                <span className="text-sm font-semibold text-gray-900">{wordCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Karakter</span>
                <span className="text-sm font-semibold text-gray-900">{charCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Görsel</span>
                <span className="text-sm font-semibold text-gray-900">{featuredImage ? '✓' : '✗'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


