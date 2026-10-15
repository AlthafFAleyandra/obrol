import { useState } from 'react'
import { toast } from 'sonner'
import { ContactPicker } from '@/components/ContactPicker'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { canAddMembers, remainingSlots } from '@/lib/groups'
import { obrolStore, useObrol } from '@/store/obrol'
import { ME_ID } from '@/types'

function Form({ conversationId, onDone }: { conversationId: string; onDone: () => void }) {
  const members = useObrol((s) => s.members)
  const [selected, setSelected] = useState<string[]>([])
  const current = members.filter((m) => m.conversationId === conversationId)
  const slots = remainingSlots(current.length)
  const check = canAddMembers(members, conversationId, ME_ID, selected.length)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!check.ok) return
    obrolStore.getState().addGroupMembers(conversationId, selected)
    toast.success(`${selected.length} anggota ditambahkan`)
    onDone()
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Tambah anggota</DialogTitle>
        <DialogDescription>
          {slots > 0 ? `Masih bisa menambah ${slots} anggota (maksimal 20).` : 'Grup sudah penuh (maksimal 20 anggota).'}
        </DialogDescription>
      </DialogHeader>
      <ContactPicker
        selected={selected}
        max={slots}
        excludeIds={current.map((m) => m.userId)}
        onToggle={(id) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))}
      />
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onDone}>Batal</Button>
        <Button type="submit" disabled={!check.ok}>Tambahkan{selected.length > 0 ? ` (${selected.length})` : ''}</Button>
      </DialogFooter>
    </form>
  )
}

export function AddMembersDialog({ conversationId, open, onOpenChange }: { conversationId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>{open && <Form conversationId={conversationId} onDone={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  )
}
