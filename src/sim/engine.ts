import type { StoreApi } from 'zustand/vanilla'
import { between, pick, shuffle, type Clock, type Rng } from '@/lib/random'
import type { ObrolState } from '@/store/obrol'
import { ME_ID } from '@/types'
import { INCOMING_MESSAGES } from './replies'
import { INCOMING_INTERVAL_MS, PRESENCE_INTERVAL_MS, pickGroupResponders, planReply } from './plan'
import { Scheduler } from './scheduler'

export interface SimulationDeps {
  store: StoreApi<ObrolState>
  rng: Rng
  now: Clock
  scheduler?: Scheduler
}

export interface Simulation {
  start: () => void
  stop: () => void
  isRunning: () => boolean
  /** Dipanggil setelah pesan pengguna berstatus "terkirim". */
  onUserMessage: (conversationId: string) => void
  scheduler: Scheduler
}

export function createSimulation(deps: SimulationDeps): Simulation {
  const { store, rng, now } = deps
  const scheduler = deps.scheduler ?? new Scheduler()
  let running = false

  const otherMembers = (conversationId: string) =>
    store
      .getState()
      .members.filter((m) => m.conversationId === conversationId && m.userId !== ME_ID)
      .map((m) => m.userId)

  const isOnline = (userId: string) => store.getState().presence[userId] === true

  function readAfterDelay(conversationId: string, userId: string, delayMs: number, then?: () => void) {
    scheduler.after(delayMs, () => {
      store.getState().markRead(conversationId, userId, now())
      then?.()
    })
  }

  function typeThenReply(conversationId: string, userId: string, typingMs: number, text: string) {
    store.getState().setTyping(conversationId, userId, true)
    scheduler.after(typingMs, () => {
      const s = store.getState()
      s.setTyping(conversationId, userId, false)
      s.receiveMessage(conversationId, userId, text, now())
    })
  }

  function onUserMessage(conversationId: string) {
    if (!running) return
    const conv = store.getState().conversations[conversationId]
    if (!conv) return
    const others = otherMembers(conversationId)

    if (conv.type === 'direct') {
      const contact = others[0]
      if (!contact || !isOnline(contact)) return // offline: membaca setelah online lagi
      const plan = planReply(rng)
      readAfterDelay(conversationId, contact, plan.readDelayMs, () =>
        typeThenReply(conversationId, contact, plan.typingMs, plan.text),
      )
      return
    }

    const online = others.filter(isOnline)
    const responders = new Set(pickGroupResponders(rng, online))
    for (const userId of online) {
      const plan = planReply(rng)
      readAfterDelay(
        conversationId,
        userId,
        plan.readDelayMs,
        responders.has(userId) ? () => typeThenReply(conversationId, userId, plan.typingMs, plan.text) : undefined,
      )
    }
  }

  /** Kontak yang baru online membaca pesan yang menumpuk. */
  function catchUp(userId: string) {
    const s = store.getState()
    const convIds = s.members.filter((m) => m.userId === userId).map((m) => m.conversationId)
    for (const id of convIds) {
      readAfterDelay(id, userId, Math.round(between(rng, 1000, 3000)))
    }
  }

  function presenceTick() {
    const s = store.getState()
    const ids = Object.keys(s.presence)
    const count = Math.min(ids.length, 1 + Math.floor(rng() * 3))
    for (const id of shuffle(rng, ids).slice(0, count)) {
      const next = !s.presence[id]
      s.setOnline(id, next, now())
      if (next) catchUp(id)
    }
    schedulePresence()
  }

  function incomingTick() {
    const s = store.getState()
    const mine = new Set(s.members.filter((m) => m.userId === ME_ID).map((m) => m.conversationId))
    const candidates = shuffle(
      rng,
      Object.values(s.conversations).filter((c) => c.id !== s.openConversationId && mine.has(c.id)),
    )
    for (const conv of candidates) {
      const senders = otherMembers(conv.id).filter(isOnline)
      if (senders.length === 0) continue
      s.receiveMessage(conv.id, pick(rng, senders), pick(rng, INCOMING_MESSAGES), now())
      break
    }
    scheduleIncoming()
  }

  function schedulePresence() {
    scheduler.after(between(rng, PRESENCE_INTERVAL_MS[0], PRESENCE_INTERVAL_MS[1]), presenceTick)
  }
  function scheduleIncoming() {
    scheduler.after(between(rng, INCOMING_INTERVAL_MS[0], INCOMING_INTERVAL_MS[1]), incomingTick)
  }

  return {
    scheduler,
    isRunning: () => running,
    onUserMessage,
    start() {
      if (running) return
      running = true
      schedulePresence()
      scheduleIncoming()
    },
    stop() {
      running = false
      scheduler.clear()
      // bersihkan indikator mengetik yang menggantung
      const s = store.getState()
      for (const [convId, users] of Object.entries(s.typing)) {
        for (const u of users) s.setTyping(convId, u, false)
      }
    },
  }
}
