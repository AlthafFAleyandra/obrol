import type { Member } from '@/types'
import { canAddMembers, canRemoveMember, remainingSlots, validateNewGroup } from './groups'

const ids = (n: number) => Array.from({ length: n }, (_, i) => `u${i}`)
function members(count: number): Member[] {
  return Array.from({ length: count }, (_, i) => ({
    conversationId: 'g',
    userId: i === 0 ? 'admin' : `m${i}`,
    role: i === 0 ? ('admin' as const) : ('member' as const),
    lastReadAt: 0,
  }))
}

describe('validateNewGroup', () => {
  it('menolak nama kosong atau lebih dari 50 karakter', () => {
    expect(validateNewGroup('   ', ids(3)).ok).toBe(false)
    expect(validateNewGroup('a'.repeat(51), ids(3)).ok).toBe(false)
    expect(validateNewGroup('a'.repeat(50), ids(3)).ok).toBe(true)
  })
  it('menerima 2 sampai 19 kontak', () => {
    expect(validateNewGroup('G', ids(1)).ok).toBe(false)
    expect(validateNewGroup('G', ids(2)).ok).toBe(true)
    expect(validateNewGroup('G', ids(19)).ok).toBe(true)
    expect(validateNewGroup('G', ids(20)).ok).toBe(false)
  })
  it('kontak duplikat dihitung sekali', () => {
    expect(validateNewGroup('G', ['a', 'a', 'a']).ok).toBe(false)
  })
})

describe('anggota grup', () => {
  it('total maksimal 20 anggota', () => {
    expect(remainingSlots(18)).toBe(2)
    expect(remainingSlots(20)).toBe(0)
    expect(canAddMembers(members(18), 'g', 'admin', 2).ok).toBe(true)
    expect(canAddMembers(members(18), 'g', 'admin', 3).ok).toBe(false)
  })
  it('hanya admin yang boleh menambah dan mengeluarkan', () => {
    expect(canAddMembers(members(5), 'g', 'm1', 1).ok).toBe(false)
    expect(canRemoveMember(members(5), 'g', 'm1', 'm2').ok).toBe(false)
    expect(canRemoveMember(members(5), 'g', 'admin', 'm2').ok).toBe(true)
  })
  it('admin tidak mengeluarkan diri sendiri dan target harus anggota', () => {
    expect(canRemoveMember(members(5), 'g', 'admin', 'admin').ok).toBe(false)
    expect(canRemoveMember(members(5), 'g', 'admin', 'zzz').ok).toBe(false)
  })
})
