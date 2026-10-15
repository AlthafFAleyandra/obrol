import { Crown } from 'lucide-react'
import { useMemo } from 'react'
import { UserAvatar } from '@/components/UserAvatar'
import { useUserLookup } from '@/hooks/useUserLookup'
import { useObrol } from '@/store/obrol'
import { ME_ID, type Member } from '@/types'

function Row({ member, online }: { member: Member; online: boolean }) {
  const lookup = useUserLookup()
  const user = lookup(member.userId)
  const name = user?.displayName ?? 'Pengguna'
  return (
    <li className="flex min-h-11 items-center gap-3 rounded-md px-2 py-1">
      <UserAvatar name={name} seed={user?.id} src={user?.avatarUrl} online={online} ringClass="ring-sidebar" />
      <span className={online ? 'min-w-0 flex-1 truncate text-sm font-medium' : 'min-w-0 flex-1 truncate text-sm text-muted-foreground'}>
        {name}
        {member.userId === ME_ID && ' (kamu)'}
      </span>
      {member.role === 'admin' && <Crown className="size-4 shrink-0 text-accent" aria-label="Admin" />}
    </li>
  )
}

export function MemberList({ conversationId }: { conversationId: string }) {
  const members = useObrol((s) => s.members)
  const presence = useObrol((s) => s.presence)

  const { online, offline } = useMemo(() => {
    const list = members.filter((m) => m.conversationId === conversationId)
    const isOn = (m: Member) => m.userId === ME_ID || presence[m.userId] === true
    return { online: list.filter(isOn), offline: list.filter((m) => !isOn(m)) }
  }, [members, presence, conversationId])

  return (
    <div className="scroll-thin h-full overflow-y-auto p-2" aria-label="Daftar anggota">
      <h2 className="px-2 pt-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Online - {online.length}
      </h2>
      <ul>{online.map((m) => <Row key={m.userId} member={m} online />)}</ul>
      <h2 className="px-2 pt-4 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Offline - {offline.length}
      </h2>
      <ul>{offline.map((m) => <Row key={m.userId} member={m} online={false} />)}</ul>
    </div>
  )
}
