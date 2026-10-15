import { format, formatDistanceToNowStrict, isSameDay, startOfDay, subDays } from 'date-fns'
import { id } from 'date-fns/locale'

/** Waktu relatif singkat untuk daftar percakapan: "Baru saja", "5 mnt", "3 jam", "Kemarin", "Rabu", "02/10/26". */
export function formatRelative(ts: number, now: number): string {
  const diff = now - ts
  if (diff < 60_000) return 'Baru saja'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} mnt`
  const d = new Date(ts)
  const today = new Date(now)
  if (isSameDay(d, today)) return `${Math.floor(diff / 3_600_000)} jam`
  if (isSameDay(d, subDays(today, 1))) return 'Kemarin'
  if (startOfDay(today).getTime() - startOfDay(d).getTime() < 7 * 86_400_000) return format(d, 'EEEE', { locale: id })
  return format(d, 'dd/MM/yy', { locale: id })
}

export function formatClock(ts: number): string {
  return format(new Date(ts), 'HH:mm', { locale: id })
}

/** Contoh: "Kamis, 15 Oktober 2026" */
export function formatDateSeparator(ts: number): string {
  return format(new Date(ts), 'EEEE, d MMMM yyyy', { locale: id })
}

/** Contoh: "5 menit yang lalu" */
export function formatLastSeen(ts: number): string {
  return formatDistanceToNowStrict(new Date(ts), { locale: id, addSuffix: true })
}
