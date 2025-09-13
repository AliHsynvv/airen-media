import { BaseEntity } from './global'
import { UserProfile } from './user'
import { Tag } from './article'

export interface Media extends BaseEntity {
  title: string
  description: string | null
  slug: string
  type: 'video' | 'audio' | 'image' | 'document'
  category: string | null
  url: string
  thumbnail_url: string | null
  duration: number | null
  file_size: number | null
  mime_type: string | null
  upload_by: string | null
  status: 'active' | 'inactive' | 'processing'
  view_count: number
  like_count: number
  metadata: Record<string, unknown>
  seo_title: string | null
  seo_description: string | null
  
  // Relations
  uploader?: UserProfile
  tags?: Tag[]
}

export interface CreateMediaData {
  title: string
  description?: string
  slug?: string
  type: 'video' | 'audio' | 'image' | 'document'
  category?: string
  url: string
  thumbnail_url?: string
  duration?: number
  file_size?: number
  mime_type?: string
  metadata?: Record<string, unknown>
  seo_title?: string
  seo_description?: string
  tag_ids?: string[]
}
