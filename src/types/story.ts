import { BaseEntity } from './global'
import { UserProfile } from './user'
import { Country } from './country'

export interface UserStory extends BaseEntity {
  title: string
  content: string
  image_url: string | null
  image_alt: string | null
  location: string | null
  country_id: string | null
  user_id: string
  
  // Categorization
  category: string | null
  tags: string[]
  
  // Engagement
  likes_count: number
  view_count: number
  
  // Moderation
  status: 'pending' | 'approved' | 'rejected' | 'featured'
  moderator_id: string | null
  moderated_at: string | null
  featured_at: string | null
  
  // SEO
  slug: string | null
  
  // Relations
  user?: UserProfile
  country?: Country
}

export interface StoryLike extends BaseEntity {
  story_id: string
  user_id: string
}

export interface CreateStoryData {
  title: string
  content: string
  image_url?: string
  image_alt?: string
  location?: string
  country_id?: string
  category?: string
  tags?: string[]
}

export interface UpdateStoryData extends Partial<CreateStoryData> {
  status?: 'pending' | 'approved' | 'rejected' | 'featured'
}

export interface LikeStoryData {
  story_id: string
}
