export type ConversationType = 'direct' | 'group'
export type MemberRole = 'admin' | 'member'
export type MessageStatus = 'sending' | 'sent' | 'failed'

export interface User {
  id: string
  displayName: string
  email: string
  bio: string
  avatarUrl?: string
  lastSeenAt: number
}

export interface Conversation {
  id: string
  type: ConversationType
  name?: string
  avatarUrl?: string
  createdBy: string
  lastMessageAt: number
}

export interface Member {
  conversationId: string
  userId: string
  role: MemberRole
  lastReadAt: number
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  body: string
  imageDataUrl?: string
  createdAt: number
  status: MessageStatus
}

export const LIMITS = {
  displayName: 32,
  bio: 190,
  messageBody: 2000,
  groupName: 50,
  groupMembersMin: 2,
  groupMembersMax: 19,
  groupTotalMax: 20,
  imageMaxBytes: 5 * 1024 * 1024,
  imageMaxSide: 1280,
  avatarMaxSide: 256,
  groupWindowMs: 5 * 60 * 1000,
} as const

export const ME_ID = 'u_me'
