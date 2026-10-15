import { LogOut, UserPlus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function GroupMenu({ children }: { conversationId: string; children: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem>
          <UserPlus /> Tambah anggota
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger">
          <LogOut /> Keluar grup
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
