import { ME_ID, type Conversation, type Member, type Message, type User } from '@/types'

export function otherMemberIds(members: readonly Member[], conversationId: string, meId = ME_ID): string[] {
  return members.filter((m) => m.conversationId === conversationId && m.userId !== meId).map((m) => m.userId)
}

export function conversationName(
  conv: Conversation,
  members: readonly Member[],
  users: Record<string, User>,
): string {
  if (conv.type === 'group') return conv.name ?? 'Grup'
  const other = otherMemberIds(members, conv.id)[0]
  return (other && users[other]?.displayName) || 'Pengguna'
}

export function lastMessageOf(messages: readonly Message[] | undefined): Message | undefined {
  return messages && messages.length > 0 ? messages[messages.length - 1] : undefined
}
