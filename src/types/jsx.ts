/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
import type React from 'react'

type AnyRecord = Record<string, unknown>

declare global {
  interface HTMLElementTagNameMap {
    'elevenlabs-convai': HTMLElement
  }
}

declare module 'react' {
  // Augment React JSX for our custom element with safer typing
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // allow arbitrary attributes for the custom element
    [key: `data-${string}`]: unknown
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & AnyRecord
  }
}

export {}


