import { BaseEntity } from './global'
import { UserProfile } from './user'

export interface Category extends BaseEntity {
  name: string
  slug: string
  description: string | null
  color: string | null
  icon: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
}

export interface Tag {
  id: string
  name: string
  slug: string
  color: string | null
  usage_count: number
  created_at: string
}

export interface Article extends BaseEntity {
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image: string | null
  image_alt: string | null
  category_id: string | null
  author_id: string
  status: 'draft' | 'published' | 'archived'
  type: 'article' | 'news' | 'guide'
  featured: boolean
  view_count: number
  reading_time: number | null
  meta_title: string | null
  meta_description: string | null
  published_at: string | null
  
  // Multi-language support
  translations?: any | null
  default_language?: 'tr' | 'en' | 'ru'
  
  // Relations
  category?: Category
  author?: UserProfile
  tags?: Tag[]
}

export interface CreateArticleData {
  title: string
  slug?: string
  excerpt?: string
  content: string
  featured_image?: string
  image_alt?: string
  category_id?: string
  type?: 'article' | 'news' | 'guide'
  featured?: boolean
  meta_title?: string
  meta_description?: string
  tag_ids?: string[]
}

export interface UpdateArticleData extends Partial<CreateArticleData> {
  status?: 'draft' | 'published' | 'archived'
}
