'use client'

import { useState, useRef, useEffect } from 'react'
import ReactPlayer from 'react-player'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  RotateCcw,
  RotateCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/utils/formatters'

interface VideoPlayerProps {
  url: string
  thumbnail?: string
  title?: string
  duration?: number
  className?: string
  autoplay?: boolean
}

export function VideoPlayer({ 
  url, 
  thumbnail, 
  title, 
  duration,
  className,
  autoplay = false 
}: VideoPlayerProps) {
  const ReactPlayerAny = ReactPlayer as unknown as React.ComponentType<any>
  const [playing, setPlaying] = useState(autoplay)
  const [played, setPlayed] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isReady, setIsReady] = useState(false)
  
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (playing) {
          setShowControls(false)
        }
      }, 3000)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current)
        }
      }
    }
  }, [playing])

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

  const handleFullscreen = () => {
    if (!fullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const handleSkip = (seconds: number) => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime ? playerRef.current.getCurrentTime() : 0
      const duration = playerRef.current.getDuration ? playerRef.current.getDuration() : 0
      const newTime = Math.max(0, Math.min(currentTime + seconds, duration))
      playerRef.current.seekTo(newTime, 'seconds')
    }
  }

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const playedSeconds = played * (duration || 0)
  // const loadedSeconds = loaded * (duration || 0) // Unused for now

  return (
    <Card 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-black group',
        fullscreen ? 'fixed inset-0 z-50' : 'rounded-xl',
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !playing || setShowControls(false)}
    >
      {/* Video Player */}
      <div className="relative aspect-video w-full h-full">
        <ReactPlayerAny
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={playing}
          volume={muted ? 0 : volume}
          onProgress={(progress: { played: number; loaded: number }) => {
            setPlayed(progress.played)
            setLoaded(progress.loaded)
          }}
          onReady={() => setIsReady(true)}
          onEnded={() => setPlaying(false)}
          light={thumbnail}
          config={{
            youtube: {
              playerVars: {
                controls: 0,
                modestbranding: 1
              }
            }
          }}
          style={{ 
            background: 'black',
          }}
        />

        {/* Loading State */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin w-12 h-12 border-4 border-airen-neon-blue border-t-transparent rounded-full" />
          </div>
        )}

        {/* Center Play Button */}
        {!playing && isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="glass"
              size="lg"
              className="h-20 w-20 rounded-full p-0 hover:scale-110 transition-transform"
              onClick={handlePlayPause}
            >
              <Play className="h-10 w-10 text-white ml-2" />
            </Button>
          </div>
        )}

        {/* Video Controls Overlay */}
        <div 
          className={cn(
            'absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300',
            showControls && isReady ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Title */}
          {title && (
            <div className="mb-4">
              <h3 className="text-white font-semibold text-lg drop-shadow-lg">
                {title}
              </h3>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="relative">
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/50 rounded-full"
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
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                className="text-white hover:text-airen-neon-blue hover:bg-white/20"
              >
                {playing ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              {/* Skip Controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSkip(-10)}
                className="text-white hover:text-airen-neon-blue hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="ml-1 text-xs">10s</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSkip(10)}
                className="text-white hover:text-airen-neon-blue hover:bg-white/20"
              >
                <RotateCw className="h-4 w-4" />
                <span className="ml-1 text-xs">10s</span>
              </Button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMute}
                  className="text-white hover:text-airen-neon-blue hover:bg-white/20"
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
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

              {/* Time Display */}
              <div className="text-sm text-white/80 font-mono">
                {formatDuration(playedSeconds)} / {formatDuration(duration || 0)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Quality Badge */}
              <Badge variant="glass" className="bg-white/20 text-white text-xs">
                HD
              </Badge>

              {/* Settings */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-airen-neon-blue hover:bg-white/20"
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullscreen}
                className="text-white hover:text-airen-neon-blue hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
