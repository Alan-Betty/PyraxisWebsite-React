// Staff endpoints: account lifecycle. Moderators manage premium customers; only admins touch staff accounts.
import type { AccountStatus, PublicUser, Role, Tier, User } from '../types'
import { ApiError, hashPassword, latency, mutate, now, randomSalt, readDb, tempPassword, uid } from '../store'
import { MIN_PASSWORD, requireActor, toPublic } from '../auth'
import { can } from '../permissions'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function listAccounts(): Promise<PublicUser[]> {
  requireActor('accounts')
  return readDb()
    .users.map(toPublic)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function guardTarget(actor: User, target: { role: Role }, nextRole?: Role) {
  const touchesStaff = target.role !== 'premium' || (nextRole !== undefined && nextRole !== 'premium')
  if (touchesStaff && !can(actor.role, 'staff')) throw new ApiError('Only admins can manage staff accounts.', 403)
}

function activeAdmins(users: User[]) {
  return users.filter((u) => u.role === 'admin' && u.status === 'active').length
}

export interface AccountInput {
  email: string
  name: string
  phone: string
  role: Role
  tier: Tier
}

function cleanInput(input: AccountInput) {
  const email = input.email.trim().toLowerCase()
  if (!EMAIL_RE.test(email)) throw new ApiError('Enter a valid email address.')
  if (!input.name.trim()) throw new ApiError('Name is required.')
  return { ...input, email, name: input.name.trim(), phone: input.phone.trim() }
}

/** Create a pre-made account. Returns the one-time password to hand to the customer. */
export async function createAccount(input: AccountInput, password?: string): Promise<{ user: PublicUser; password: string }> {
  const actor = requireActor('accounts')
  guardTarget(actor, { role: 'premium' }, input.role)
  await latency()
  const data = cleanInput(input)
  if (readDb().users.some((u) => u.email === data.email)) throw new ApiError('An account with that email already exists.')
  const pw = password?.trim() || tempPassword()
  if (pw.length < MIN_PASSWORD) throw new ApiError(`Password must be at least ${MIN_PASSWORD} characters.`)
  const salt = randomSalt()
  const user: User = {
    id: uid('usr'),
    ...data,
    status: 'active',
    salt,
    passwordHash: await hashPassword(pw, salt),
    mustChangePassword: true,
    shipping: null,
    billing: null,
    billingSameAsShipping: true,
    createdAt: now(),
    lastLoginAt: null,
  }
  mutate((db) => {
    db.users.push(user)
  })
  return { user: toPublic(user), password: pw }
}

export async function updateAccount(id: string, input: AccountInput): Promise<PublicUser> {
  const actor = requireActor('accounts')
  await latency()
  const data = cleanInput(input)
  return toPublic(
    mutate((db) => {
      const u = db.users.find((x) => x.id === id)
      if (!u) throw new ApiError('Account not found.', 404)
      guardTarget(actor, u, data.role)
      if (db.users.some((x) => x.email === data.email && x.id !== id)) throw new ApiError('Another account already uses that email.')
      if (u.id === actor.id && data.role !== u.role) throw new ApiError("You can't change your own role.")
      if (u.role === 'admin' && data.role !== 'admin' && activeAdmins(db.users) <= 1) throw new ApiError('Keep at least one active admin.')
      Object.assign(u, data)
      return u
    }),
  )
}

export async function resetPassword(id: string): Promise<string> {
  const actor = requireActor('accounts')
  await latency()
  const target = readDb().users.find((x) => x.id === id)
  if (!target) throw new ApiError('Account not found.', 404)
  guardTarget(actor, target)
  const pw = tempPassword()
  const salt = randomSalt()
  const passwordHash = await hashPassword(pw, salt)
  mutate((db) => {
    const u = db.users.find((x) => x.id === id)!
    Object.assign(u, { salt, passwordHash, mustChangePassword: true })
  })
  return pw
}

export async function setAccountStatus(id: string, status: AccountStatus): Promise<void> {
  const actor = requireActor('accounts')
  await latency()
  mutate((db) => {
    const u = db.users.find((x) => x.id === id)
    if (!u) throw new ApiError('Account not found.', 404)
    guardTarget(actor, u)
    if (u.id === actor.id) throw new ApiError("You can't suspend or close your own account.")
    if (u.status === 'terminated' && status !== 'terminated') throw new ApiError('Closed accounts cannot be reopened. Create a new one.')
    if (u.role === 'admin' && status !== 'active' && activeAdmins(db.users) <= 1) throw new ApiError('Keep at least one active admin.')
    u.status = status
  })
}
