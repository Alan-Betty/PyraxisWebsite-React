import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { PublicUser } from '../api/types'
import * as auth from '../api/auth'
import { subscribe } from '../api/store'
import { AuthContext, type AuthValue } from './auth-context'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    setUser(await auth.currentUser())
    setReady(true)
  }, [])

  useEffect(() => {
    // re-check the session whenever data changes: a suspension in another tab signs the user out here
    const id = setTimeout(refresh, 0)
    const unsub = subscribe(() => void refresh())
    const onStorage = (e: StorageEvent) => e.key === 'pyraxis-session' && void refresh()
    window.addEventListener('storage', onStorage)
    return () => {
      clearTimeout(id)
      unsub()
      window.removeEventListener('storage', onStorage)
    }
  }, [refresh])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      ready,
      refresh,
      login: async (email, password) => {
        const u = await auth.login(email, password)
        setUser(u)
        return u
      },
      logout: async () => {
        await auth.logout()
        setUser(null)
      },
    }),
    [user, ready, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
