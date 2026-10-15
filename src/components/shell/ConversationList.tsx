import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { UserAvatar } from '@/components/UserAvatar'
import { Input } from '@/components/ui/input'
import { formatBadge, previewText } from '@/lib/chat'
import { conversationName, lastMessageOf, myConversationIds, otherMemberIds } from '@/lib/convo'
import { formatRelative } from '@/lib/time'
import { cn } from '@/lib/utils'
import { useNow } from '@/hooks/useNow'
import { useUnread } from '@/hooks/useUnread'
import { obrolStore, useObrol } from '@/store/obrol'
import { ME_ID } from '@/types'

export function ConversationList() {
  const navigate = useNavigate()
  const conversations = useObrol((s) => s.conversations)
  const members = useObrol((s) => s.members)
  const messages = useObrol((s) => s.messages)
  const users = useObrol((s) => s.users)
  const presence = useObrol((s) => s.presence)
  const unread = useUnread()
  const now = useNow()
  const [query, setQuery] = useState('')

  const dms = useMemo(
    () =>
      Object.values(conversations)
        .filter((c) => c.type === 'direct' && myConversationIds(members).has(c.id))
        .sort((a, b) => b.lastMessageAt - a.lastMessageAt),
    [conversations, members],
  )

  const q = query.trim().toLowerCase()
  const results = useMemo(
    () =>
      q
        ? Object.values(users).filter(
            (u) => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
          )
        : [],
    [q, users],
  )

  function openContact(userId: string) {
    const id = obrolStore.getState().startDirect(userId)
    setQuery('')
    navigate(`/dm/${id}`)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari atau mulai obrolan"
            aria-label="Cari atau mulai obrolan"
            className="bg-rail pr-10 pl-9"
          />
          {query && (
            <button
              type="button"
              aria-label="Hapus pencarian"
              onClick={() => setQuery('')}
              className="absolute top-1/2 right-0 inline-flex size-10 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-2">
        {q ? (
          <ul aria-label="Hasil pencarian" className="flex flex-col gap-0.5">
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">Tidak ada kontak yang cocok</li>
            )}
            {results.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => openContact(u.id)}
                  className="flex min-h-12 w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-hover"
                >
                  <UserAvatar name={u.displayName} seed={u.id} src={u.avatarUrl} online={presence[u.id]} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{u.displayName}</span>
                    <span className="block truncate text-xs text-muted-foreground">{u.email}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <h2 className="px-2 pt-1 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Pesan langsung
            </h2>
            <ul className="flex flex-col gap-0.5">
              {dms.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Belum ada obrolan. Cari kontak di atas untuk memulai.
                </li>
              )}
              {dms.map((c) => {
                const otherId = otherMemberIds(members, c.id)[0]
                const other = otherId ? users[otherId] : undefined
                const last = lastMessageOf(messages[c.id])
                const count = unread[c.id] ?? 0
                return (
                  <li key={c.id}>
                    <NavLink
                      to={`/dm/${c.id}`}
                      className={({ isActive }) =>
                        cn(
                          'flex min-h-14 items-center gap-3 rounded-md px-2 py-1.5 hover:bg-hover',
                          isActive && 'bg-hover',
                        )
                      }
                    >
                      <UserAvatar
                        name={conversationName(c, members, users)}
                        seed={otherId}
                        src={other?.avatarUrl}
                        online={otherId ? presence[otherId] : undefined}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={cn('truncate text-sm', count > 0 ? 'font-bold' : 'font-medium')}>
                            {conversationName(c, members, users)}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {last ? formatRelative(last.createdAt, now) : ''}
                          </span>
                        </span>
                        <span className="mt-0.5 flex items-center justify-between gap-2">
                          <span className={cn('truncate text-xs', count > 0 ? 'text-foreground' : 'text-muted-foreground')}>
                            {last?.senderId === ME_ID ? 'Kamu: ' : ''}
                            {previewText(last)}
                          </span>
                          {count > 0 && (
                            <span
                              aria-label={`${count} pesan belum dibaca`}
                              className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-danger px-1.5 text-xs font-bold text-danger-foreground"
                            >
                              {formatBadge(count)}
                            </span>
                          )}
                        </span>
                      </span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
