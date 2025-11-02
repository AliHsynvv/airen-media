'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function MeetAirenButton({ className, fullWidth = false }: { className?: string; fullWidth?: boolean }) {
  const t = useTranslations('home.hero.meetAiren')

  return (
    <>
      <Link href="/interaction">
        <Button
          size="lg"
          className={cn(
            'h-12 rounded-full text-white font-semibold uppercase tracking-wide px-5 sm:px-6 shadow-lg',
            'bg-gradient-to-r from-[#141432] via-[#5b21b6] to-[#a21caf] hover:from-[#1a1a44] hover:via-[#6d28d9] hover:to-[#db2777]',
            'border-0',
            fullWidth ? 'w-full' : '',
            'transition-transform',
            className
          )}
          aria-label={t('dialogTitle')}
        >
        <span className="relative mr-3 inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 transition-transform duration-300 ease-out hover:scale-110">
          {/* Outer gradient moving left-to-right */}
          <span className="absolute inset-0 rounded-full overflow-hidden opacity-90">
            <span className="absolute inset-0 rounded-full ai-gradient" />
          </span>
          {/* Inner gradient moving right-to-left for depth */}
          <span className="absolute inset-[1px] rounded-full overflow-hidden mix-blend-screen opacity-80">
            <span className="absolute inset-0 rounded-full ai-gradient-rev" />
          </span>
          {/* Donut mask */}
          <span className="absolute inset-[3px] rounded-full bg-gradient-to-b from-[#0b1020] to-[#1a103d]" />
          {/* Orbiting particle around the core */}
          <span className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="relative h-5 w-5 animate-orbit">
              <span className="absolute left-1/2 top-0 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_2px_rgba(34,211,238,0.8)]" />
            </span>
          </span>
          {/* Pulsing core */}
          <span className="absolute inset-0 flex items-center justify-center z-0">
            <span className="h-1.5 w-1.5 rounded-full bg-white/90 animate-pulse" />
          </span>
        </span>
        {t('buttonLabel')}
      </Button>
      </Link>
      <style jsx>{`
        @keyframes gradient-x { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
        @keyframes gradient-x-rev { from { background-position: 100% 50%; } to { background-position: 0% 50%; } }
        @keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ai-gradient {
          background: linear-gradient(90deg, #00e5ff, #7c3aed, #ff1971, #00e5ff);
          background-size: 300% 200%;
          animation: gradient-x 2.4s linear infinite;
        }
        .ai-gradient-rev {
          background: linear-gradient(90deg, #ff1971, #00e5ff, #7c3aed, #ff1971);
          background-size: 300% 200%;
          animation: gradient-x-rev 4.2s linear infinite;
        }
        .animate-orbit {
          animation: orbit 3.2s linear infinite;
        }
      `}</style>
    </>
  )
}
