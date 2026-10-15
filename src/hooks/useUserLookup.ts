import { useCallback } from 'react'
import { useObrol } from '@/store/obrol'
import { ME_ID, type User } from '@/types'

/** Cari pengguna berdasarkan id (termasuk diri sendiri). */
export function useUserLookup(): (id: string) => User | undefined {
  const me = useObrol((s) => s.me)
  const users = useObrol((s) => s.users)
  return useCallback((id: string) => (id === ME_ID ? me : users[id]), [me, users])
}
