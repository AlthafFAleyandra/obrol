import { useEffect, useState } from 'react'

/** Jam yang diperbarui berkala agar waktu relatif ikut berubah. Timer dibersihkan saat dilepas. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
