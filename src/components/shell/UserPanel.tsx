import { LogOut, Settings } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router'
import { UserAvatar } from '@/components/UserAvatar'
import { Button } from '@/components/ui/button'
import { obrolStore, useObrol } from '@/store/obrol'

export function UserPanel() {
  const me = useObrol((s) => s.me)
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-2 border-t border-border bg-rail/60 p-2">
      <NavLink to="/settings" className="flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 hover:bg-hover" aria-label="Buka profil dan pengaturan">
        <UserAvatar name={me.displayName} seed={me.id} src={me.avatarUrl} size="md" online ringClass="ring-rail" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{me.displayName}</span>
          <span className="block truncate text-xs text-muted-foreground">Online</span>
        </span>
      </NavLink>
      <Button variant="ghost" size="icon" aria-label="Pengaturan" onClick={() => navigate('/settings')}>
        <Settings />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Keluar"
        onClick={() => {
          obrolStore.getState().logout()
          navigate('/login', { replace: true })
        }}
      >
        <LogOut />
      </Button>
    </div>
  )
}
