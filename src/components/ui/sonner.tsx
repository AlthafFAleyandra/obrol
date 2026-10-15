import { Toaster as Sonner } from 'sonner'
import { useObrol } from '@/store/obrol'

export function Toaster() {
  const theme = useObrol((s) => s.settings.theme)
  return (
    <Sonner
      theme={theme}
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'var(--elevated)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
      }}
    />
  )
}
