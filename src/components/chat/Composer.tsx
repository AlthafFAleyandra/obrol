import { Plus, SendHorizontal, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { sendChatMessage } from '@/sim'
import { TypingIndicator } from './TypingIndicator'
import { IMAGE_TYPES, resizeImageFile, validateImageFile } from '@/lib/image'
import { LIMITS } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  conversationId: string
  placeholder: string
}

export function Composer({ conversationId, placeholder }: Props) {
  const [text, setText] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const trimmed = text.trim()
  const canSend = (!!trimmed || !!image) && !processing
  const nearLimit = text.length >= LIMITS.messageBody - 200

  function resize() {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  async function pickFile(file: File | undefined) {
    if (!file) return
    const check = validateImageFile(file, IMAGE_TYPES, LIMITS.imageMaxBytes)
    if (!check.ok) {
      toast.error(check.error)
      return
    }
    setProcessing(true)
    try {
      setImage(await resizeImageFile(file, LIMITS.imageMaxSide))
    } catch {
      toast.error('Gambar tidak dapat diproses')
    } finally {
      setProcessing(false)
    }
  }

  function submit() {
    if (!canSend) return
    sendChatMessage(conversationId, trimmed, image ?? undefined)
    setText('')
    setImage(null)
    requestAnimationFrame(() => {
      resize()
      ref.current?.focus()
    })
  }

  return (
    <div className="px-4 pb-1">
      {image && (
        <div className="mb-2 inline-flex rounded-lg bg-elevated p-2">
          <div className="relative">
            <img src={image} alt="Pratinjau lampiran" className="max-h-40 max-w-[min(100%,16rem)] rounded-md object-contain" />
            <button
              type="button"
              aria-label="Hapus lampiran"
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 inline-flex size-8 items-center justify-center rounded-full bg-danger text-danger-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-end gap-1 rounded-lg bg-elevated px-2 py-1.5">
        <Button type="button" variant="ghost" size="icon" aria-label="Lampirkan gambar" disabled={processing} onClick={() => fileRef.current?.click()}>
          <Plus />
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept={IMAGE_TYPES.join(',')}
          className="hidden"
          aria-label="Pilih gambar"
          onChange={(e) => {
            void pickFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <textarea
          ref={ref}
          value={text}
          rows={1}
          maxLength={LIMITS.messageBody}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => {
            setText(e.target.value)
            resize()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              submit()
            }
          }}
          className="scroll-thin max-h-[200px] min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-6 text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Kirim pesan"
          disabled={!canSend}
          onClick={submit}
          className={cn(canSend && 'text-accent')}
        >
          <SendHorizontal />
        </Button>
      </div>
      <div className="flex h-6 items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
        <TypingIndicator conversationId={conversationId} />
        {nearLimit && (
          <span className={cn(text.length >= LIMITS.messageBody && 'text-danger')} aria-live="polite">
            {text.length}/{LIMITS.messageBody}
          </span>
        )}
      </div>
    </div>
  )
}
