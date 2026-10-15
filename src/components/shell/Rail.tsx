import { MessagesSquare, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { NavLink, useMatch } from 'react-router'
import { UserAvatar } from '@/components/UserAvatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatBadge } from '@/lib/chat'
import { useUnread } from '@/hooks/useUnread'
import { cn } from '@/lib/utils'
import { useObrol } from '@/store/obrol'

function Pill({ state }: { state: 'active' | 'unread' | 'none' }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute left-0 w-1 rounded-r-full bg-foreground transition-all duration-150',
        state === 'active' && 'h-10',
        state === 'unread' && 'h-2 group-hover:h-5',
        state === 'none' && 'h-0 group-hover:h-5',
      )}
    />
  )
}

function RailItem({
  label,
  to,
  active,
  unread,
  children,
}: {
  label: string
  to: string
  active: boolean
  unread: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={to}
          aria-label={label}
          aria-current={active ? 'page' : undefined}
          className="group relative flex h-12 w-full items-center justify-center"
        >
          <Pill state={active ? 'active' : unread ? 'unread' : 'none'} />
          {children}
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export function Rail({ onCreateGroup }: { onCreateGroup: () => void }) {
  const conversations = useObrol((s) => s.conversations)
  const unread = useUnread()
  const groupMatch = useMatch('/g/:id')
  const homeActive = !groupMatch

  const groups = useMemo(() => Object.values(conversations).filter((c) => c.type === 'group'), [conversations])
  const dmUnread = useMemo(
    () => Object.values(conversations).reduce((n, c) => (c.type === 'direct' ? n + (unread[c.id] ?? 0) : n), 0),
    [conversations, unread],
  )

  return (
    <nav aria-label="Daftar ruang" className="flex w-[72px] shrink-0 flex-col items-center gap-2 bg-rail py-3">
      <RailItem label="Beranda (pesan langsung)" to="/" active={homeActive} unread={dmUnread > 0}>
        <span
          className={cn(
            'relative inline-flex size-12 items-center justify-center bg-elevated text-foreground transition-all duration-150 group-hover:rounded-2xl group-hover:bg-accent group-hover:text-accent-foreground',
            homeActive ? 'rounded-2xl bg-accent text-accent-foreground' : 'rounded-full',
          )}
        >
          <MessagesSquare className="size-6" aria-hidden="true" />
          {dmUnread > 0 && (
            <span className="absolute -right-1 -bottom-1 min-w-5 rounded-full bg-danger px-1 text-center text-xs font-bold text-danger-foreground ring-4 ring-rail">
              {formatBadge(dmUnread)}
            </span>
          )}
        </span>
      </RailItem>

      <div className="h-0.5 w-8 rounded-full bg-border" role="separator" />

      <div className="scroll-thin flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto overflow-x-hidden">
        {groups.map((g) => {
          const active = groupMatch?.params.id === g.id
          return (
            <RailItem key={g.id} label={g.name ?? 'Grup'} to={`/g/${g.id}`} active={active} unread={(unread[g.id] ?? 0) > 0}>
              <UserAvatar
                name={g.name ?? 'Grup'}
                seed={g.id}
                src={g.avatarUrl}
                size="lg"
                square={active}
                className={cn('transition-all duration-150 [&>*]:transition-all [&>*]:duration-150 group-hover:[&>*]:rounded-2xl')}
              />
            </RailItem>
          )
        })}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Buat grup"
              onClick={onCreateGroup}
              className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-elevated text-online transition-all duration-150 hover:rounded-2xl hover:bg-online hover:text-rail"
            >
              <Plus className="size-6" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Buat grup</TooltipContent>
        </Tooltip>
      </div>
    </nav>
  )
}
