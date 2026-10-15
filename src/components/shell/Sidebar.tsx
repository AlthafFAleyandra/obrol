import { ChevronDown, Hash } from 'lucide-react'
import { NavLink, useMatch } from 'react-router'
import { cn } from '@/lib/utils'
import { useObrol } from '@/store/obrol'
import { ConversationList } from './ConversationList'
import { GroupMenu } from './GroupMenu'
import { UserPanel } from './UserPanel'

function GroupSidebar({ id }: { id: string }) {
  const conv = useObrol((s) => s.conversations[id])
  if (!conv) return <div className="flex-1" />
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <GroupMenu conversationId={id}>
        <button
          type="button"
          className="flex h-14 w-full shrink-0 items-center justify-between gap-2 border-b border-border px-4 text-left hover:bg-hover"
          aria-label={`Menu grup ${conv.name}`}
        >
          <span className="truncate font-semibold">{conv.name}</span>
          <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
        </button>
      </GroupMenu>
      <div className="p-2">
        <NavLink
          to={`/g/${id}`}
          className={({ isActive }) =>
            cn('flex min-h-10 items-center gap-2 rounded-md px-2 text-sm font-medium', isActive ? 'bg-hover text-foreground' : 'text-muted-foreground hover:bg-hover')
          }
        >
          <Hash className="size-5" aria-hidden="true" />
          obrolan
        </NavLink>
      </div>
    </div>
  )
}

export function Sidebar() {
  const group = useMatch('/g/:id')
  return (
    <aside className="flex min-w-0 flex-1 flex-col bg-sidebar md:w-60 md:flex-none">
      {group?.params.id ? <GroupSidebar id={group.params.id} /> : <ConversationList />}
      <UserPanel />
    </aside>
  )
}
