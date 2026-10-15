import { LogOut, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { AddMembersDialog } from '@/components/groups/AddMembersDialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { isAdmin } from '@/lib/groups'
import { obrolStore, useObrol } from '@/store/obrol'
import { ME_ID } from '@/types'

export function GroupMenu({ conversationId, children }: { conversationId: string; children: React.ReactNode }) {
  const navigate = useNavigate()
  const members = useObrol((s) => s.members)
  const name = useObrol((s) => s.conversations[conversationId]?.name)
  const [addOpen, setAddOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const admin = isAdmin(members, conversationId, ME_ID)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {admin && (
            <>
              <DropdownMenuItem onSelect={() => setAddOpen(true)}>
                <UserPlus /> Tambah anggota
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem variant="danger" onSelect={() => setLeaveOpen(true)}>
            <LogOut /> Keluar grup
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddMembersDialog conversationId={conversationId} open={addOpen} onOpenChange={setAddOpen} />

      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keluar dari "{name}"?</DialogTitle>
            <DialogDescription>Kamu tidak akan menerima pesan dari grup ini lagi.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLeaveOpen(false)}>Batal</Button>
            <Button
              variant="destructive"
              onClick={() => {
                obrolStore.getState().leaveGroup(conversationId)
                setLeaveOpen(false)
                navigate('/', { replace: true })
                toast.success('Kamu keluar dari grup')
              }}
            >
              Keluar grup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
