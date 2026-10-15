import { X } from 'lucide-react'
import { Dialog as SheetPrimitive } from 'radix-ui'
import type * as React from 'react'
import { cn } from '@/lib/utils'

const Sheet = SheetPrimitive.Root

function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: 'right' | 'left' }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60" />
      <SheetPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-50 flex w-72 max-w-[85vw] flex-col bg-sidebar shadow-xl',
          side === 'right' ? 'right-0 border-l border-border' : 'left-0 border-r border-border',
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          aria-label="Tutup"
          className="absolute top-2 right-2 inline-flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-hover hover:text-foreground"
        >
          <X className="size-4" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title className={cn('px-4 pt-4 text-sm font-semibold', className)} {...props} />
}

function SheetDescription(props: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description className="sr-only" {...props} />
}

export { Sheet, SheetContent, SheetDescription, SheetTitle }
