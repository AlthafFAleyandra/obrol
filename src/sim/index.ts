import { between, type Rng } from '@/lib/random'
import { obrolStore } from '@/store/obrol'
import { createSimulation } from './engine'
import { FAILURE_RATE, SEND_RESOLVE_MS } from './plan'
import { Scheduler } from './scheduler'

const rng: Rng = Math.random

export const simulation = createSimulation({ store: obrolStore, rng, now: Date.now })

/** Timer status pengiriman (300-800 ms); terpisah dari mesin simulasi agar pengiriman selalu selesai. */
const sendScheduler = new Scheduler()

function resolveSend(conversationId: string, messageId: string) {
  sendScheduler.after(Math.round(between(rng, SEND_RESOLVE_MS[0], SEND_RESOLVE_MS[1])), () => {
    const s = obrolStore.getState()
    const failed = s.settings.simulateFailure && rng() < FAILURE_RATE
    s.setMessageStatus(conversationId, messageId, failed ? 'failed' : 'sent')
    if (!failed) simulation.onUserMessage(conversationId)
  })
}

export function sendChatMessage(conversationId: string, body: string, imageDataUrl?: string) {
  const message = obrolStore.getState().sendMessage(conversationId, body, imageDataUrl)
  resolveSend(conversationId, message.id)
  return message
}

export function resendChatMessage(conversationId: string, messageId: string) {
  obrolStore.getState().setMessageStatus(conversationId, messageId, 'sending')
  resolveSend(conversationId, messageId)
}
