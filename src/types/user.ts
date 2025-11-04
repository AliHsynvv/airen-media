import { BaseEntity } from './global'

export interface UserProfile extends BaseEntity {
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  website: string | null
  social_links: {
    instagram?: string
    twitter?: string
    youtube?: string
  }
  role: 'user' | 'admin' | 'moderator'
  status: 'active' | 'inactive' | 'banned'
  preferences: Record<string, unknown>
  email_verified: boolean
  last_seen: string | null
  account_type?: 'user' | 'business'
}

export interface AuthUser {
  id: string
  email?: string
  profile?: UserProfile
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  username: string
  full_name: string
}

export interface UpdateProfileData {
  username?: string
  full_name?: string
  bio?: string
  location?: string
  website?: string
  social_links?: {
    instagram?: string
    twitter?: string
    youtube?: string
  }
}
