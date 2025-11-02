'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye, Calendar, Heart, MessageSquare } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/formatters'
import type { Article } from '@/types'
import dynamic from 'next/dynamic'
const CardActions = dynamic(() => import('@/components/common/CardActions.lazy'))
import { useTranslations, useLocale } from 'next-intl'

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
  const t = useTranslations('news.article')
  const locale = useLocale()
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
    type
  } = article
  // Extract counts from API extended fields if present
  type Aggregate = { count?: number }
  const likeCount = Array.isArray((article as unknown as { article_likes?: Aggregate[] }).article_likes)
    ? ((article as unknown as { article_likes?: Aggregate[] }).article_likes?.[0]?.count ?? 0)
    : 0
  const commentCount = Array.isArray((article as unknown as { article_comments?: Aggregate[] }).article_comments)
    ? ((article as unknown as { article_comments?: Aggregate[] }).article_comments?.[0]?.count ?? 0)
    : 0

  if (variant === 'featured') {
    return (
      <Card className={`${theme === 'light' ? 'bg-white border-2 border-gray-100 shadow-xl hover:shadow-2xl' : 'glass-card airen-shadow-hover hover:airen-glow'} transition-all duration-500 group overflow-hidden rounded-2xl ${className}`}>
        <div className="relative">
          {featured_image && (
            <div className="relative h-80 lg:h-96 overflow-hidden rounded-3xl">
              <Image
                src={featured_image}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-all duration-500" />
            </div>
          )}
          
          {/* Category Badge */}
          {category && (
            <div className="absolute top-6 left-6">
              <Badge variant="secondary" className={`${theme === 'light' ? 'bg-white/95 backdrop-blur-sm text-indigo-600 border-0 shadow-lg font-semibold px-4 py-1.5' : 'neon-button text-airen-neon-blue bg-black/60 backdrop-blur'}`}>
                {category.name}
              </Badge>
            </div>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-6 right-6">
            <Badge 
              variant={type === 'news' ? 'destructive' : 'default'}
              className={`${theme === 'light' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-black/60 backdrop-blur text-white'} border-0 shadow-lg font-semibold px-4 py-1.5`}
            >
              {type === 'news' ? '📰 ' + t('news') : '📝 ' + t('article')}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-4 pt-6 px-6 lg:px-8">
          <CardTitle className={`${theme === 'light' ? 'text-gray-900 group-hover:text-indigo-600' : 'text-white group-hover:text-airen-neon-blue'} transition-colors line-clamp-2 text-2xl lg:text-3xl font-bold leading-tight`}>
            <Link href={`/articles/${slug}`} className="hover:underline">
              {title}
            </Link>
          </CardTitle>
          
          {excerpt && (
            <CardDescription className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-300'} line-clamp-3 mt-4 text-base lg:text-lg leading-relaxed`}>
              {excerpt}
            </CardDescription>
          )}
          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.slice(0, 5).map((t) => (
                <Badge key={t.slug} variant="secondary" className={`${theme === 'light' ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-white/10 text-gray-200'} px-3 py-1 font-medium transition-colors`}>#{t.name}</Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0 px-6 lg:px-8 pb-6">
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className="flex items-center space-x-4">
              {author && (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-9 w-9 ring-2 ring-gray-200">
                    <AvatarImage src={author.avatar_url || undefined} />
                    <AvatarFallback className="text-sm bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold">
                      {author.full_name?.charAt(0) || author.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`${theme === 'light' ? 'text-gray-900 font-semibold' : ''} hover:text-indigo-600 transition-colors`}>
                    {author.full_name || author.username}
                  </span>
                </div>
              )}
              
              {published_at && (
                <div className="flex items-center space-x-1.5 text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{formatRelativeTime(published_at, locale)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {reading_time && (
                <div className="flex items-center space-x-1.5 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{t('readingTime', { time: reading_time })}</span>
                </div>
              )}
              
              {view_count > 0 && (
                <div className="flex items-center space-x-1.5 text-gray-600">
                  <Eye className="h-4 w-4" />
                  <span className="font-semibold">{view_count.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center space-x-1.5 text-red-500">
                <Heart className="h-4 w-4" />
                <span className="font-semibold">{likeCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-blue-500">
                <MessageSquare className="h-4 w-4" />
                <span className="font-semibold">{commentCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={`${theme === 'light' ? 'bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl' : 'glass-card airen-shadow-hover hover:airen-glow'} transition-all duration-500 group rounded-2xl ${className}`}>
        <CardContent className="p-5 sm:p-6">
          <div className="flex space-x-4 sm:space-x-6">
            {featured_image && (
              <div className="relative w-32 sm:w-40 h-24 sm:h-28 flex-shrink-0 overflow-hidden rounded-2xl shadow-md">
                <Image
                  src={featured_image}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="160px"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            )}
            
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  {category && (
                    <Badge variant="secondary" className={`${theme === 'light' ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold' : 'bg-airen-neon-blue/20 text-airen-neon-blue border-airen-neon-blue/30'} text-xs px-2.5 py-0.5`}>
                      {category.name}
                    </Badge>
                  )}
                  <Badge 
                    variant={type === 'news' ? 'destructive' : 'default'}
                    className={`${theme === 'light' ? 'bg-red-500 text-white' : ''} text-xs px-2.5 py-0.5 font-semibold`}
                  >
                    {type === 'news' ? '📰' : '📝'}
                  </Badge>
                </div>
                
                <h3 className={`text-base sm:text-lg font-bold ${theme === 'light' ? 'text-gray-900 group-hover:text-indigo-600' : 'text-white group-hover:text-airen-neon-blue'} transition-colors line-clamp-2 mb-3 leading-snug`}>
                  <Link href={`/articles/${slug}`} className="hover:underline">
                    {title}
                  </Link>
                </h3>
                {Array.isArray(article.tags) && article.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {article.tags.slice(0, 3).map((t) => (
                      <Badge key={t.slug} variant="secondary" className={`${theme === 'light' ? 'bg-gray-100 border border-gray-200 text-gray-700' : 'bg-white/10 text-gray-200'} text-[11px] px-2 py-0.5 font-medium`}>#{t.name}</Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className={`flex items-center justify-between text-xs sm:text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                {author && (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6 ring-1 ring-gray-200">
                      <AvatarImage src={author.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold">
                        {author.full_name?.charAt(0) || author.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`truncate ${theme === 'light' ? 'text-gray-900 font-semibold' : ''}`}>{author.full_name || author.username}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  {published_at && (
                    <span className="font-medium text-gray-500">{formatRelativeTime(published_at, locale)}</span>
                  )}
                  {view_count > 0 && (
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Eye className="h-3.5 w-3.5" />
                      <span className="font-semibold">{view_count.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={`${theme === 'light' ? 'bg-white border-2 border-gray-100 shadow-lg hover:shadow-2xl' : 'glass-card airen-shadow-hover hover:airen-glow'} transition-all duration-500 group ${className} flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden`}>
      {featured_image && (
        <div className="relative h-60 sm:h-64 lg:h-72 overflow-hidden rounded-2xl sm:rounded-3xl">
          <Image
            src={featured_image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/50 transition-all duration-500" />
          
          {/* Category Badge */}
          {category && (
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
              <Badge variant="secondary" className={`${theme === 'light' ? 'bg-white/95 backdrop-blur-sm text-indigo-600 border-0 shadow-lg font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs' : 'neon-button text-airen-neon-blue bg-black/60 backdrop-blur'}`}>
                {category.name}
              </Badge>
            </div>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
            <Badge 
              variant={type === 'news' ? 'destructive' : 'default'}
              className={`${theme === 'light' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-black/60 backdrop-blur text-white'} border-0 shadow-lg font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs`}
            >
              {type === 'news' ? '📰' : '📝'}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-3 pt-4 sm:pt-5 px-4 sm:px-5">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          {published_at && (
            <div className="flex items-center space-x-1 sm:space-x-1.5 text-[11px] sm:text-xs text-gray-500">
              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="font-medium">{formatRelativeTime(published_at, locale)}</span>
            </div>
          )}
        </div>
        
        <CardTitle className={`${theme === 'light' ? 'text-gray-900 group-hover:text-indigo-600' : 'text-white group-hover:text-airen-neon-blue'} transition-colors line-clamp-2 text-lg sm:text-xl font-bold leading-tight mb-2 sm:mb-3`}>
          <Link href={`/articles/${slug}`} className="hover:underline">
            {title}
          </Link>
        </CardTitle>
        
        {excerpt && (
          <CardDescription className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-300'} line-clamp-2 text-xs sm:text-sm leading-relaxed`}>
            {excerpt}
          </CardDescription>
        )}
        {Array.isArray(article.tags) && article.tags.length > 0 && (
          <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-1.5">
            {article.tags.slice(0, 3).map((t) => (
              <Badge key={t.slug} variant="secondary" className={`${theme === 'light' ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-white/10 text-gray-200'} text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 font-medium transition-colors`}>#{t.name}</Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 px-4 sm:px-5 pb-3 sm:pb-4 mt-auto">
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 sm:pt-4">
          {author && (
            <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-gray-100 flex-shrink-0">
                <AvatarImage src={author.avatar_url || undefined} />
                <AvatarFallback className="text-[10px] sm:text-xs bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold">
                  {author.full_name?.charAt(0) || author.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className={`text-xs sm:text-sm ${theme === 'light' ? 'text-gray-900 font-semibold' : 'text-gray-400'} hover:text-indigo-600 transition-colors truncate`}>
                {author.full_name || author.username}
              </span>
            </div>
          )}

          <div className={`flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} flex-shrink-0`}>
            {reading_time && (
              <div className="flex items-center space-x-0.5 sm:space-x-1">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="font-medium hidden sm:inline">{reading_time} dk</span>
                <span className="font-medium sm:hidden">{reading_time}</span>
              </div>
            )}
            {view_count > 0 && (
              <div className="flex items-center space-x-0.5 sm:space-x-1">
                <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="font-semibold">{view_count > 999 ? `${(view_count / 1000).toFixed(1)}k` : view_count}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      {/* Unified actions bar at bottom - consistent across cards */}
      <CardActions
        articleId={article.id}
        articleSlug={slug}
        views={view_count}
        comments={commentCount}
        likes={likeCount}
        hideLabels={false}
      />
    </Card>
  )
}

export default ArticleCard
