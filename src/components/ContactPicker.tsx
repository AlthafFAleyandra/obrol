import { Check, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { UserAvatar } from '@/components/UserAvatar'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useObrol } from '@/store/obrol'

interface Props {
  selected: string[]
  onToggle: (userId: string) => void
  /** id kontak yang tidak boleh dipilih (mis. sudah anggota) */
  excludeIds?: string[]
  /** batas jumlah dipilih; kontak yang belum dipilih dinonaktifkan jika sudah penuh */
  max: number
}

export function ContactPicker({ selected, onToggle, excludeIds = [], max }: Props) {
  const users = useObrol((s) => s.users)
  const presence = useObrol((s) => s.presence)
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const list = useMemo(
    () =>
      Object.values(users)
        .filter((u) => !excludeIds.includes(u.id))
        .filter((u) => !q || u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
        .sort((a, b) => a.displayName.localeCompare(b.displayName, 'id')),
    [users, excludeIds, q],
  )

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari kontak" aria-label="Cari kontak" className="pl-9" />
      </div>
      <ul className="scroll-thin max-h-60 min-h-0 overflow-y-auto rounded-md border border-border" aria-label="Daftar kontak">
        {list.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">Tidak ada kontak</li>}
        {list.map((u) => {
          const isSelected = selected.includes(u.id)
          const disabled = !isSelected && selected.length >= max
          return (
            <li key={u.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() => onToggle(u.id)}
                className="flex min-h-12 w-full items-center gap-3 px-3 py-1.5 text-left hover:bg-hover disabled:opacity-40"
              >
                <UserAvatar name={u.displayName} seed={u.id} src={u.avatarUrl} online={presence[u.id]} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{u.displayName}</span>
                  <span className="block truncate text-xs text-muted-foreground">{u.email}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'inline-flex size-5 shrink-0 items-center justify-center rounded border',
                    isSelected ? 'border-accent bg-accent text-accent-foreground' : 'border-border',
                  )}
                >
                  {isSelected && <Check className="size-3.5" />}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
