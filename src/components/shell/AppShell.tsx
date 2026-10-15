import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { cn } from '@/lib/utils'
import { CreateGroupDialog } from '@/components/groups/CreateGroupDialog'
import { Rail } from './Rail'
import { Sidebar } from './Sidebar'

/** Mobile: layar 1 = rail + sidebar, layar 2 = konten penuh. Tablet ke atas: rail + sidebar + konten. */
export default function AppShell() {
  const { pathname } = useLocation()
  const isDetail = pathname !== '/'
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <div className={cn('min-w-0 flex-1 md:flex-none', isDetail ? 'hidden md:flex' : 'flex', 'md:w-[312px]')}>
        <Rail onCreateGroup={() => setCreateOpen(true)} />
        <Sidebar />
      </div>
      <main className={cn('min-w-0 flex-1 flex-col bg-background', isDetail ? 'flex' : 'hidden md:flex')}>
        <Outlet />
      </main>
      <CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
