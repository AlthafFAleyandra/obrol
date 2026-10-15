import { useStore } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla'
import { buildSeed } from '@/data/seed'
import { findDirectConversation } from '@/lib/chat'
import { uid } from '@/lib/random'
import { ME_ID, type Conversation, type Member, type Message, type User } from '@/types'
import { safeStorage } from './storage'

export type Theme = 'dark' | 'light'

export interface Settings {
  theme: Theme
  simulationEnabled: boolean
  simulateFailure: boolean
}

export interface ObrolState {
  me: User
  users: Record<string, User>
  conversations: Record<string, Conversation>
  members: Member[]
  messages: Record<string, Message[]>
  presence: Record<string, boolean>
  auth: { loggedIn: boolean; onboarded: boolean }
  settings: Settings
  // sementara (tidak disimpan)
  typing: Record<string, string[]>
  openConversationId: string | null

  login: (email: string) => void
  logout: () => void
  completeOnboarding: (displayName: string, avatarUrl?: string) => void
  updateProfile: (patch: { displayName?: string; bio?: string; avatarUrl?: string | null }) => void
  updateSettings: (patch: Partial<Settings>) => void
  resetDemo: () => void

  openConversation: (id: string | null) => void
  markRead: (conversationId: string, userId: string, at: number) => void
  startDirect: (userId: string) => string
  sendMessage: (conversationId: string, body: string, imageDataUrl?: string) => Message
  setMessageStatus: (conversationId: string, messageId: string, status: Message['status']) => void
  receiveMessage: (conversationId: string, senderId: string, body: string, at?: number) => void
  setTyping: (conversationId: string, userId: string, typing: boolean) => void
  setOnline: (userId: string, online: boolean, at?: number) => void

  createGroup: (name: string, memberIds: string[], avatarUrl?: string) => string
  addGroupMembers: (conversationId: string, userIds: string[]) => void
  removeGroupMember: (conversationId: string, userId: string) => void
  leaveGroup: (conversationId: string, userId?: string) => void
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  simulationEnabled: true,
  simulateFailure: false,
}

function defaultMe(): User {
  return { id: ME_ID, displayName: 'Pengguna Obrol', email: '', bio: '', lastSeenAt: Date.now() }
}

function initialData(now = Date.now()) {
  const seed = buildSeed(now)
  return {
    me: defaultMe(),
    ...seed,
    auth: { loggedIn: false, onboarded: false },
    settings: { ...DEFAULT_SETTINGS },
    typing: {} as Record<string, string[]>,
    openConversationId: null as string | null,
  }
}

export interface CreateStoreOptions {
  persistKey?: string | null
  now?: () => number
}

export function createObrolStore(options: CreateStoreOptions = {}): StoreApi<ObrolState> {
  const { persistKey = 'obrol-state-v1', now = Date.now } = options

  const init: StateCreator<ObrolState, [], []> = (set, get) => ({
    ...initialData(now()),

    login: (email) =>
      set((s) => ({
        me: { ...s.me, email: email.trim() },
        auth: { ...s.auth, loggedIn: true },
      })),
    logout: () => set((s) => ({ auth: { ...s.auth, loggedIn: false }, openConversationId: null })),
    completeOnboarding: (displayName, avatarUrl) =>
      set((s) => ({
        me: { ...s.me, displayName: displayName.trim(), avatarUrl },
        auth: { ...s.auth, onboarded: true },
      })),
    updateProfile: (patch) =>
      set((s) => {
        const me = { ...s.me }
        if (patch.displayName !== undefined) me.displayName = patch.displayName.trim()
        if (patch.bio !== undefined) me.bio = patch.bio
        if (patch.avatarUrl !== undefined) me.avatarUrl = patch.avatarUrl ?? undefined
        return { me }
      }),
    updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    resetDemo: () => {
      const { me, auth, settings } = get()
      const fresh = initialData(now())
      set({
        ...fresh,
        me: { ...fresh.me, email: me.email, displayName: me.displayName, avatarUrl: me.avatarUrl, bio: me.bio },
        auth,
        settings,
      })
    },

    openConversation: (id) => {
      set({ openConversationId: id })
      if (id) get().markRead(id, ME_ID, now())
    },
    markRead: (conversationId, userId, at) =>
      set((s) => {
        let changed = false
        const members = s.members.map((m) => {
          if (m.conversationId === conversationId && m.userId === userId && m.lastReadAt < at) {
            changed = true
            return { ...m, lastReadAt: at }
          }
          return m
        })
        return changed ? { members } : s
      }),
    startDirect: (userId) => {
      const s = get()
      const existing = findDirectConversation(Object.values(s.conversations), s.members, ME_ID, userId)
      if (existing) return existing.id
      const id = uid('c')
      const at = now()
      set((st) => ({
        conversations: {
          ...st.conversations,
          [id]: { id, type: 'direct', createdBy: ME_ID, lastMessageAt: at },
        },
        members: [
          ...st.members,
          { conversationId: id, userId: ME_ID, role: 'member', lastReadAt: at },
          { conversationId: id, userId, role: 'member', lastReadAt: 0 },
        ],
        messages: { ...st.messages, [id]: [] },
      }))
      return id
    },
    sendMessage: (conversationId, body, imageDataUrl) => {
      const at = now()
      const message: Message = {
        id: uid('m'),
        conversationId,
        senderId: ME_ID,
        body: body.trim(),
        imageDataUrl,
        createdAt: at,
        status: 'sending',
      }
      set((s) => ({
        messages: { ...s.messages, [conversationId]: [...(s.messages[conversationId] ?? []), message] },
        conversations: {
          ...s.conversations,
          [conversationId]: { ...s.conversations[conversationId], lastMessageAt: at },
        },
        members: s.members.map((m) =>
          m.conversationId === conversationId && m.userId === ME_ID ? { ...m, lastReadAt: at } : m,
        ),
      }))
      return message
    },
    setMessageStatus: (conversationId, messageId, status) =>
      set((s) => ({
        messages: {
          ...s.messages,
          [conversationId]: (s.messages[conversationId] ?? []).map((m) =>
            m.id === messageId ? { ...m, status } : m,
          ),
        },
      })),
    receiveMessage: (conversationId, senderId, body, at = now()) =>
      set((s) => {
        if (!s.conversations[conversationId]) return s
        const message: Message = {
          id: uid('m'),
          conversationId,
          senderId,
          body,
          createdAt: at,
          status: 'sent',
        }
        const isOpen = s.openConversationId === conversationId
        return {
          messages: { ...s.messages, [conversationId]: [...(s.messages[conversationId] ?? []), message] },
          conversations: {
            ...s.conversations,
            [conversationId]: { ...s.conversations[conversationId], lastMessageAt: at },
          },
          members: s.members.map((m) => {
            if (m.conversationId !== conversationId) return m
            if (m.userId === senderId || (isOpen && m.userId === ME_ID)) {
              return { ...m, lastReadAt: Math.max(m.lastReadAt, at) }
            }
            return m
          }),
        }
      }),
    setTyping: (conversationId, userId, typing) =>
      set((s) => {
        const current = s.typing[conversationId] ?? []
        const has = current.includes(userId)
        if (typing === has) return s
        const next = typing ? [...current, userId] : current.filter((id) => id !== userId)
        return { typing: { ...s.typing, [conversationId]: next } }
      }),
    setOnline: (userId, online, at = now()) =>
      set((s) => ({
        presence: { ...s.presence, [userId]: online },
        users: s.users[userId]
          ? { ...s.users, [userId]: { ...s.users[userId], lastSeenAt: online ? s.users[userId].lastSeenAt : at } }
          : s.users,
      })),

    createGroup: (name, memberIds, avatarUrl) => {
      const id = uid('g')
      const at = now()
      const unique = [...new Set(memberIds)].filter((u) => u !== ME_ID)
      set((s) => ({
        conversations: {
          ...s.conversations,
          [id]: { id, type: 'group', name: name.trim(), avatarUrl, createdBy: ME_ID, lastMessageAt: at },
        },
        members: [
          ...s.members,
          { conversationId: id, userId: ME_ID, role: 'admin', lastReadAt: at },
          ...unique.map((userId): Member => ({ conversationId: id, userId, role: 'member', lastReadAt: 0 })),
        ],
        messages: { ...s.messages, [id]: [] },
      }))
      return id
    },
    addGroupMembers: (conversationId, userIds) =>
      set((s) => {
        const existing = new Set(s.members.filter((m) => m.conversationId === conversationId).map((m) => m.userId))
        const fresh = userIds.filter((u) => !existing.has(u))
        const at = now()
        return {
          members: [
            ...s.members,
            ...fresh.map((userId): Member => ({ conversationId, userId, role: 'member', lastReadAt: at })),
          ],
        }
      }),
    removeGroupMember: (conversationId, userId) =>
      set((s) => ({
        members: s.members.filter((m) => !(m.conversationId === conversationId && m.userId === userId)),
      })),
    leaveGroup: (conversationId, userId = ME_ID) =>
      set((s) => {
        const remaining = s.members.filter((m) => m.conversationId === conversationId && m.userId !== userId)
        const others = s.members.filter((m) => m.conversationId !== conversationId)
        if (remaining.length === 0) {
          const { [conversationId]: _c, ...conversations } = s.conversations
          const { [conversationId]: _m, ...messages } = s.messages
          return { members: others, conversations, messages, openConversationId: null }
        }
        // jika admin terakhir keluar, anggota tertua (urutan pertama) menjadi admin
        const leavingWasAdmin = s.members.some(
          (m) => m.conversationId === conversationId && m.userId === userId && m.role === 'admin',
        )
        const hasAdmin = remaining.some((m) => m.role === 'admin')
        const nextRemaining =
          leavingWasAdmin && !hasAdmin
            ? remaining.map((m, i) => (i === 0 ? { ...m, role: 'admin' as const } : m))
            : remaining
        return {
          members: [...others, ...nextRemaining],
          openConversationId: s.openConversationId === conversationId ? null : s.openConversationId,
        }
      }),
  })

  if (persistKey === null) return createStore<ObrolState>()(init)

  return createStore<ObrolState>()(
    persist(init, {
      name: persistKey,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        me: s.me,
        users: s.users,
        conversations: s.conversations,
        members: s.members,
        messages: s.messages,
        presence: s.presence,
        auth: s.auth,
        settings: s.settings,
      }),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<ObrolState>) }
        // pesan yang tertinggal "sedang dikirim" saat refresh dianggap terkirim
        const messages: Record<string, Message[]> = {}
        for (const [id, list] of Object.entries(merged.messages)) {
          messages[id] = list.map((m) => (m.status === 'sending' ? { ...m, status: 'sent' as const } : m))
        }
        return { ...merged, messages }
      },
    }),
  )
}

export const obrolStore = createObrolStore()

export function useObrol<T>(selector: (s: ObrolState) => T): T {
  return useStore(obrolStore, selector)
}
