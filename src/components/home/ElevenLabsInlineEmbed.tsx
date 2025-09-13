'use client'

import { useEffect } from 'react'
import type React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        [key: string]: any
      }
    }
  }
}

export default function ElevenLabsInlineEmbed() {
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')
    if (existing) return
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed'
    script.async = true
    script.type = 'text/javascript'
    document.body.appendChild(script)
  }, [])

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-2 sm:p-3 w-full">
      <div className="relative w-full h-[60vh] sm:h-[70vh] flex items-center justify-center">
        {/* eslint-disable-next-line react/no-unknown-property */}
        <elevenlabs-convai
          agent-id="agent_9101k504ahreen2ssvsbmjs3fh3a"
          mode="embedded"
          style={{ display: 'block', width: '100%', height: '100%' }}
        ></elevenlabs-convai>
      </div>
    </div>
  )
}
