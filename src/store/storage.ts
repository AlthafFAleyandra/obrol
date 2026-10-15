import type { StateStorage } from 'zustand/middleware'

type QuotaListener = () => void
let quotaListener: QuotaListener | null = null

/** Didaftarkan UI untuk menampilkan toast saat penyimpanan penuh. */
export function onStorageQuotaExceeded(listener: QuotaListener | null): void {
  quotaListener = listener
}

function stripImages(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { state?: { messages?: Record<string, { imageDataUrl?: string }[]> } }
    const messages = parsed.state?.messages
    if (messages) {
      for (const list of Object.values(messages)) {
        for (const m of list) delete m.imageDataUrl
      }
    }
    return JSON.stringify(parsed)
  } catch {
    return raw
  }
}

/** localStorage dengan cadangan: jika penuh, simpan tanpa gambar dan beri tahu pengguna. */
export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      const stripped = stripImages(value)
      if (stripped !== value) quotaListener?.()
      try {
        localStorage.setItem(name, stripped)
      } catch {
        // penyimpanan benar-benar tidak tersedia; sesi tetap berjalan di memori
      }
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      // abaikan
    }
  },
}
