import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { AvatarPicker } from '@/components/AvatarPicker'
import { ContactPicker } from '@/components/ContactPicker'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateNewGroup } from '@/lib/groups'
import { obrolStore } from '@/store/obrol'
import { LIMITS } from '@/types'

function Form({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string | undefined>()
  const [selected, setSelected] = useState<string[]>([])
  const check = validateNewGroup(name, selected)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!check.ok) return
    const id = obrolStore.getState().createGroup(name, selected, avatar)
    toast.success(`Grup "${name.trim()}" dibuat`)
    onDone()
    navigate(`/g/${id}`)
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Buat grup</DialogTitle>
        <DialogDescription>Pilih {LIMITS.groupMembersMin} sampai {LIMITS.groupMembersMax} kontak. Kamu menjadi admin grup.</DialogDescription>
      </DialogHeader>
      <div className="scroll-thin -mx-1 flex min-h-0 flex-col gap-4 overflow-y-auto px-1">
        <AvatarPicker name={name || 'Grup'} seed="new-group" value={avatar} onChange={setAvatar} square />
        <div className="flex flex-col gap-2">
          <Label htmlFor="group-name">Nama grup</Label>
          <Input id="group-name" value={name} maxLength={LIMITS.groupName} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Geng Kosan" />
          <span className="self-end text-xs text-muted-foreground">{name.length}/{LIMITS.groupName}</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>Anggota</Label>
            <span className="text-xs text-muted-foreground" aria-live="polite">{selected.length} dipilih</span>
          </div>
          <ContactPicker
            selected={selected}
            max={LIMITS.groupMembersMax}
            onToggle={(id) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))}
          />
        </div>
      </div>
      <DialogFooter className="items-center">
        {!check.ok && (name.length > 0 || selected.length > 0) && (
          <span className="mr-auto text-xs text-muted-foreground">{check.error}</span>
        )}
        <Button type="button" variant="ghost" onClick={onDone}>Batal</Button>
        <Button type="submit" disabled={!check.ok}>Buat grup</Button>
      </DialogFooter>
    </form>
  )
}

export function CreateGroupDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">{open && <Form onDone={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  )
}
