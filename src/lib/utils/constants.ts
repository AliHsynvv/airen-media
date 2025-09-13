export const SITE_CONFIG = {
  name: 'Airen.app',
  description: 'Turizm Yapay Zekâ Influencer Sosyal Platformu',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/airen_app',
    instagram: 'https://instagram.com/airen_app',
    github: 'https://github.com/airen-app',
  },
}

export const API_ROUTES = {
  ARTICLES: '/api/articles',
  COMMENTS: '/api/comments',
  MEDIA: '/api/media',
  COUNTRIES: '/api/countries',
  STORIES: '/api/stories',
  SOCIAL: '/api/social',
  AUTH: '/api/auth',
} as const

export const ROUTES = {
  HOME: '/',
  NEWS: '/news',
  ARTICLES: '/articles',
  MEDIA: '/media',
  COUNTRIES: '/countries',
  COMMUNITY: '/community',
  INTERACTION: '/interaction',
  ABOUT: '/about',
  CONTACT: '/contact',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    CALLBACK: '/auth/callback',
  },
  PROFILE: '/profile',
  ADMIN: '/admin',
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
} as const

export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav'],
} as const

export const CONTENT_CATEGORIES = {
  ARTICLES: [
    'travel-guide',
    'culture',
    'food',
    'adventure',
    'luxury',
    'budget',
    'solo',
    'family',
  ],
  MEDIA: [
    'vlog',
    'podcast',
    'interview',
    'tutorial',
    'documentary',
  ],
  STORIES: [
    'gastronomy',
    'culture',
    'adventure',
    'budget',
    'luxury',
  ],
} as const
