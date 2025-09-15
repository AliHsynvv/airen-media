import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye, Calendar, Heart, MessageSquare } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/formatters'
import type { Article } from '@/types'
import ArticleCardActions from '@/components/articles/ArticleCardActions'
import CardActions from '@/components/common/CardActions'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'featured' | 'compact'
  className?: string
  theme?: 'dark' | 'light'
}

export function ArticleCard({ 
  article, 
  variant = 'default',
  className,
  theme = 'dark'
}: ArticleCardProps) {
  const {
    title,
    slug,
    excerpt,
    featured_image,
    category,
    author,
    published_at,
    reading_time,
    view_count,
    type,
    // @ts-ignore - extended by API route
    article_likes,
    // @ts-ignore
    article_comments
  } = article
  // Extract counts from API extended fields if present
  const likeCount = Array.isArray((article as any).article_likes) ? (article as any).article_likes[0]?.count ?? 0 : 0
  const commentCount = Array.isArray((article as any).article_comments) ? (article as any).article_comments[0]?.count ?? 0 : 0

  if (variant === 'featured') {
    return (
      <Card className={`${theme === 'light' ? 'bg-white border border-gray-200' : 'glass-card airen-shadow-hover hover:airen-glow'} transition-all duration-500 group overflow-hidden ${className}`}>
        <div className="relative">
          {featured_image && (
            <div className="relative h-64 overflow-hidden">
              <Image
                src={featured_image}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            </div>
          )}
          
          {/* Category Badge */}
          {category && (
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="neon-button text-airen-neon-blue bg-black/60 backdrop-blur">
                {category.name}
              </Badge>
            </div>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-4 right-4">
            <Badge 
              variant={type === 'news' ? 'destructive' : 'default'}
              className="bg-black/60 backdrop-blur text-white border-white/20"
            >
              {type === 'news' ? 'Haber' : 'Makale'}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className={`${theme === 'light' ? 'text-gray-900' : 'text-white group-hover:text-airen-neon-blue'} transition-colors line-clamp-2`}>
            <Link href={`/articles/${slug}`} className="hover:underline">
              {title}
            </Link>
          </CardTitle>
          
          {excerpt && (
            <CardDescription className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-300'} line-clamp-3 mt-2`}>
              {excerpt}
            </CardDescription>
          )}
          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {article.tags.slice(0, 5).map((t) => (
                <Badge key={t.slug} variant="secondary" className={`${theme === 'light' ? 'bg-gray-100 border-gray-200 text-black' : 'bg-white/10 text-gray-200'}`}>#{t.name}</Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className={`flex items-center justify-between text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className="flex items-center space-x-4">
              {author && (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={author.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-airen-dark-2">
                      {author.full_name?.charAt(0) || author.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`${theme === 'light' ? 'text-gray-700' : ''} hover:text-airen-neon-blue transition-colors`}>
                    {author.full_name || author.username}
                  </span>
                </div>
              )}
              
              {published_at && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatRelativeTime(published_at)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {reading_time && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{reading_time} dk</span>
                </div>
              )}
              
              {view_count > 0 && (
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{view_count}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{likeCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{commentCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={`${theme === 'light' ? 'bg-white border border-gray-200' : 'glass-card airen-shadow-hover hover:airen-glow'} transition-all duration-500 group ${className}`}>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            {featured_image && (
              <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={featured_image}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                {category && (
                  <Badge variant="secondary" className="text-xs bg-airen-neon-blue/20 text-airen-neon-blue border-airen-neon-blue/30">
                    {category.name}
                  </Badge>
                )}
                <Badge 
                  variant={type === 'news' ? 'destructive' : 'default'}
                  className="text-xs"
                >
                  {type === 'news' ? 'Haber' : 'Makale'}
                </Badge>
              </div>
              
              <h3 className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white group-hover:text-airen-neon-blue'} transition-colors line-clamp-2 mb-2`}>
                <Link href={`/articles/${slug}`} className="hover:underline">
                  {title}
                </Link>
              </h3>
              {Array.isArray(article.tags) && article.tags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {article.tags.slice(0, 3).map((t) => (
                    <Badge key={t.slug} variant="secondary" className={`${theme === 'light' ? 'bg-gray-100 border-gray-200 text-black' : 'bg-white/10 text-gray-200'} text-[10px]`}>#{t.name}</Badge>
                  ))}
                </div>
              )}
              
              <div className={`flex items-center justify-between text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                {author && (
                  <span className={`truncate ${theme === 'light' ? 'text-gray-700' : ''}`}>{author.full_name || author.username}</span>
                )}
                {published_at && (
                  <span>{formatRelativeTime(published_at)}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={`${theme === 'light' ? 'bg-white border border-gray-200' : 'glass-card airen-shadow-hover hover:airen-glow'} transition-all duration-500 group overflow-hidden ${className}`}>
      {featured_image && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={featured_image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          
          {/* Category Badge */}
          {category && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="neon-button text-airen-neon-blue bg-black/60 backdrop-blur">
                {category.name}
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge 
            variant={type === 'news' ? 'destructive' : 'default'}
            className="text-xs"
          >
            {type === 'news' ? 'Haber' : 'Makale'}
          </Badge>
          
          {published_at && (
            <span className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
              {formatRelativeTime(published_at)}
            </span>
          )}
        </div>
        
        <CardTitle className={`${theme === 'light' ? 'text-gray-900' : 'text-white group-hover:text-airen-neon-blue'} transition-colors line-clamp-2`}>
          <Link href={`/articles/${slug}`} className="hover:underline">
            {title}
          </Link>
        </CardTitle>
        
        {excerpt && (
          <CardDescription className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-300'} line-clamp-2 mt-2`}>
            {excerpt}
          </CardDescription>
        )}
        {Array.isArray(article.tags) && article.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {article.tags.slice(0, 5).map((t) => (
              <Badge key={t.slug} variant="secondary" className={`${theme === 'light' ? 'bg-gray-100 border-gray-200 text-black' : 'bg-white/10 text-gray-200'}`}>#{t.name}</Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          {author && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={author.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-airen-dark-2">
                  {author.full_name?.charAt(0) || author.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'} hover:text-airen-neon-blue transition-colors`}>
                {author.full_name || author.username}
              </span>
            </div>
          )}

          <div className={`flex items-center space-x-3 text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
            {reading_time && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{reading_time} dk</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{view_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{likeCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span>{commentCount}</span>
              </div>
            </div>
            <ArticleCardActions articleId={article.id} articleTitle={title} initialViews={view_count} theme={theme} />
          </div>
        </div>
      </CardContent>
      {/* Unified actions bar at bottom - consistent across cards */}
      <CardActions views={view_count} comments={commentCount} />
    </Card>
  )
}
