'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AutoScrollCarouselProps {
  children: React.ReactNode
  autoScrollInterval?: number
  className?: string
  gradientColor?: string
}

export default function AutoScrollCarousel({ 
  children, 
  autoScrollInterval = 3000,
  className = '',
  gradientColor = 'gray-50'
}: AutoScrollCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scrollToDirection = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.8
    const newScrollLeft = direction === 'left' 
      ? scrollRef.current.scrollLeft - scrollAmount
      : scrollRef.current.scrollLeft + scrollAmount
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    checkScrollButtons()

    const autoScroll = () => {
      if (isPaused || !scrollContainer) return
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer
      
      // If reached end, scroll back to start
      if (scrollLeft >= scrollWidth - clientWidth - 10) {
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        // Scroll by one card width
        const cardWidth = scrollContainer.querySelector('.carousel-item')?.clientWidth || 300
        scrollContainer.scrollBy({ left: cardWidth + 16, behavior: 'smooth' })
      }
    }

    const interval = setInterval(autoScroll, autoScrollInterval)

    scrollContainer.addEventListener('scroll', checkScrollButtons)

    return () => {
      clearInterval(interval)
      scrollContainer.removeEventListener('scroll', checkScrollButtons)
    }
  }, [isPaused, autoScrollInterval])

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scrollToDirection('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scrollToDirection('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>
      )}

      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide pb-4"
      >
        <div className="flex gap-3 sm:gap-4 min-w-full">
          {children}
        </div>
      </div>

      {/* Gradient Overlays */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(to right, ${gradientColor === 'white' ? 'rgb(255, 255, 255)' : 'rgb(249, 250, 251)'}, transparent)`
        }}
      />
      <div 
        className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(to left, ${gradientColor === 'white' ? 'rgb(255, 255, 255)' : 'rgb(249, 250, 251)'}, transparent)`
        }}
      />
    </div>
  )
}

