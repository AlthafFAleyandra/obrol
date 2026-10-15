import { SendHorizontal } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { sendChatMessage } from '@/sim'
import { TypingIndicator } from './TypingIndicator'
import { LIMITS } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  conversationId: string
  placeholder: string
}

export function Composer({ conversationId, placeholder }: Props) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)
  const trimmed = text.trim()
  const nearLimit = text.length >= LIMITS.messageBody - 200

  function resize() {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  function submit() {
    if (!trimmed) return
    sendChatMessage(conversationId, trimmed)
    setText('')
    requestAnimationFrame(() => {
      resize()
      ref.current?.focus()
    })
  }

  return (
    <div className="px-4 pb-1">
      <div className="flex items-end gap-1 rounded-lg bg-elevated px-2 py-1.5">
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
          disabled={!trimmed}
          onClick={submit}
          className={cn(trimmed && 'text-accent')}
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
