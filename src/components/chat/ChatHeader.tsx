import { ArrowLeft, AtSign, Hash, Users } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatLastSeen } from '@/lib/time'
import { useNow } from '@/hooks/useNow'

interface Props {
  type: 'direct' | 'group'
  name: string
  /** DM: status kontak. Grup: jumlah anggota. */
  online?: boolean
  lastSeenAt?: number
  memberCount?: number
  onToggleMembers?: () => void
  membersActive?: boolean
}

export function ChatHeader({ type, name, online, lastSeenAt, memberCount, onToggleMembers, membersActive }: Props) {
  const navigate = useNavigate()
  useNow(60_000)
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-2 sm:px-4">
      <Button variant="ghost" size="icon" className="md:hidden" aria-label="Kembali ke daftar obrolan" onClick={() => navigate('/')}>
        <ArrowLeft />
      </Button>
      {type === 'direct' ? (
        <AtSign className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      ) : (
        <Hash className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate leading-tight font-semibold">{name}</h1>
        <p className="truncate text-xs leading-tight text-muted-foreground">
          {type === 'direct' ? (
            online ? (
              <span className="text-online-text">Online</span>
            ) : (
              `Terakhir aktif ${lastSeenAt ? formatLastSeen(lastSeenAt) : 'beberapa waktu lalu'}`
            )
          ) : (
            `# obrolan · ${memberCount ?? 0} anggota`
          )}
        </p>
      </div>
      {type === 'group' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Tampilkan atau sembunyikan daftar anggota" aria-pressed={membersActive} onClick={onToggleMembers} className={membersActive ? 'text-foreground' : 'text-muted-foreground'}>
              <Users />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Daftar anggota</TooltipContent>
        </Tooltip>
      )}
    </header>
  )
}
