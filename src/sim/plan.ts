import { between, pick, shuffle, type Rng } from '@/lib/random'
import { REPLIES } from './replies'

export interface ReplyPlan {
  readDelayMs: number
  typingMs: number
  text: string
}

/** Rencana balasan: baca dalam 1-4 detik, mengetik 1-3 detik, lalu kalimat acak. */
export function planReply(rng: Rng): ReplyPlan {
  return {
    readDelayMs: Math.round(between(rng, 1000, 4000)),
    typingMs: Math.round(between(rng, 1000, 3000)),
    text: pick(rng, REPLIES),
  }
}

/** Di grup, 1 sampai 2 anggota online yang membalas. */
export function pickGroupResponders(rng: Rng, onlineCandidateIds: readonly string[]): string[] {
  if (onlineCandidateIds.length === 0) return []
  const count = Math.min(onlineCandidateIds.length, rng() < 0.5 ? 1 : 2)
  return shuffle(rng, onlineCandidateIds).slice(0, count)
}

export const PRESENCE_INTERVAL_MS = [30_000, 90_000] as const
export const INCOMING_INTERVAL_MS = [25_000, 60_000] as const
export const SEND_RESOLVE_MS = [300, 800] as const
export const FAILURE_RATE = 0.2
