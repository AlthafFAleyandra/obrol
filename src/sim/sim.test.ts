import { createObrolStore } from '@/store/obrol'
import { ME_ID } from '@/types'
import { createSimulation } from './engine'
import { pickGroupResponders, planReply } from './plan'
import { REPLIES } from './replies'

/** RNG deterministik: mengembalikan nilai dari daftar secara berputar. */
function seq(values: number[]) {
  let i = 0
  return () => values[i++ % values.length]
}

describe('REPLIES', () => {
  it('memiliki minimal 30 variasi unik', () => {
    expect(new Set(REPLIES).size).toBeGreaterThanOrEqual(30)
  })
})

describe('planReply', () => {
  it('membaca 1-4 detik dan mengetik 1-3 detik', () => {
    const low = planReply(() => 0)
    const high = planReply(() => 0.999999)
    expect(low.readDelayMs).toBe(1000)
    expect(low.typingMs).toBe(1000)
    expect(high.readDelayMs).toBeLessThanOrEqual(4000)
    expect(high.typingMs).toBeLessThanOrEqual(3000)
    expect(REPLIES).toContain(low.text)
  })
  it('deterministik untuk RNG yang sama', () => {
    expect(planReply(seq([0.3, 0.6, 0.9]))).toEqual(planReply(seq([0.3, 0.6, 0.9])))
  })
})

describe('pickGroupResponders', () => {
  it('memilih 1 atau 2 anggota dari kandidat online', () => {
    expect(pickGroupResponders(() => 0.1, ['a', 'b', 'c'])).toHaveLength(1)
    expect(pickGroupResponders(() => 0.9, ['a', 'b', 'c'])).toHaveLength(2)
    expect(pickGroupResponders(() => 0.9, ['a'])).toHaveLength(1)
    expect(pickGroupResponders(() => 0.5, [])).toEqual([])
  })
})

describe('simulasi balasan otomatis', () => {
  beforeEach(() => vi.useFakeTimers({ now: new Date(2026, 9, 15, 12, 0, 0) }))
  afterEach(() => vi.useRealTimers())

  function setup(rngValues = [0, 0, 0]) {
    const store = createObrolStore({ persistKey: null, now: () => Date.now() })
    const sim = createSimulation({ store, rng: seq(rngValues), now: () => Date.now() })
    return { store, sim }
  }

  it('DM: kontak online membaca, mengetik, lalu membalas', () => {
    const { store, sim } = setup()
    sim.start()
    const s = store.getState()
    expect(s.presence.u_budi).toBe(true)
    const convId = 'c_u_budi'
    const before = s.messages[convId].length
    const msg = s.sendMessage(convId, 'halo Bud')
    s.setMessageStatus(convId, msg.id, 'sent')
    sim.onUserMessage(convId)

    // sebelum 1 detik: belum dibaca
    vi.advanceTimersByTime(900)
    const budiRead = () => store.getState().members.find((m) => m.conversationId === convId && m.userId === 'u_budi')!
    expect(budiRead().lastReadAt).toBeLessThan(msg.createdAt)
    // setelah 1 detik: dibaca dan mengetik
    vi.advanceTimersByTime(200)
    expect(budiRead().lastReadAt).toBeGreaterThanOrEqual(msg.createdAt)
    expect(store.getState().typing[convId]).toEqual(['u_budi'])
    // setelah mengetik 1 detik: balasan masuk
    vi.advanceTimersByTime(1000)
    const list = store.getState().messages[convId]
    expect(list).toHaveLength(before + 2)
    expect(list.at(-1)!.senderId).toBe('u_budi')
    expect(REPLIES).toContain(list.at(-1)!.body)
    expect(store.getState().typing[convId]).toEqual([])
    sim.stop()
  })

  it('DM: kontak offline tidak membaca sampai online lagi', () => {
    const { store, sim } = setup()
    sim.start()
    const convId = 'c_u_siti'
    expect(store.getState().presence.u_siti).toBe(false)
    const msg = store.getState().sendMessage(convId, 'sit?')
    sim.onUserMessage(convId)
    vi.advanceTimersByTime(10_000)
    const sitiRead = () => store.getState().members.find((m) => m.conversationId === convId && m.userId === 'u_siti')!
    expect(sitiRead().lastReadAt).toBeLessThan(msg.createdAt)
    expect(store.getState().messages[convId].at(-1)!.id).toBe(msg.id)
  })

  it('stop() membersihkan semua timer dan tidak ada pesan lanjutan', () => {
    const { store, sim } = setup()
    sim.start()
    store.getState().sendMessage('c_u_budi', 'tes')
    sim.onUserMessage('c_u_budi')
    expect(sim.scheduler.pending).toBeGreaterThan(0)
    sim.stop()
    expect(sim.scheduler.pending).toBe(0)
    const count = store.getState().messages.c_u_budi.length
    vi.advanceTimersByTime(120_000)
    expect(store.getState().messages.c_u_budi).toHaveLength(count)
  })

  it('tidak membalas jika simulasi tidak berjalan', () => {
    const { store, sim } = setup()
    store.getState().sendMessage('c_u_budi', 'tes')
    sim.onUserMessage('c_u_budi')
    expect(sim.scheduler.pending).toBe(0)
  })

  it('grup: 1-2 anggota online membalas', () => {
    const { store, sim } = setup([0.1, 0.1, 0.1])
    sim.start()
    const convId = 'g_futsal'
    const before = store.getState().messages[convId].length
    store.getState().sendMessage(convId, 'sip')
    sim.onUserMessage(convId)
    vi.advanceTimersByTime(8_000)
    const replies = store.getState().messages[convId].slice(before + 1)
    expect(replies.length).toBeGreaterThanOrEqual(1)
    expect(replies.length).toBeLessThanOrEqual(2)
    expect(replies.every((m) => m.senderId !== ME_ID)).toBe(true)
  })

  it('pesan masuk acak ke percakapan yang tidak dibuka menambah belum dibaca', () => {
    const { store, sim } = setup([0, 0, 0])
    sim.start()
    store.getState().openConversation('c_u_budi')
    const total = () => Object.values(store.getState().messages).reduce((n, l) => n + l.length, 0)
    const before = total()
    const budiBefore = store.getState().messages.c_u_budi.length
    vi.advanceTimersByTime(25_000)
    expect(total()).toBe(before + 1)
    // percakapan yang sedang dibuka tidak menerima pesan acak
    expect(store.getState().messages.c_u_budi).toHaveLength(budiBefore)
    sim.stop()
  })
})

describe('store', () => {
  it('DM unik: startDirect tidak membuat percakapan ganda', () => {
    const store = createObrolStore({ persistKey: null })
    const a = store.getState().startDirect('u_maya')
    const b = store.getState().startDirect('u_maya')
    expect(a).toBe(b)
    expect(store.getState().startDirect('u_rina')).toBe('c_u_rina')
  })
  it('membuka percakapan menandai pesan sebagai dibaca oleh pengguna', () => {
    const store = createObrolStore({ persistKey: null })
    const mine = () => store.getState().members.find((m) => m.conversationId === 'c_u_rina' && m.userId === ME_ID)!
    const last = store.getState().messages.c_u_rina.at(-1)!
    expect(mine().lastReadAt).toBeLessThan(last.createdAt)
    store.getState().openConversation('c_u_rina')
    expect(mine().lastReadAt).toBeGreaterThanOrEqual(last.createdAt)
  })
  it('grup: pembuat jadi admin dan keluar memindahkan hak admin', () => {
    const store = createObrolStore({ persistKey: null })
    const id = store.getState().createGroup('Tes', ['u_rina', 'u_budi'])
    const role = (u: string) => store.getState().members.find((m) => m.conversationId === id && m.userId === u)!.role
    expect(role(ME_ID)).toBe('admin')
    store.getState().leaveGroup(id, ME_ID)
    expect(store.getState().members.filter((m) => m.conversationId === id)).toHaveLength(2)
    expect(store.getState().members.some((m) => m.conversationId === id && m.role === 'admin')).toBe(true)
  })
})
