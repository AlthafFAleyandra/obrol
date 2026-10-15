import { MessagesSquare } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-elevated text-accent">
        <MessagesSquare className="size-8" aria-hidden="true" />
      </span>
      <h1 className="text-lg font-semibold">Pilih obrolan</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Pilih percakapan di samping atau cari kontak untuk memulai pesan baru.
      </p>
    </div>
  )
}
