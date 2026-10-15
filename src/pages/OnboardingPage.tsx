import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AvatarPicker } from '@/components/AvatarPicker'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { obrolStore } from '@/store/obrol'
import { LIMITS, ME_ID } from '@/types'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string | undefined>()
  const trimmed = name.trim()
  const valid = trimmed.length >= 1 && trimmed.length <= LIMITS.displayName

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    obrolStore.getState().completeOnboarding(trimmed, avatar)
    navigate('/', { replace: true })
  }

  return (
    <main className="flex min-h-dvh items-center justify-center overflow-y-auto bg-rail px-4 py-8">
      <form
        onSubmit={submit}
        className="flex w-full max-w-sm flex-col gap-5 rounded-lg border border-border bg-sidebar p-6 shadow-xl sm:p-8"
      >
        <Logo />
        <div>
          <h1 className="text-lg font-semibold">Kenalan dulu, yuk</h1>
          <p className="mt-1 text-sm text-muted-foreground">Nama ini akan terlihat oleh kontakmu.</p>
        </div>
        <AvatarPicker name={name} seed={ME_ID} value={avatar} onChange={setAvatar} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nama tampilan</Label>
          <Input
            id="name"
            value={name}
            maxLength={LIMITS.displayName}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Aleya"
            autoFocus
          />
          <span className="self-end text-xs text-muted-foreground">
            {name.length}/{LIMITS.displayName}
          </span>
        </div>
        <Button type="submit" size="lg" disabled={!valid}>
          Mulai ngobrol
        </Button>
      </form>
    </main>
  )
}
