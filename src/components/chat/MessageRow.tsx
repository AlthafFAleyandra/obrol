import { Copy, RotateCw } from 'lucide-react'
import { memo } from 'react'
import { toast } from 'sonner'
import { UserAvatar } from '@/components/UserAvatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatClock } from '@/lib/time'
import { cn } from '@/lib/utils'
import { ME_ID, type Message, type User } from '@/types'
import { StatusIcon } from './StatusIcon'

interface Props {
  message: Message
  sender: User | undefined
  grouped: boolean
  read: boolean
  onResend: (id: string) => void
  onOpenImage: (src: string) => void
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Teks disalin')
  } catch {
    toast.error('Tidak dapat menyalin teks')
  }
}

function MessageRowBase({ message, sender, grouped, read, onResend, onOpenImage }: Props) {
  const mine = message.senderId === ME_ID
  const name = sender?.displayName ?? 'Pengguna'
  const failed = message.status === 'failed'

  return (
    <div
      className={cn(
        'group/row relative flex gap-4 px-4 py-0.5 hover:bg-hover focus-within:bg-hover',
        grouped ? '' : 'mt-3',
      )}
    >
      <div className="flex w-10 shrink-0 justify-center">
        {grouped ? (
          <span className="pt-1 text-[11px] leading-5 text-muted-foreground opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100">
            {formatClock(message.createdAt)}
          </span>
        ) : (
          <UserAvatar name={name} seed={sender?.id} src={sender?.avatarUrl} size="md" ringClass="ring-background" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {!grouped && (
          <div className="flex items-baseline gap-2">
            <span className="truncate font-semibold">{name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatClock(message.createdAt)}</span>
            {mine && <StatusIcon status={message.status} read={read} className="self-center" />}
          </div>
        )}
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            {message.body && (
              <p className={cn('text-[15px] leading-6 [overflow-wrap:anywhere] whitespace-pre-wrap', failed && 'text-muted-foreground')}>
                {message.body}
              </p>
            )}
            {message.imageDataUrl && (
              <button
                type="button"
                onClick={() => onOpenImage(message.imageDataUrl!)}
                aria-label="Buka gambar"
                className="mt-1 block max-w-full overflow-hidden rounded-lg"
              >
                <img
                  src={message.imageDataUrl}
                  alt="Gambar terkirim"
                  className="max-h-80 max-w-full rounded-lg object-contain"
                  loading="lazy"
                />
              </button>
            )}
            {failed && (
              <div className="mt-1 flex items-center gap-2 text-sm text-danger">
                <span>Gagal terkirim.</span>
                <Button variant="outline" size="sm" className="h-8 border-danger text-danger" onClick={() => onResend(message.id)}>
                  <RotateCw /> Kirim ulang
                </Button>
              </div>
            )}
          </div>
          {mine && grouped && <StatusIcon status={message.status} read={read} className="mt-1.5" />}
        </div>
      </div>

      {message.body && (
        <div className="absolute -top-3 right-4 hidden rounded-md border border-border bg-sidebar shadow-sm group-focus-within/row:flex group-hover/row:flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label="Salin teks" onClick={() => void copyText(message.body)}>
                <Copy />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Salin teks</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  )
}

export const MessageRow = memo(MessageRowBase)
