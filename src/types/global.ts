export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export type Status = 'loading' | 'success' | 'error' | 'idle'

export interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
}
