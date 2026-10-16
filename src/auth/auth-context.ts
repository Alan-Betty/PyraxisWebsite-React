import { createContext, useContext } from 'react'
import type { PublicUser } from '../api/types'

export interface AuthValue {
  user: PublicUser | null
  ready: boolean
  login: (email: string, password: string) => Promise<PublicUser>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
