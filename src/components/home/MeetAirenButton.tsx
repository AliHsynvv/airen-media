'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Play } from 'lucide-react'
import { usePathname } from 'next/navigation'
import ChatInterface from '@/components/interaction/ChatInterface'

export default function MeetAirenButton({ className, fullWidth = false }: { className?: string; fullWidth?: boolean }) {
  const [open, setOpen] = useState(false)
  const [started, setStarted] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    if (!open || !isHome) return
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')
    if (existing) return
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed'
    script.async = true
    script.type = 'text/javascript'
    document.body.appendChild(script)
  }, [open, isHome])

  const prompts = [
    "What's the best time to visit Italy?",
    'Recommend hidden gems in Florence',
    'Plan a 7-day Italian itinerary',
    'What local dishes should I try?',
  ]

  const onOpen = (v: boolean) => {
    setOpen(v)
    if (!v) setStarted(false)
  }

  return (
    <>
      <Button
        size="lg"
        variant="outline"
        className={cn(
          'h-11 rounded-full border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
          fullWidth ? 'w-full' : '',
          'whitespace-nowrap text-xs sm:text-sm px-4',
          className
        )}
        onClick={() => setOpen(true)}
      >
        <Play className="mr-2 h-4 w-4" />
        Meet Airen AI
      </Button>
      <Dialog open={open} onOpenChange={onOpen}>
        <DialogContent className="max-w-5xl w-[96vw]">
          <DialogHeader>
            <DialogTitle className="text-xl">Meet Airen AI</DialogTitle>
            <DialogDescription>Your Personal Travel Assistant</DialogDescription>
          </DialogHeader>

          {/* Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Avatar/Embed or Chat card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="relative rounded-lg border border-gray-200 bg-white overflow-hidden flex items-center justify-center" style={{ minHeight: 320 }}>
                {!started ? (
                  <div className="flex flex-col items-center justify-center text-center p-6">
                    <div className="h-20 w-20 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-2xl font-semibold mb-4">A</div>
                    <div className="text-gray-900 font-medium">Airen AI Avatar</div>
                    <div className="text-sm text-gray-500 mt-1 max-w-xs">
                      AI avatar will be embedded here once Heygen integration is configured.
                    </div>
                    <ul className="text-sm text-gray-600 mt-4 space-y-1">
                      <li>• Personalized travel recommendations</li>
                      <li>• Interactive Q&A sessions</li>
                      <li>• Multi-language support</li>
                    </ul>
                  </div>
                ) : isHome ? (
                  <div className="absolute inset-0 p-2 flex items-center justify-center">
                    {/* Render custom element via alias to satisfy TS in CI */}
                    {(() => {
                      const ConvaiTag = 'elevenlabs-convai' as any
                      return (
                        <ConvaiTag
                          agent-id="agent_9101k504ahreen2ssvsbmjs3fh3a"
                          mode="embedded"
                          style={{ display: 'block', width: '100%', height: '100%' }}
                        />
                      )
                    })()}
                  </div>
                ) : (
                  <div className="absolute inset-0 p-2 overflow-hidden">
                    <ChatInterface />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Description and prompts */}
            <div className="flex flex-col">
              <div className="space-y-3">
                <div className="text-lg font-semibold text-gray-900">
                  Ask me anything about travel destinations, get personalized recommendations, or chat about your travel plans!
                </div>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-gray-400 inline-block"></span> Personalized destination recommendations</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-gray-400 inline-block"></span> Real-time travel advice and tips</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-gray-400 inline-block"></span> Multi-language conversation support</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-gray-400 inline-block"></span> Interactive travel planning assistance</li>
                </ul>
              </div>

              <div className="mt-6">
                <div className="text-sm font-medium text-gray-900 mb-2">Try asking me:</div>
                <div className="space-y-2">
                  {prompts.map((p, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 text-sm flex items-center gap-2"
                      onClick={() => setStarted(true)}
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-gray-500">💬</span>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-between">
            <Button className="h-11 px-6 bg-gray-900 text-white hover:bg-black/90" onClick={() => setStarted(true)}>Start Conversation</Button>
            <Button variant="secondary" className="h-11 px-6 border border-gray-200 bg-white text-black hover:bg-gray-50" onClick={() => onOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
