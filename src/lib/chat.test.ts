import type { Conversation, Member, Message } from '@/types'
import {
  buildTimeline,
  findDirectConversation,
  formatBadge,
  isMessageRead,
  isSameGroup,
  previewText,
  unreadCount,
} from './chat'

const T0 = new Date(2026, 9, 15, 10, 0, 0).getTime()
const MIN = 60_000

function msg(id: string, senderId: string, at: number, extra: Partial<Message> = {}): Message {
  return { id, conversationId: 'c1', senderId, body: id, createdAt: at, status: 'sent', ...extra }
}
function member(userId: string, lastReadAt: number, conversationId = 'c1'): Member {
  return { conversationId, userId, role: 'member', lastReadAt }
}

describe('isMessageRead', () => {
  it('dibaca jika semua anggota lain lastReadAt >= createdAt', () => {
    const m = msg('a', 'me', T0)
    expect(isMessageRead(m, [member('me', T0), member('x', T0), member('y', T0 + 5)])).toBe(true)
  })
  it('belum dibaca jika salah satu anggota lain belum membaca', () => {
    const m = msg('a', 'me', T0)
    expect(isMessageRead(m, [member('me', T0), member('x', T0), member('y', T0 - 1)])).toBe(false)
  })
  it('lastReadAt pengirim sendiri tidak dihitung', () => {
    const m = msg('a', 'me', T0)
    expect(isMessageRead(m, [member('me', 0), member('x', T0)])).toBe(true)
  })
  it('tanpa anggota lain tidak dianggap dibaca', () => {
    expect(isMessageRead(msg('a', 'me', T0), [member('me', T0)])).toBe(false)
  })
})

describe('unreadCount', () => {
  it('hanya menghitung pesan orang lain setelah lastReadAt', () => {
    const list = [msg('1', 'x', T0), msg('2', 'x', T0 + 10), msg('3', 'me', T0 + 20), msg('4', 'x', T0 + 30)]
    expect(unreadCount(list, 'me', T0)).toBe(2)
    expect(unreadCount(list, 'me', T0 + 30)).toBe(0)
  })
  it('format badge 99+', () => {
    expect(formatBadge(5)).toBe('5')
    expect(formatBadge(99)).toBe('99')
    expect(formatBadge(100)).toBe('99+')
  })
})

describe('DM unik', () => {
  const convs: Conversation[] = [
    { id: 'c1', type: 'direct', createdBy: 'me', lastMessageAt: 0 },
    { id: 'g1', type: 'group', name: 'G', createdBy: 'me', lastMessageAt: 0 },
  ]
  const members: Member[] = [
    member('me', 0, 'c1'),
    member('x', 0, 'c1'),
    member('me', 0, 'g1'),
    member('x', 0, 'g1'),
    member('y', 0, 'g1'),
  ]
  it('menemukan DM yang sudah ada untuk sepasang pengguna (urutan bebas)', () => {
    expect(findDirectConversation(convs, members, 'me', 'x')?.id).toBe('c1')
    expect(findDirectConversation(convs, members, 'x', 'me')?.id).toBe('c1')
  })
  it('tidak menganggap grup sebagai DM dan mengembalikan undefined jika belum ada', () => {
    expect(findDirectConversation(convs, members, 'me', 'y')).toBeUndefined()
  })
})

describe('pengelompokan pesan', () => {
  it('pengirim sama dalam 5 menit digabung', () => {
    expect(isSameGroup(msg('a', 'x', T0), msg('b', 'x', T0 + 5 * MIN))).toBe(true)
  })
  it('lebih dari 5 menit atau pengirim berbeda tidak digabung', () => {
    expect(isSameGroup(msg('a', 'x', T0), msg('b', 'x', T0 + 5 * MIN + 1))).toBe(false)
    expect(isSameGroup(msg('a', 'x', T0), msg('b', 'y', T0 + MIN))).toBe(false)
    expect(isSameGroup(undefined, msg('b', 'y', T0))).toBe(false)
  })
  it('timeline menambah pemisah tanggal dan memutus kelompok di hari baru', () => {
    const next = new Date(2026, 9, 16, 0, 1, 0).getTime()
    const items = buildTimeline([msg('a', 'x', next - 2 * MIN), msg('b', 'x', next)])
    expect(items.map((i) => i.type)).toEqual(['date', 'message', 'date', 'message'])
    const second = items[3]
    expect(second.type === 'message' && second.grouped).toBe(false)
  })
  it('timeline menandai pesan beruntun sebagai grouped', () => {
    const items = buildTimeline([msg('a', 'x', T0), msg('b', 'x', T0 + MIN), msg('c', 'y', T0 + 2 * MIN)])
    const flags = items.flatMap((i) => (i.type === 'message' ? [i.grouped] : []))
    expect(flags).toEqual([false, true, false])
  })
})

describe('previewText', () => {
  it('menampilkan "Gambar" jika hanya gambar', () => {
    expect(previewText(msg('a', 'x', T0, { body: '', imageDataUrl: 'data:image/png;base64,AA' }))).toBe('Gambar')
    expect(previewText(msg('a', 'x', T0, { body: 'halo' }))).toBe('halo')
    expect(previewText(undefined)).toBe('Belum ada pesan')
  })
})
