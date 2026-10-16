import type { Role } from './types'

export type Permission =
  | 'portal' // premium self-service
  | 'assets'
  | 'orders'
  | 'coupons'
  | 'templates'
  | 'accounts' // premium customer accounts
  | 'staff' // moderator / admin accounts
  | 'settings'

const ROLE_PERMS: Record<Role, Permission[]> = {
  premium: ['portal'],
  moderator: ['assets', 'orders', 'coupons', 'templates', 'accounts'],
  admin: ['assets', 'orders', 'coupons', 'templates', 'accounts', 'staff', 'settings'],
}

export const can = (role: Role | undefined | null, perm: Permission) => !!role && ROLE_PERMS[role].includes(perm)

export const isStaff = (role: Role | undefined | null) => role === 'admin' || role === 'moderator'

export const homeFor = (role: Role) => (isStaff(role) ? '/admin' : '/portal')
