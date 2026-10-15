import { useObrol } from '@/store/obrol'
import { useUserLookup } from '@/hooks/useUserLookup'

export function TypingIndicator({ conversationId }: { conversationId: string }) {
  const typing = useObrol((s) => s.typing[conversationId])
  const lookup = useUserLookup()
  if (!typing || typing.length === 0) return <span />
  const names = typing.map((id) => lookup(id)?.displayName.split(' ')[0] ?? 'Seseorang')
  const label =
    names.length === 1
      ? `${names[0]} sedang mengetik...`
      : names.length === 2
        ? `${names[0]} dan ${names[1]} sedang mengetik...`
        : 'Beberapa orang sedang mengetik...'
  return (
    <span role="status" className="truncate font-medium text-foreground">
      <span className="mr-1.5 inline-flex gap-0.5 align-middle" aria-hidden="true">
        <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="size-1 animate-bounce rounded-full bg-muted-foreground" />
      </span>
      {label}
    </span>
  )
}
