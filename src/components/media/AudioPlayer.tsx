'use client'

import React from 'react'
import { useState, useRef } from 'react'
import ReactPlayer from 'react-player'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Download,
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/utils/formatters'

interface AudioPlayerProps {
  url: string
  title: string
  description?: string
  thumbnail?: string
  uploader?: {
    name: string
    avatar?: string
  }
  duration?: number
  episode?: number
  season?: number
  className?: string
  variant?: 'default' | 'compact' | 'mini'
}

export function AudioPlayer({ 
  url, 
  title,
  description,
  thumbnail, 
  uploader,
  duration,
  episode,
  season,
  className,
  variant = 'default'
}: AudioPlayerProps) {
  const ReactPlayerAny = ReactPlayer as unknown as React.ComponentType<any>
  const [playing, setPlaying] = useState(false)
  const [played, setPlayed] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  
  // @ts-ignore - ReactPlayer ref typing issues
  const playerRef = useRef<any>(null)

  const handlePlayPause = () => {
    setPlaying(!playing)
  }

  const handleSeek = (value: number) => {
    setPlayed(value)
    if (playerRef.current) {
      playerRef.current.seekTo(value, 'fraction')
    }
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    setMuted(false)
  }

  const handleMute = () => {
    setMuted(!muted)
  }

  const handleSkip = (seconds: number) => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime()
      const newTime = Math.max(0, Math.min(currentTime + seconds, playerRef.current.getDuration() || 0))
      playerRef.current.seekTo(newTime, 'seconds')
    }
  }

  const playedSeconds = played * (duration || 0)
  const remainingSeconds = (duration || 0) - playedSeconds

  if (variant === 'mini') {
    return (
      <Card className={cn('glass-card border-airen-neon-blue/30', className)}>
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            {thumbnail && (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={thumbnail}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white truncate">
                {title}
              </h4>
              <p className="text-xs text-gray-400 truncate">
                {uploader?.name}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                className="h-8 w-8 p-0 text-airen-neon-blue hover:bg-airen-neon-blue/20"
              >
                {playing ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Mini Progress Bar */}
          <div className="mt-2">
            <div className="relative">
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-airen-neon-blue rounded-full transition-all"
                  style={{ width: `${played * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hidden Player */}
          <div className="hidden">
          <ReactPlayerAny
              ref={playerRef}
              url={url}
              playing={playing}
              volume={muted ? 0 : volume}
              onProgress={(progress: any) => {
                setPlayed(progress.played)
                setLoaded(progress.loaded)
              }}
              onReady={() => setIsReady(true)}
              onEnded={() => setPlaying(false)}
              width="0"
              height="0"
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('glass-card', className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {thumbnail && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={thumbnail}
                  alt={title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={handlePlayPause}
                    className="h-8 w-8 rounded-full p-0"
                  >
                    {playing ? (
                      <Pause className="h-4 w-4 text-white" />
                    ) : (
                      <Play className="h-4 w-4 text-white ml-0.5" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white line-clamp-1 mb-1">
                {title}
              </h3>
              {uploader && (
                <p className="text-sm text-gray-400 mb-2">
                  {uploader.name}
                </p>
              )}
              
              {/* Progress */}
              <div className="space-y-1">
                <div className="relative">
                  <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-airen-neon-blue rounded-full transition-all"
                      style={{ width: `${played * 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={played}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{formatDuration(playedSeconds)}</span>
                  <span>-{formatDuration(remainingSeconds)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hidden Player */}
          <div className="hidden">
          <ReactPlayerAny
              ref={playerRef}
              url={url}
              playing={playing}
              volume={muted ? 0 : volume}
              onProgress={(progress: any) => {
                setPlayed(progress.played)
                setLoaded(progress.loaded)
              }}
              onReady={() => setIsReady(true)}
              onEnded={() => setPlaying(false)}
              width="0"
              height="0"
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant - Full Player
  return (
    <Card className={cn('glass-card overflow-hidden', className)}>
      {/* Album Art / Thumbnail */}
      {thumbnail && (
        <div className="relative h-64 md:h-80">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Episode/Season Info */}
          {(episode || season) && (
            <div className="absolute top-4 left-4">
              <Badge variant="glass" className="bg-black/60 backdrop-blur text-white">
                {season && `S${season}`}{episode && `E${episode}`}
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardContent className="p-6">
        {/* Track Info */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-gray-300 mb-3 line-clamp-2">
              {description}
            </p>
          )}
          {uploader && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={uploader.avatar} />
                <AvatarFallback className="bg-airen-dark-2 text-airen-neon-blue text-sm">
                  {uploader.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-airen-neon-blue font-medium">
                {uploader.name}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/40 rounded-full"
                style={{ width: `${loaded * 100}%` }}
              />
              <div 
                className="absolute top-0 h-full bg-airen-neon-blue rounded-full transition-all"
                style={{ width: `${played * 100}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={played}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          
          {/* Time Display */}
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>{formatDuration(playedSeconds)}</span>
            <span>-{formatDuration(remainingSeconds)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRepeat(!repeat)}
            className={cn(
              'text-gray-400 hover:text-white',
              repeat && 'text-airen-neon-blue'
            )}
          >
            <Repeat className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSkip(-15)}
            className="text-white hover:text-airen-neon-blue"
          >
            <SkipBack className="h-6 w-6" />
          </Button>

          <Button
            variant="neon"
            size="lg"
            onClick={handlePlayPause}
            className="h-14 w-14 rounded-full p-0"
            disabled={!isReady}
          >
            {playing ? (
              <Pause className="h-7 w-7" />
            ) : (
              <Play className="h-7 w-7 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSkip(15)}
            className="text-white hover:text-airen-neon-blue"
          >
            <SkipForward className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Shuffle className="h-5 w-5" />
          </Button>
        </div>

        {/* Volume and Additional Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMute}
              onMouseEnter={() => setShowVolumeControl(true)}
              className="text-gray-400 hover:text-white"
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            
            {showVolumeControl && (
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Hidden Player */}
        <div className="hidden">
          <ReactPlayerAny
            ref={playerRef}
            url={url}
            playing={playing}
            volume={muted ? 0 : volume}
            onProgress={(progress: any) => {
              setPlayed(progress.played)
              setLoaded(progress.loaded)
            }}
            onReady={() => setIsReady(true)}
            onEnded={() => setPlaying(false)}
            width="0"
            height="0"
            loop={repeat}
          />
        </div>
      </CardContent>
    </Card>
  )
}
