import { Navigate, Outlet, Route, Routes } from 'react-router'
import AppShell from '@/components/shell/AppShell'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useQuotaToast, useSimulationEffect, useThemeEffect } from '@/hooks/app'
import ChatPage from '@/pages/ChatPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import OnboardingPage from '@/pages/OnboardingPage'
import SettingsPage from '@/pages/SettingsPage'
import { useObrol } from '@/store/obrol'

function RequireAuth() {
  const loggedIn = useObrol((s) => s.auth.loggedIn)
  const onboarded = useObrol((s) => s.auth.onboarded)
  if (!loggedIn) return <Navigate to="/login" replace />
  if (!onboarded) return <Navigate to="/onboarding" replace />
  return <Outlet />
}

function RequireLogin() {
  const loggedIn = useObrol((s) => s.auth.loggedIn)
  return loggedIn ? <Outlet /> : <Navigate to="/login" replace />
}

export default function App() {
  useThemeEffect()
  useSimulationEffect()
  useQuotaToast()

  return (
    <TooltipProvider delayDuration={200}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireLogin />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="dm/:conversationId" element={<ChatPage />} />
            <Route path="g/:conversationId" element={<ChatPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </TooltipProvider>
  )
}
