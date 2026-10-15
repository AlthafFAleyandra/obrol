import type * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'h-10 w-full min-w-0 rounded-md border border-border bg-elevated px-3 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
