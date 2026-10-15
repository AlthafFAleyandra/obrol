import { useEffect } from 'react'
import { toast } from 'sonner'
import { simulation } from '@/sim'
import { onStorageQuotaExceeded } from '@/store/storage'
import { useObrol } from '@/store/obrol'

/** Terapkan tema ke <html> dan simpan ke kunci terpisah yang dibaca skrip anti-kedip di index.html. */
export function useThemeEffect() {
  const theme = useObrol((s) => s.settings.theme)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('obrol-theme', theme)
    } catch {
      // abaikan
    }
  }, [theme])
}

/** Jalankan mesin simulasi hanya saat login dan saklar nyala; bersihkan semua timer saat berhenti. */
export function useSimulationEffect() {
  const enabled = useObrol((s) => s.settings.simulationEnabled)
  const loggedIn = useObrol((s) => s.auth.loggedIn)
  useEffect(() => {
    if (!enabled || !loggedIn) return
    simulation.start()
    return () => simulation.stop()
  }, [enabled, loggedIn])
}

export function useQuotaToast() {
  useEffect(() => {
    let last = 0
    onStorageQuotaExceeded(() => {
      if (Date.now() - last < 5000) return
      last = Date.now()
      toast.warning('Gambar tidak tersimpan setelah refresh')
    })
    return () => onStorageQuotaExceeded(null)
  }, [])
}
