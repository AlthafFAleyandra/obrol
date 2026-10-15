import { formatClock, formatDateSeparator, formatRelative } from './time'

const NOW = new Date(2026, 9, 15, 12, 0, 0).getTime()

describe('formatRelative', () => {
  it('menit dan jam di hari yang sama', () => {
    expect(formatRelative(NOW - 10_000, NOW)).toBe('Baru saja')
    expect(formatRelative(NOW - 5 * 60_000, NOW)).toBe('5 mnt')
    expect(formatRelative(NOW - 3 * 3_600_000, NOW)).toBe('3 jam')
  })
  it('kemarin, nama hari, lalu tanggal', () => {
    expect(formatRelative(new Date(2026, 9, 14, 23, 0).getTime(), NOW)).toBe('Kemarin')
    expect(formatRelative(new Date(2026, 9, 12, 10, 0).getTime(), NOW)).toBe('Senin')
    expect(formatRelative(new Date(2026, 8, 1, 10, 0).getTime(), NOW)).toBe('01/09/26')
  })
})

describe('format tanggal', () => {
  it('pemisah tanggal dalam Bahasa Indonesia', () => {
    expect(formatDateSeparator(NOW)).toBe('Kamis, 15 Oktober 2026')
  })
  it('jam 24 jam', () => {
    expect(formatClock(new Date(2026, 9, 15, 9, 5).getTime())).toBe('09:05')
  })
})
