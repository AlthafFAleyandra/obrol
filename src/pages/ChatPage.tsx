import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { Composer } from '@/components/chat/Composer'
import { ImageLightbox } from '@/components/chat/ImageLightbox'
import { MemberList } from '@/components/chat/MemberList'
import { MessageList } from '@/components/chat/MessageList'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { conversationName, otherMemberIds } from '@/lib/convo'
import { obrolStore, useObrol } from '@/store/obrol'
import { ME_ID } from '@/types'

function ChatView({ conversationId }: { conversationId: string }) {
  const conv = useObrol((s) => s.conversations[conversationId])
  const members = useObrol((s) => s.members)
  const users = useObrol((s) => s.users)
  const presence = useObrol((s) => s.presence)
  const wide = useMediaQuery('(min-width: 1280px)')
  const [inlineMembers, setInlineMembers] = useState(true)
  const [drawer, setDrawer] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  // pesan belum dibaca pertama, ditangkap sebelum percakapan ditandai dibaca
  const [firstUnreadId] = useState(() => {
    const s = obrolStore.getState()
    const mine = s.members.find((m) => m.conversationId === conversationId && m.userId === ME_ID)
    const list = s.messages[conversationId] ?? []
    return list.find((m) => m.senderId !== ME_ID && mine && m.createdAt > mine.lastReadAt)?.id ?? null
  })

  useEffect(() => {
    obrolStore.getState().openConversation(conversationId)
    return () => obrolStore.getState().openConversation(null)
  }, [conversationId])

  if (!conv) return null
  const isGroup = conv.type === 'group'
  const name = conversationName(conv, members, users)
  const otherId = isGroup ? undefined : otherMemberIds(members, conversationId)[0]
  const memberCount = members.filter((m) => m.conversationId === conversationId).length
  const showInline = isGroup && wide && inlineMembers

  return (
    <div className="flex h-full min-w-0">
      <section className="flex min-w-0 flex-1 flex-col" aria-label={`Obrolan ${name}`}>
        <ChatHeader
          type={conv.type}
          name={name}
          online={otherId ? presence[otherId] : undefined}
          lastSeenAt={otherId ? users[otherId]?.lastSeenAt : undefined}
          memberCount={memberCount}
          membersActive={wide ? inlineMembers : drawer}
          onToggleMembers={() => (wide ? setInlineMembers((v) => !v) : setDrawer((v) => !v))}
        />
        <MessageList
          conversationId={conversationId}
          firstUnreadId={firstUnreadId}
          onOpenImage={setLightbox}
          emptyLabel={isGroup ? `Ini awal obrolan di #obrolan ${name}. Kirim pesan pertama!` : `Ini awal obrolanmu dengan ${name}. Sapa dulu, yuk!`}
        />
        <Composer conversationId={conversationId} placeholder={isGroup ? 'Kirim pesan ke #obrolan' : `Kirim pesan ke @${name}`} />
      </section>

      {showInline && (
        <aside className="hidden w-60 shrink-0 bg-sidebar xl:block">
          <MemberList conversationId={conversationId} />
        </aside>
      )}

      {isGroup && !wide && (
        <Sheet open={drawer} onOpenChange={setDrawer}>
          <SheetContent>
            <SheetTitle>Anggota</SheetTitle>
            <SheetDescription>Daftar anggota grup</SheetDescription>
            <MemberList conversationId={conversationId} />
          </SheetContent>
        </Sheet>
      )}
      <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  )
}

export default function ChatPage() {
  const { conversationId = '' } = useParams()
  const exists = useObrol(
    (s) => !!s.conversations[conversationId] && s.members.some((m) => m.conversationId === conversationId && m.userId === ME_ID),
  )
  if (!exists) return <Navigate to="/" replace />
  return <ChatView key={conversationId} conversationId={conversationId} />
}
