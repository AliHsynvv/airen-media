"use client"
import dynamic from 'next/dynamic'
import { MessageCircle, Video, Grid3x3, Sparkles } from 'lucide-react'
const HeygenEmbed = dynamic(() => import('@/components/interaction/HeygenEmbed'), { ssr: false })
const ChatInterface = dynamic(() => import('@/components/interaction/ChatInterface'), { ssr: false })
const SocialFeed = dynamic(() => import('@/components/interaction/SocialFeed'))
const NewsMarquee = dynamic(() => import('@/components/interaction/NewsMarquee'))

export default function InteractionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* News Marquee - Üstte animasyonlu haberler */}
      <NewsMarquee />
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {/* Modern Header */}
        <div className="mb-6 sm:mb-10 lg:mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4 rounded-full bg-black text-white border border-gray-900">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider">AI Etkileşim</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3 sm:mb-6 text-black">
              Etkileşim
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-8 px-4">
              Airen AI ile konuş, sosyal akışı gör ve seyahat deneyimini kişiselleştir
            </p>
          </div>
        </div>

        {/* AI Chat & Avatar Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="group">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black text-white">
                <Video className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">AI Avatar</h2>
            </div>
            <HeygenEmbed />
          </div>
          
          <div className="group">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black text-white">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">AI Sohbet</h2>
            </div>
            <ChatInterface />
          </div>
        </div>

        {/* Social Feed Section */}
        <div className="mt-8 sm:mt-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="h-6 sm:h-8 w-1 sm:w-1.5 bg-black rounded-full"></div>
            <div className="flex items-center gap-2 sm:gap-3">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">Sosyal Akış</h2>
              <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black text-white shadow-lg">
                <Grid3x3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
            </div>
          </div>
          <SocialFeed />
        </div>
      </div>
    </div>
  )
}


