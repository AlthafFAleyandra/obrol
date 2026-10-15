import { LIMITS, type Member } from '@/types'

export interface GroupValidation {
  ok: boolean
  error?: string
}

/** Validasi pembuatan grup: nama 1-50 karakter, 2-19 kontak dipilih (total maks 20). */
export function validateNewGroup(name: string, selectedContactIds: readonly string[]): GroupValidation {
  const trimmed = name.trim()
  if (trimmed.length < 1) return { ok: false, error: 'Nama grup wajib diisi' }
  if (trimmed.length > LIMITS.groupName) {
    return { ok: false, error: `Nama grup maksimal ${LIMITS.groupName} karakter` }
  }
  const count = new Set(selectedContactIds).size
  if (count < LIMITS.groupMembersMin) {
    return { ok: false, error: `Pilih minimal ${LIMITS.groupMembersMin} kontak` }
  }
  if (count > LIMITS.groupMembersMax) {
    return { ok: false, error: `Pilih maksimal ${LIMITS.groupMembersMax} kontak` }
  }
  return { ok: true }
}

export function isAdmin(members: readonly Member[], conversationId: string, userId: string): boolean {
  return members.some(
    (m) => m.conversationId === conversationId && m.userId === userId && m.role === 'admin',
  )
}

/** Berapa anggota lagi yang masih boleh ditambahkan (total maks 20). */
export function remainingSlots(currentMemberCount: number): number {
  return Math.max(0, LIMITS.groupTotalMax - currentMemberCount)
}

export function canAddMembers(
  members: readonly Member[],
  conversationId: string,
  actorId: string,
  addingCount: number,
): GroupValidation {
  if (!isAdmin(members, conversationId, actorId)) {
    return { ok: false, error: 'Hanya admin yang dapat menambah anggota' }
  }
  const current = members.filter((m) => m.conversationId === conversationId).length
  if (addingCount < 1) return { ok: false, error: 'Pilih minimal satu kontak' }
  if (addingCount > remainingSlots(current)) {
    return { ok: false, error: `Grup penuh (maksimal ${LIMITS.groupTotalMax} anggota)` }
  }
  return { ok: true }
}

export function canRemoveMember(
  members: readonly Member[],
  conversationId: string,
  actorId: string,
  targetId: string,
): GroupValidation {
  if (!isAdmin(members, conversationId, actorId)) {
    return { ok: false, error: 'Hanya admin yang dapat mengeluarkan anggota' }
  }
  if (actorId === targetId) return { ok: false, error: 'Gunakan "Keluar grup" untuk keluar sendiri' }
  const isMember = members.some((m) => m.conversationId === conversationId && m.userId === targetId)
  if (!isMember) return { ok: false, error: 'Pengguna bukan anggota grup' }
  return { ok: true }
}
