import type * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-20 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
