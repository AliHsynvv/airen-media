'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Bot, User, MapPin, Newspaper, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestions?: {
    type: 'countries' | 'news'
    items: any[]
  }
}

// Mesajı parse et ve güzel göster
function parseMessage(content: string) {
  const lines = content.split('\n').filter(line => line.trim())
  
  return lines.map((line, idx) => {
    // **text** -> bold (ülke adları gibi)
    const parts = line.split(/(\*\*.*?\*\*)/)
    
    return (
      <div key={idx} className={idx > 0 ? 'mt-2' : ''}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <span key={i} className="font-bold text-gray-900">
                {part.slice(2, -2)}
              </span>
            )
          }
          return <span key={i}>{part}</span>
        })}
      </div>
    )
  })
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim() || loading) return
    
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) throw new Error('Chat failed')

      const data = await response.json()
      
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        suggestions: data.suggestions
      }
      
      setMessages(prev => [...prev, assistantMsg])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.'
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2 border-gray-200 bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 p-3 sm:p-6 h-[500px] sm:h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 sm:pr-2 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            {/* Boş state - Müşteri temiz bir chatbot ile başlayacak */}
          </div>
        ) : (
          <>
            {messages.map(m => (
              <div key={m.id}>
                <div className={`flex gap-2 sm:gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 ${
                    m.role === 'user' 
                      ? 'bg-black border-black text-white' 
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}>
                    {m.role === 'user' ? <User className="w-3 h-3 sm:w-4 sm:h-4" /> : <Bot className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </div>
                  <div className={`max-w-[80%] sm:max-w-[75%] ${
                    m.role === 'user' ? '' : 'max-w-full'
                  }`}>
                    <div className={`p-3 sm:p-4 rounded-2xl ${
                      m.role === 'user' 
                        ? 'bg-black text-white rounded-tr-sm' 
                        : 'bg-gray-50 text-gray-700 rounded-tl-sm border-2 border-gray-200'
                    }`}>
                      {m.role === 'user' ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                      ) : (
                        <div className="text-sm leading-relaxed space-y-1">
                          {parseMessage(m.content)}
                        </div>
                      )}
                    </div>
                    
                    {/* Öneriler - Modern Kartlar */}
                    {m.suggestions && m.suggestions.items.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {m.suggestions.type === 'countries' && m.suggestions.items.map((country: any) => (
                          <Link
                            key={country.id}
                            href={`/countries/${country.slug}`}
                            className="block group"
                          >
                            <div className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden hover:border-black hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
                              {/* Featured Image */}
                              {country.featured_image && (
                                <div className="relative h-32 sm:h-40 overflow-hidden">
                                  <img 
                                    src={country.featured_image} 
                                    alt={country.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex items-center gap-2">
                                    <span className="text-3xl sm:text-4xl drop-shadow-lg">{country.flag_icon}</span>
                                  </div>
                                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                                    <div className="bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full">
                                      <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4 text-gray-900" />
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Content */}
                              <div className="p-3 sm:p-4">
                                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-black">
                                  {country.name}
                                </h4>
                                {country.best_time_to_visit && (
                                  <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    <span>En İyi Ziyaret: {country.best_time_to_visit}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                        
                        {m.suggestions.type === 'news' && m.suggestions.items.map((newsItem: any) => (
                          <Link
                            key={newsItem.id}
                            href={`/articles/${newsItem.slug}`}
                            className="block group"
                          >
                            <div className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden hover:border-black hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
                              {/* Featured Image */}
                              {newsItem.featured_image && (
                                <div className="relative h-24 sm:h-32 overflow-hidden">
                                  <img 
                                    src={newsItem.featured_image} 
                                    alt={newsItem.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                                    <div className="bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full">
                                      <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4 text-gray-900" />
                                    </div>
                                  </div>
                                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                                    <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                                      <Newspaper className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Content */}
                              <div className="p-3 sm:p-4">
                                <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-black line-clamp-2">
                                  {newsItem.title}
                                </h4>
                                {newsItem.excerpt && (
                                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                                    {newsItem.excerpt}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 bg-white border-gray-200 text-gray-700">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm border border-gray-200 p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs sm:text-sm text-gray-600">Düşünüyorum...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="mt-3 sm:mt-4 flex gap-1.5 sm:gap-2">
        <Input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="Örn: Benim için en uygun ülke hangisi?" 
          onKeyDown={e => e.key === 'Enter' && !loading && send()} 
          disabled={loading}
          className="border-2 border-gray-300 focus:border-black focus:ring-2 sm:focus:ring-4 focus:ring-gray-200 rounded-full px-4 sm:px-6 h-10 sm:h-12 text-sm disabled:opacity-50"
        />
        <Button 
          onClick={send} 
          disabled={loading || !input.trim()}
          className="h-10 sm:h-12 px-4 sm:px-6 rounded-full bg-black text-white hover:bg-gray-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </Button>
      </div>
    </Card>
  )
}


