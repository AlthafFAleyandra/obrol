import { useMemo } from 'react'
import { unreadCount } from '@/lib/chat'
import { useObrol } from '@/store/obrol'
import { ME_ID } from '@/types'

/** Jumlah pesan belum dibaca per percakapan. */
export function useUnread(): Record<string, number> {
  const members = useObrol((s) => s.members)
  const messages = useObrol((s) => s.messages)
  return useMemo(() => {
    const out: Record<string, number> = {}
    for (const m of members) {
      if (m.userId !== ME_ID) continue
      out[m.conversationId] = unreadCount(messages[m.conversationId] ?? [], ME_ID, m.lastReadAt)
    }
    return out
  }, [members, messages])
}
