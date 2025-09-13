import * as React from 'react'
import { cn } from '@/lib/utils'

interface DialogContextValue {
  open: boolean
  setOpen: (v: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

export interface DialogProps {
  open?: boolean
  onOpenChange?: (v: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open: openProp, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const controlled = typeof openProp === 'boolean'
  const open = controlled ? (openProp as boolean) : internalOpen
  const setOpen = (v: boolean) => {
    if (!controlled) setInternalOpen(v)
    onOpenChange?.(v)
  }

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function DialogContent({ className, children, ...props }: DialogContentProps) {
  const ctx = React.useContext(DialogContext)
  if (!ctx) return null
  if (!ctx.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => ctx.setOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn('relative z-10 mx-auto rounded-xl bg-white p-4 shadow-xl w-full max-w-lg', className)}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-2', className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold text-gray-900', className)} {...props} />
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-gray-600', className)} {...props} />
}

export function DialogTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const ctx = React.useContext(DialogContext)
  if (!ctx) return children

  if (asChild) {
    return React.cloneElement(children, {
      onClick: (e: any) => {
        children.props.onClick?.(e)
        ctx.setOpen(true)
      },
    })
  }

  return React.cloneElement(children, {
    onClick: (e: any) => {
      children.props.onClick?.(e)
      ctx.setOpen(true)
    },
  })
}

export function DialogClose({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const ctx = React.useContext(DialogContext)
  if (!ctx) return children

  if (asChild) {
    return React.cloneElement(children, {
      onClick: (e: any) => {
        children.props.onClick?.(e)
        ctx.setOpen(false)
      },
    })
  }

  return React.cloneElement(children, {
    onClick: (e: any) => {
      children.props.onClick?.(e)
      ctx.setOpen(false)
    },
  })
}
