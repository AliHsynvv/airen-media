import { BaseEntity } from './global'
import { UserProfile } from './user'

export interface Comment extends BaseEntity {
  content: string
  user_id: string
  article_id: string
  parent_id: string | null
  
  // Engagement
  upvotes: number
  downvotes: number
  reply_count: number
  
  // Moderation
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  flagged_count: number
  moderator_id: string | null
  moderated_at: string | null
  
  // Relations
  user?: UserProfile
  replies?: Comment[]
  parent?: Comment
}

export interface CommentVote extends BaseEntity {
  comment_id: string
  user_id: string
  vote_type: 'upvote' | 'downvote'
}

export interface CreateCommentData {
  content: string
  article_id: string
  parent_id?: string
}

export interface UpdateCommentData {
  content?: string
  status?: 'pending' | 'approved' | 'rejected' | 'flagged'
}

export interface VoteCommentData {
  comment_id: string
  vote_type: 'upvote' | 'downvote'
}
