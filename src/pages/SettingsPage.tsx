import { ArrowLeft, LogOut, Moon, RotateCcw, Sun } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { AvatarPicker } from '@/components/AvatarPicker'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { obrolStore, useObrol, type Theme } from '@/store/obrol'
import { LIMITS } from '@/types'

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-sidebar p-4 sm:p-6">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function SwitchRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function ProfileForm() {
  const me = useObrol((s) => s.me)
  const [name, setName] = useState(me.displayName)
  const [bio, setBio] = useState(me.bio)
  const trimmed = name.trim()
  const nameValid = trimmed.length >= 1 && trimmed.length <= LIMITS.displayName
  const dirty = trimmed !== me.displayName || bio !== me.bio

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (!nameValid) return
    obrolStore.getState().updateProfile({ displayName: trimmed, bio })
    toast.success('Profil disimpan')
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <AvatarPicker
        name={me.displayName}
        seed={me.id}
        value={me.avatarUrl}
        onChange={(url) => {
          obrolStore.getState().updateProfile({ avatarUrl: url ?? null })
          toast.success(url ? 'Foto profil diperbarui' : 'Foto profil dihapus')
        }}
      />
      <div className="flex flex-col gap-2">
        <Label htmlFor="displayName">Nama tampilan</Label>
        <Input id="displayName" value={name} maxLength={LIMITS.displayName} onChange={(e) => setName(e.target.value)} />
        {!nameValid && <p className="text-sm text-danger">Nama wajib diisi (1 sampai {LIMITS.displayName} karakter)</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={me.email} readOnly disabled className="[overflow-wrap:anywhere]" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" value={bio} maxLength={LIMITS.bio} onChange={(e) => setBio(e.target.value)} placeholder="Ceritakan sedikit tentang dirimu" />
        <span className="self-end text-xs text-muted-foreground">
          {bio.length}/{LIMITS.bio}
        </span>
      </div>
      <Button type="submit" className="self-start" disabled={!dirty || !nameValid}>
        Simpan profil
      </Button>
    </form>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const settings = useObrol((s) => s.settings)
  const [confirmReset, setConfirmReset] = useState(false)
  const update = obrolStore.getState().updateSettings

  const themes: { value: Theme; label: string; icon: typeof Moon }[] = [
    { value: 'dark', label: 'Gelap', icon: Moon },
    { value: 'light', label: 'Terang', icon: Sun },
  ]

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Kembali ke daftar obrolan" onClick={() => navigate('/')}>
            <ArrowLeft />
          </Button>
          <h1 className="text-xl font-bold">Pengaturan</h1>
        </div>

        <Section title="Profil" description="Perubahan profil langsung terlihat di seluruh aplikasi.">
          <ProfileForm />
        </Section>

        <Section title="Tampilan">
          <div role="radiogroup" aria-label="Tema" className="grid grid-cols-2 gap-3">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={settings.theme === value}
                onClick={() => update({ theme: value })}
                className={cn(
                  'flex min-h-12 items-center justify-center gap-2 rounded-md border bg-elevated px-4 text-sm font-medium',
                  settings.theme === value ? 'border-accent text-accent' : 'border-border text-foreground',
                )}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Simulasi" description="Aplikasi ini prototipe: lawan bicara disimulasikan di browser.">
          <SwitchRow
            id="sim-enabled"
            label="Simulasi aktif"
            description="Kontak membalas, mengetik, dan berganti status online secara otomatis."
            checked={settings.simulationEnabled}
            onChange={(v) => update({ simulationEnabled: v })}
          />
          <SwitchRow
            id="sim-fail"
            label="Simulasi gagal kirim"
            description="Sekitar 20% pesan akan berstatus gagal agar tombol kirim ulang bisa dicoba."
            checked={settings.simulateFailure}
            onChange={(v) => update({ simulateFailure: v })}
          />
          <Button variant="outline" className="self-start" onClick={() => setConfirmReset(true)}>
            <RotateCcw /> Reset demo
          </Button>
        </Section>

        <Section title="Akun">
          <Button
            variant="outline"
            className="self-start"
            onClick={() => {
              obrolStore.getState().logout()
              navigate('/login', { replace: true })
            }}
          >
            <LogOut /> Keluar
          </Button>
        </Section>
      </div>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset demo?</DialogTitle>
            <DialogDescription>
              Semua percakapan dan pesan dikembalikan ke data contoh. Profil dan pengaturanmu tetap.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                obrolStore.getState().resetDemo()
                setConfirmReset(false)
                navigate('/')
                toast.success('Data demo dikembalikan')
              }}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
