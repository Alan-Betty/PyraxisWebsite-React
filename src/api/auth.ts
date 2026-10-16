import type { PublicUser, Session, User } from './types'
import { ApiError, hashPassword, latency, mutate, now, randomSalt, readDb } from './store'
import { ensureDb } from './seed'
import { can, type Permission } from './permissions'

const SESSION_KEY = 'pyraxis-session'
const SESSION_DAYS = 7
export const MIN_PASSWORD = 8

export function toPublic(u: User): PublicUser {
  const pub: Partial<User> = { ...u }
  delete pub.passwordHash
  delete pub.salt
  return pub as PublicUser
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

/** Resolve the signed-in user, or null when there is no valid session. */
export function sessionUser(): User | null {
  const s = readSession()
  if (!s) return null
  if (new Date(s.expiresAt) < new Date()) {
    clearSession()
    return null
  }
  let user: User | undefined
  try {
    user = readDb().users.find((u) => u.id === s.userId)
  } catch {
    return null
  }
  if (!user || user.status !== 'active') {
    clearSession()
    return null
  }
  return user
}

/** Guard used at the top of every protected handler. */
export function requireActor(perm?: Permission): User {
  const user = sessionUser()
  if (!user) throw new ApiError('Please sign in again.', 401)
  if (perm && !can(user.role, perm)) throw new ApiError("You don't have access to that.", 403)
  return user
}

export async function currentUser(): Promise<PublicUser | null> {
  await ensureDb()
  const u = sessionUser()
  return u ? toPublic(u) : null
}

export async function login(email: string, password: string): Promise<PublicUser> {
  await ensureDb()
  await latency(300)
  const user = readDb().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  // same message for unknown email and wrong password
  const bad = new ApiError('Email or password is incorrect.', 401)
  if (!user) throw bad
  if ((await hashPassword(password, user.salt)) !== user.passwordHash) throw bad
  if (user.status === 'suspended') throw new ApiError('This account is suspended. Message us on WhatsApp to restore access.', 403)
  if (user.status === 'terminated') throw new ApiError('This account has been closed.', 403)

  const session: Session = {
    userId: user.id,
    token: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString(),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  const updated = mutate((db) => {
    const u = db.users.find((x) => x.id === user.id)!
    u.lastLoginAt = now()
    return u
  })
  return toPublic(updated)
}

export async function logout() {
  clearSession()
}

export async function changePassword(current: string, next: string): Promise<PublicUser> {
  const actor = requireActor()
  await latency()
  if (next.length < MIN_PASSWORD) throw new ApiError(`Use at least ${MIN_PASSWORD} characters.`)
  if ((await hashPassword(current, actor.salt)) !== actor.passwordHash) throw new ApiError('Current password is incorrect.')
  if (current === next) throw new ApiError('Pick a password different from the current one.')
  const salt = randomSalt()
  const passwordHash = await hashPassword(next, salt)
  return toPublic(
    mutate((db) => {
      const u = db.users.find((x) => x.id === actor.id)!
      Object.assign(u, { salt, passwordHash, mustChangePassword: false })
      return u
    }),
  )
}
