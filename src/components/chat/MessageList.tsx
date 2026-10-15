import { ArrowDown } from 'lucide-react'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { buildTimeline, isMessageRead } from '@/lib/chat'
import { formatDateSeparator } from '@/lib/time'
import { useUserLookup } from '@/hooks/useUserLookup'
import { resendChatMessage } from '@/sim'
import { useObrol } from '@/store/obrol'
import { ME_ID } from '@/types'
import { MessageRow } from './MessageRow'

const NEAR_BOTTOM_PX = 120

interface Props {
  conversationId: string
  /** id pesan belum dibaca pertama saat percakapan dibuka */
  firstUnreadId: string | null
  onOpenImage: (src: string) => void
  emptyLabel: string
}

export function MessageList({ conversationId, firstUnreadId, onOpenImage, emptyLabel }: Props) {
  const messages = useObrol((s) => s.messages[conversationId])
  const members = useObrol((s) => s.members)
  const lookup = useUserLookup()
  const scrollRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const prevHeight = useRef(0)
  const lastCount = useRef(messages?.length ?? 0)
  const [hasNew, setHasNew] = useState(false)

  const convMembers = useMemo(() => members.filter((m) => m.conversationId === conversationId), [members, conversationId])
  const timeline = useMemo(() => buildTimeline(messages ?? []), [messages])

  const scrollToBottom = useCallback((smooth: boolean) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  // posisi awal: ke garis "Pesan baru" jika ada, jika tidak ke bawah
  useLayoutEffect(() => {
    if (dividerRef.current) dividerRef.current.scrollIntoView({ block: 'start' })
    else scrollToBottom(false)
    prevHeight.current = scrollRef.current?.scrollHeight ?? 0
  }, [scrollToBottom])

  // pesan baru: ikut turun hanya jika pengguna sudah dekat bawah sebelum pesan itu masuk
  useLayoutEffect(() => {
    const el = scrollRef.current
    const count = messages?.length ?? 0
    if (el && count > lastCount.current) {
      const wasNearBottom = prevHeight.current - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
      const newest = messages?.[count - 1]
      if (newest?.senderId === ME_ID || wasNearBottom) {
        scrollToBottom(true)
        setHasNew(false)
      } else {
        setHasNew(true)
      }
    }
    lastCount.current = count
    if (el) prevHeight.current = el.scrollHeight
  }, [messages, scrollToBottom])

  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX) setHasNew(false)
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollRef} onScroll={onScroll} className="scroll-thin h-full overflow-y-auto pt-2 pb-4" role="log" aria-label="Pesan" aria-live="polite">
        {timeline.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">{emptyLabel}</p>
        )}
        {timeline.map((item) => {
          if (item.type === 'date') {
            return (
              <div key={item.key} className="mx-4 my-4 flex items-center gap-3 text-xs font-medium text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <span>{formatDateSeparator(item.at)}</span>
                <span className="h-px flex-1 bg-border" />
              </div>
            )
          }
          const m = item.message
          return (
            <div key={item.key}>
              {m.id === firstUnreadId && (
                <div ref={dividerRef} className="mx-4 my-3 flex items-center gap-3 text-xs font-semibold text-danger-text" role="separator" aria-label="Pesan baru">
                  <span className="h-px flex-1 bg-danger" />
                  <span className="rounded-full bg-danger px-2 py-0.5 text-danger-foreground">Pesan baru</span>
                </div>
              )}
              <MessageRow
                message={m}
                sender={lookup(m.senderId)}
                grouped={item.grouped && m.id !== firstUnreadId}
                read={m.senderId === ME_ID && isMessageRead(m, convMembers)}
                onResend={(id) => resendChatMessage(conversationId, id)}
                onOpenImage={onOpenImage}
              />
            </div>
          )
        })}
      </div>
      {hasNew && (
        <Button
          size="sm"
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
          onClick={() => {
            scrollToBottom(true)
            setHasNew(false)
          }}
        >
          <ArrowDown /> Pesan baru
        </Button>
      )}
    </div>
  )
}
