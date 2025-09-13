import HeygenEmbed from '@/components/interaction/HeygenEmbed'
import ChatInterface from '@/components/interaction/ChatInterface'
import SocialFeed from '@/components/interaction/SocialFeed'

export default function InteractionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Etkileşim</h1>
          <p className="text-gray-400 mt-1">Airen AI ile konuş, sosyal akışı gör.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HeygenEmbed />
        <ChatInterface />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-3">Sosyal Akış</h2>
        <SocialFeed />
      </div>
    </div>
  )
}


