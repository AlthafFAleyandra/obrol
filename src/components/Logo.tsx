import { MessagesSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className, showName = true }: { className?: string; showName?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <MessagesSquare className="size-5" aria-hidden="true" />
      </span>
      {showName && <span className="text-xl font-bold tracking-tight">Obrol</span>}
    </span>
  )
}
