import { Card } from '@/components/ui/card'

interface SocialPost {
  id: string
  image: string
  caption: string
  url: string
}

const mockPosts: SocialPost[] = [
  { id: 'p1', image: '/images/media/istanbul.jpg', caption: 'İstanbul manzarası', url: '#' },
  { id: 'p2', image: '/images/media/paris.jpg', caption: 'Paris geceleri', url: '#' },
  { id: 'p3', image: '/images/media/tokyo.jpg', caption: 'Tokyo sokakları', url: '#' },
]

export default function SocialFeed() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {mockPosts.map(p => (
        <a key={p.id} href={p.url} target="_blank" rel="noreferrer">
          <Card className="glass-card overflow-hidden">
            <img src={p.image} alt={p.caption} className="w-full h-28 object-cover" />
            <div className="p-2 text-gray-300 text-xs line-clamp-2">{p.caption}</div>
          </Card>
        </a>
      ))}
    </div>
  )
}


