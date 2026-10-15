import { Outlet } from 'react-router'

export default function AppShell() {
  return (
    <div className="h-full">
      <Outlet />
    </div>
  )
}
