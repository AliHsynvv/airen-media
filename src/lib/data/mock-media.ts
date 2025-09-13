import type { Media } from '@/types'

// Mock uploader/author
const mockUploader = {
  id: 'airen-1',
  username: 'airen_global',
  full_name: 'Airen Global',
  avatar_url: null,
  bio: 'AI-powered travel content creator',
  location: 'Global',
  website: 'https://airen.app',
  social_links: {
    instagram: '@airen_app',
    youtube: '@airen_app',
  },
  role: 'admin' as const,
  status: 'active' as const,
  preferences: {},
  email_verified: true,
  last_seen: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Mock Video Data
export const mockVideos: Media[] = [
  {
    id: '1',
    title: 'Paris\'in Gizli Köşeleri: 4K Drone Çekimi',
    description: 'Airen ile Paris\'in turist rehberlerinde yer almayan muhteşem köşelerini keşfedin. Montmartre\'den Marais\'e kadar görsel şölen.',
    slug: 'paris-gizli-koseler-4k-drone',
    type: 'video',
    category: 'vlog',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=450&fit=crop',
    duration: 720, // 12 minutes
    file_size: 524288000, // ~500MB
    mime_type: 'video/mp4',
    upload_by: 'airen-1',
    uploader: mockUploader,
    status: 'active',
    view_count: 15420,
    like_count: 1250,
    metadata: {
      resolution: '4K',
      fps: 60,
      quality: 'Ultra HD',
      language: 'Turkish',
      subtitles: ['TR', 'EN']
    },
    seo_title: 'Paris Gizli Yerler 4K Video | Airen Vlog',
    seo_description: 'Paris\'in gizli köşelerini 4K drone çekimi ile keşfedin. Airen ile unutulmaz Paris deneyimi.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'İstanbul Boğazı: Sunset Timelapse',
    description: 'Boğaz\'da gün batımının büyülü anları. İstanbul\'un en güzel manzaralarından biri olan Boğaz köprüleri ve silueti.',
    slug: 'istanbul-bogaz-sunset-timelapse',
    type: 'video',
    category: 'cinematic',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&h=450&fit=crop',
    duration: 180, // 3 minutes
    file_size: 157286400, // ~150MB
    mime_type: 'video/mp4',
    upload_by: 'airen-1',
    uploader: mockUploader,
    status: 'active',
    view_count: 8750,
    like_count: 890,
    metadata: {
      resolution: '4K',
      fps: 24,
      quality: 'Ultra HD',
      technique: 'Timelapse',
      location: 'Istanbul, Turkey'
    },
    seo_title: 'İstanbul Boğazı Timelapse Video | Sunset',
    seo_description: 'İstanbul Boğazı\'nda büyülü gün batımı timelapse çekimi.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Tokyo Street Food Rehberi: 10 Must-Try',
    description: 'Tokyo sokaklarındaki en lezzetli street food deneyimleri. Airen ile Japonya mutfağının sırlarını keşfedin.',
    slug: 'tokyo-street-food-rehberi',
    type: 'video',
    category: 'food',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=450&fit=crop',
    duration: 960, // 16 minutes
    file_size: 683671552, // ~650MB
    mime_type: 'video/mp4',
    upload_by: 'airen-1',
    uploader: mockUploader,
    status: 'active',
    view_count: 23150,
    like_count: 2100,
    metadata: {
      resolution: '1080p',
      fps: 30,
      quality: 'Full HD',
      language: 'Turkish',
      genre: 'Food & Travel'
    },
    seo_title: 'Tokyo Street Food Rehberi | En İyi 10 Lezzet',
    seo_description: 'Tokyo\'nun en iyi street food deneyimleri. Japon mutfağı rehberi.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Bali Tapınak Turu: Spiritual Journey',
    description: 'Bali\'nin mistik tapınaklarında ruhani bir yolculuk. Hinduizm ve Bali kültürünün derin bağlantısı.',
    slug: 'bali-tapinaklar-spiritual-journey',
    type: 'video',
    category: 'culture',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=450&fit=crop',
    duration: 840, // 14 minutes
    file_size: 604661760, // ~576MB
    mime_type: 'video/mp4',
    upload_by: 'airen-1',
    uploader: mockUploader,
    status: 'active',
    view_count: 12890,
    like_count: 1580,
    metadata: {
      resolution: '4K',
      fps: 24,
      quality: 'Ultra HD',
      theme: 'Cultural & Spiritual',
      location: 'Bali, Indonesia'
    },
    seo_title: 'Bali Tapınak Turu | Spiritual Journey Video',
    seo_description: 'Bali\'nin mistik tapınaklarında ruhani yolculuk deneyimi.',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock Podcast Data
export const mockPodcasts: Media[] = [
  {
    id: '5',
    title: 'Airen Talks #1: Seyahat Trendleri 2024',
    description: 'Post-pandemi döneminde değişen seyahat trendleri üzerine derin analiz. Sürdürülebilir turizm, dijital nomadlar ve yeni destinasyonlar.',
    slug: 'airen-talks-1-seyahat-trendleri-2024',
    type: 'audio',
    category: 'podcast',
    url: 'https://example.com/podcast/airen-talks-1.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=800&fit=crop',
    duration: 2700, // 45 minutes
    file_size: 64800000, // ~62MB
    mime_type: 'audio/mpeg',
    upload_by: 'airen-1',
    uploader: mockUploader,
    status: 'active',
    view_count: 8950,
    like_count: 750,
    metadata: {
      bitrate: '192kbps',
      quality: 'High Quality',
      language: 'Turkish',
      episode: 1,
      season: 1,
      transcript_available: true
    },
    seo_title: 'Airen Talks #1: Seyahat Trendleri 2024 Podcast',
    seo_description: '2024 yılının öne çıkan seyahat trendleri üzerine detaylı podcast.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    title: 'Airen Talks #2: Dijital Nomad Yaşamı',
    description: 'Uzaktan çalışarak dünyayı gezmek mümkün mü? Dijital nomad lifestyle, en iyi destinasyonlar ve pratik ipuçları.',
    slug: 'airen-talks-2-dijital-nomad-yasami',
    type: 'audio',
    category: 'podcast',
    url: 'https://example.com/podcast/airen-talks-2.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop',
    duration: 3300, // 55 minutes
    file_size: 79200000, // ~75.5MB
    mime_type: 'audio/mpeg',
    upload_by: 'airen-1',
    uploader: mockUploader,
    status: 'active',
    view_count: 6750,
    like_count: 620,
    metadata: {
      bitrate: '192kbps',
      quality: 'High Quality',
      language: 'Turkish',
      episode: 2,
      season: 1,
      guest: 'Digital Nomad Expert'
    },
    seo_title: 'Airen Talks #2: Dijital Nomad Yaşamı Podcast',
    seo_description: 'Uzaktan çalışarak seyahat etme rehberi. Dijital nomad lifestyle.',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    title: 'Airen Talks #3: Sürdürülebilir Turizm',
    description: 'Çevre dostu seyahat nasıl yapılır? Karbon ayak izi, yerel topluluklar ve sorumlu turizm üzerine görüşler.',
    slug: 'airen-talks-3-surdurulebilir-turizm',
    type: 'audio',
    category: 'podcast',
    url: 'https://example.com/podcast/airen-talks-3.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop',
    duration: 2850, // 47.5 minutes
    file_size: 68400000, // ~65.2MB
    mime_type: 'audio/mpeg',
    upload_by: 'airen-1',
    uploader: mockUploader,
    status: 'active',
    view_count: 5420,
    like_count: 480,
    metadata: {
      bitrate: '192kbps',
      quality: 'High Quality',
      language: 'Turkish',
      episode: 3,
      season: 1,
      topic: 'Sustainability & Environment'
    },
    seo_title: 'Airen Talks #3: Sürdürülebilir Turizm Podcast',
    seo_description: 'Çevre dostu seyahat rehberi. Sorumlu turizm üzerine podcast.',
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// All Media Combined
export const mockAllMedia: Media[] = [...mockVideos, ...mockPodcasts]

// Media Categories
export const mediaCategories = [
  { id: 'vlog', name: 'Airen Vlog', icon: '📹', color: '#00d4ff' },
  { id: 'cinematic', name: 'Sinematik', icon: '🎬', color: '#b855ff' },
  { id: 'food', name: 'Gastronomi', icon: '🍜', color: '#00ff88' },
  { id: 'culture', name: 'Kültür', icon: '🏛️', color: '#ff6b6b' },
  { id: 'podcast', name: 'Podcast', icon: '🎧', color: '#ffa500' },
  { id: 'interview', name: 'Röportaj', icon: '🎤', color: '#9c27b0' },
] as const

export type MediaCategoryId = typeof mediaCategories[number]['id']
