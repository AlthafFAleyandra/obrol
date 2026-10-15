import { LIMITS, type Conversation, type Member, type Message } from '@/types'

/** Pesan dianggap dibaca jika semua anggota lain sudah membaca sampai createdAt pesan. */
export function isMessageRead(message: Message, members: readonly Member[]): boolean {
  const others = members.filter(
    (m) => m.conversationId === message.conversationId && m.userId !== message.senderId,
  )
  if (others.length === 0) return false
  return others.every((m) => m.lastReadAt >= message.createdAt)
}

/** Jumlah pesan dari orang lain yang lebih baru dari lastReadAt milik pengguna. */
export function unreadCount(
  messages: readonly Message[],
  userId: string,
  lastReadAt: number,
): number {
  return messages.filter((m) => m.senderId !== userId && m.createdAt > lastReadAt).length
}

export function formatBadge(count: number): string {
  return count > 99 ? '99+' : String(count)
}

/** Cari percakapan DM yang sudah ada untuk sepasang pengguna (maksimal satu). */
export function findDirectConversation(
  conversations: readonly Conversation[],
  members: readonly Member[],
  userA: string,
  userB: string,
): Conversation | undefined {
  return conversations.find((c) => {
    if (c.type !== 'direct') return false
    const ids = members.filter((m) => m.conversationId === c.id).map((m) => m.userId)
    return ids.length === 2 && ids.includes(userA) && ids.includes(userB)
  })
}

/** Dua pesan beruntun masuk satu kelompok jika pengirim sama dan selisih <= 5 menit. */
export function isSameGroup(prev: Message | undefined, next: Message): boolean {
  if (!prev) return false
  return (
    prev.senderId === next.senderId && next.createdAt - prev.createdAt <= LIMITS.groupWindowMs
  )
}

function dayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export type TimelineItem =
  | { type: 'date'; key: string; at: number }
  | { type: 'message'; key: string; message: Message; grouped: boolean }

/** Susun pesan menjadi timeline dengan pemisah tanggal dan penanda pesan beruntun. */
export function buildTimeline(messages: readonly Message[]): TimelineItem[] {
  const items: TimelineItem[] = []
  let prev: Message | undefined
  for (const message of messages) {
    const newDay = !prev || dayKey(prev.createdAt) !== dayKey(message.createdAt)
    if (newDay) items.push({ type: 'date', key: `d-${dayKey(message.createdAt)}`, at: message.createdAt })
    items.push({
      type: 'message',
      key: message.id,
      message,
      grouped: !newDay && isSameGroup(prev, message),
    })
    prev = message
  }
  return items
}

export function previewText(message: Message | undefined): string {
  if (!message) return 'Belum ada pesan'
  const body = message.body.trim()
  if (!body && message.imageDataUrl) return 'Gambar'
  return body
}
