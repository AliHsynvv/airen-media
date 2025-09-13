import { UserStory } from '@/types/story'

export const mockStories: UserStory[] = [
  {
    id: 'story-1',
    title: 'İstanbul’da 3 Gün: Gizli Hazineler',
    content: 'İstanbul’un tarihi sokaklarında kaybolduğum, yerel lezzetleri keşfettiğim harika bir 3 gün...'
      + '\n\nTaksim’den Karaköy’e, Üsküdar’dan Kuzguncuk’a kadar rota önerileri ve ipuçları.',
    image_url: null,
    image_alt: 'İstanbul Boğazı',
    location: 'İstanbul, Türkiye',
    country_id: 'tr',
    user_id: 'user-1',
    category: 'culture',
    tags: ['kultur', 'yemek', 'rota'],
    likes_count: 128,
    view_count: 2300,
    status: 'approved',
    moderator_id: null,
    moderated_at: null,
    featured_at: null,
    slug: 'istanbulda-3-gun-gizli-hazineler',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'story-2',
    title: 'Tokyo Street Food Macerası',
    content: 'Tokyo’da gece pazarlarında en iyi ramen ve takoyaki durakları. Bütçe dostu öneriler ve ulaşım ipuçları.',
    image_url: null,
    image_alt: 'Tokyo Street Food',
    location: 'Tokyo, Japonya',
    country_id: 'jp',
    user_id: 'user-2',
    category: 'gastronomy',
    tags: ['yemek', 'gece-pazari', 'ramen'],
    likes_count: 89,
    view_count: 1504,
    status: 'approved',
    moderator_id: null,
    moderated_at: null,
    featured_at: null,
    slug: 'tokyo-street-food-macerasi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]


