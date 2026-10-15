import { AlertCircle, Check, CheckCheck, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MessageStatus } from '@/types'

export function StatusIcon({ status, read, className }: { status: MessageStatus; read: boolean; className?: string }) {
  const base = cn('size-3.5 shrink-0', className)
  if (status === 'sending') return <Clock role="img" aria-label="Sedang dikirim" className={cn(base, 'text-muted-foreground')} />
  if (status === 'failed') return <AlertCircle role="img" aria-label="Gagal terkirim" className={cn(base, 'text-danger')} />
  if (read) return <CheckCheck role="img" aria-label="Dibaca" className={cn(base, 'text-accent')} />
  return <Check role="img" aria-label="Terkirim" className={cn(base, 'text-muted-foreground')} />
}
