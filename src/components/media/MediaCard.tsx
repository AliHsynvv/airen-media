import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Pause, 
  Video, 
  Headphones, 
  Eye, 
  Heart, 
  Clock, 
} from 'lucide-react'
import { formatDuration, formatNumber, formatRelativeTime } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'
import type { Media } from '@/types'

interface MediaCardProps {
  media: Media
  variant?: 'default' | 'featured' | 'compact' | 'list'
  isPlaying?: boolean
  onPlay?: () => void
  onPause?: () => void
  className?: string
}

export function MediaCard({ 
  media, 
  variant = 'default',
  isPlaying = false,
  onPlay,
  onPause,
  className 
}: MediaCardProps) {
  const {
    title,
    description,
    slug,
    type,
    category,
    thumbnail_url,
    duration,
    view_count,
    like_count,
    uploader,
    created_at,
  } = media

  const isVideo = type === 'video'
  // const isAudio = type === 'audio' // Unused for now

  const handlePlayPause = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isPlaying) {
      onPause?.()
    } else {
      onPlay?.()
    }
  }

  const getCategoryInfo = (cat: string) => {
    const categoryMap: Record<string, { color: string; label: string }> = {
      'vlog': { color: 'bg-airen-neon-blue', label: 'Vlog' },
      'cinematic': { color: 'bg-airen-neon-purple', label: 'Sinematik' },
      'food': { color: 'bg-airen-neon-green', label: 'Gastronomi' },
      'culture': { color: 'bg-red-500', label: 'Kültür' },
      'podcast': { color: 'bg-orange-500', label: 'Podcast' },
      'interview': { color: 'bg-purple-500', label: 'Röportaj' },
    }
    return categoryMap[cat] || { color: 'bg-gray-500', label: cat }
  }

  if (variant === 'featured') {
    return (
      <Card className={cn('glass-card airen-shadow-hover hover:airen-glow transition-all duration-500 group overflow-hidden', className)}>
        <div className="relative">
          {thumbnail_url && (
            <div className="relative h-64 lg:h-80 overflow-hidden">
              <Image
                src={thumbnail_url}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="glass"
                  size="lg"
                  className="h-16 w-16 rounded-full p-0 hover:scale-110 transition-transform"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-white" />
                  ) : (
                    <Play className="h-8 w-8 text-white ml-1" />
                  )}
                </Button>
              </div>

              {/* Duration Badge */}
              {duration && (
                <div className="absolute bottom-4 right-4">
                  <Badge variant="glass" className="bg-black/60 backdrop-blur text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(duration)}
                  </Badge>
                </div>
              )}

              {/* Type Icon */}
              <div className="absolute top-4 right-4">
                <Badge variant="glass" className="bg-black/60 backdrop-blur text-white">
                  {isVideo ? <Video className="h-3 w-3 mr-1" /> : <Headphones className="h-3 w-3 mr-1" />}
                  {isVideo ? 'Video' : 'Podcast'}
                </Badge>
              </div>

              {/* Category */}
              {category && (
                <div className="absolute top-4 left-4">
                  <Badge 
                    className={cn(
                      'text-white border-0',
                      getCategoryInfo(category).color
                    )}
                  >
                    {getCategoryInfo(category).label}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-white group-hover:text-airen-neon-blue transition-colors line-clamp-2 text-xl">
            <Link href={`/media/${isVideo ? 'videos' : 'podcasts'}/${slug}`}>
              {title}
            </Link>
          </CardTitle>
          
          {description && (
            <p className="text-gray-300 line-clamp-3 mt-2 leading-relaxed">
              {description}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            {uploader && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={uploader.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-airen-dark-2 text-airen-neon-blue">
                    {uploader.full_name?.charAt(0) || uploader.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white hover:text-airen-neon-blue transition-colors">
                    {uploader.full_name || uploader.username}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatRelativeTime(created_at)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{formatNumber(view_count, true)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{formatNumber(like_count, true)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('glass-card airen-shadow-hover hover:airen-glow transition-all duration-300 group', className)}>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            {thumbnail_url && (
              <div className="relative w-32 h-20 flex-shrink-0 overflow-hidden rounded-lg group">
                <Image
                  src={thumbnail_url}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="glass"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 text-white" />
                    ) : (
                      <Play className="h-4 w-4 text-white ml-0.5" />
                    )}
                  </Button>
                </div>

                {/* Duration */}
                {duration && (
                  <div className="absolute bottom-1 right-1">
                    <Badge variant="glass" className="text-xs bg-black/80 text-white px-1 py-0">
                      {formatDuration(duration)}
                    </Badge>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                {category && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      'text-xs text-white border-0',
                      getCategoryInfo(category).color
                    )}
                  >
                    {getCategoryInfo(category).label}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                  {isVideo ? 'Video' : 'Podcast'}
                </Badge>
              </div>
              
              <h3 className="text-sm font-semibold text-white group-hover:text-airen-neon-blue transition-colors line-clamp-2 mb-2">
                <Link href={`/media/${isVideo ? 'videos' : 'podcasts'}/${slug}`}>
                  {title}
                </Link>
              </h3>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-2">
                  <span>{formatNumber(view_count, true)} görüntülenme</span>
                </div>
                <span>{formatRelativeTime(created_at)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={cn('glass-card airen-shadow-hover hover:airen-glow transition-all duration-500 group overflow-hidden', className)}>
      {thumbnail_url && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={thumbnail_url}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="glass"
              size="lg"
              className="h-12 w-12 rounded-full p-0 hover:scale-110 transition-transform"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Play className="h-6 w-6 text-white ml-0.5" />
              )}
            </Button>
          </div>

          {/* Duration */}
          {duration && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="glass" className="bg-black/60 backdrop-blur text-white">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(duration)}
              </Badge>
            </div>
          )}

          {/* Category */}
          {category && (
            <div className="absolute top-3 left-3">
              <Badge 
                className={cn(
                  'text-white border-0',
                  getCategoryInfo(category).color
                )}
              >
                {getCategoryInfo(category).label}
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
            {isVideo ? (
              <>
                <Video className="h-3 w-3 mr-1" />
                Video
              </>
            ) : (
              <>
                <Headphones className="h-3 w-3 mr-1" />
                Podcast
              </>
            )}
          </Badge>
          
          <span className="text-xs text-gray-400">
            {formatRelativeTime(created_at)}
          </span>
        </div>
        
        <CardTitle className="text-white group-hover:text-airen-neon-blue transition-colors line-clamp-2">
          <Link href={`/media/${isVideo ? 'videos' : 'podcasts'}/${slug}`}>
            {title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          {uploader && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={uploader.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-airen-dark-2 text-airen-neon-blue">
                  {uploader.full_name?.charAt(0) || uploader.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-400 hover:text-airen-neon-blue transition-colors">
                {uploader.full_name || uploader.username}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-3 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{formatNumber(view_count, true)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>{formatNumber(like_count, true)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
