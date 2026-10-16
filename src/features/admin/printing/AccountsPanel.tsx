import { useState } from 'react'
import { Copy, KeyRound, Pencil, Search, UserPlus } from 'lucide-react'
import type { PublicUser, Role, Tier } from '../../../api/types'
import { createAccount, listAccounts, resetPassword, setAccountStatus, updateAccount, type AccountInput } from '../../../api/admin/accounts'
import { can } from '../../../api/permissions'
import { useAuth } from '../../../auth/auth-context'
import { useAction, useQuery } from '../../../hooks/useQuery'
import { formatDate } from '../../../lib/format'
import { Badge, Button, Empty, Field, Input, Loading, Modal, Notice, Select, SubTabs, TextField } from '../../../components/ui/ui'

const TIERS: Tier[] = ['silver', 'gold', 'platinum']
type RoleFilter = 'all' | Role

export default function AccountsPanel() {
  const { user: me } = useAuth()
  const { data: users = [], loading } = useQuery(listAccounts)
  const [filter, setFilter] = useState<RoleFilter>('premium')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<PublicUser | 'new' | null>(null)
  const [secret, setSecret] = useState<{ email: string; password: string; created: boolean } | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const reset = useAction(resetPassword)
  const status = useAction(setAccountStatus)
  const canStaff = can(me?.role, 'staff')

  const shown = users.filter((u) => (filter === 'all' || u.role === filter) && `${u.name} ${u.email}`.toLowerCase().includes(q.trim().toLowerCase()))
  const error = reset.error || status.error

  if (loading) return <Loading />

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SubTabs
          label="Filter by role"
          value={filter}
          onChange={setFilter}
          tabs={(['premium', 'moderator', 'admin', 'all'] as RoleFilter[]).map((r) => ({ id: r, label: `${r} · ${r === 'all' ? users.length : users.filter((u) => u.role === r).length}` }))}
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-dim)]" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="name or email" aria-label="Search accounts" className="pl-9" />
          </div>
          <Button onClick={() => setEditing('new')}>
            <UserPlus size={14} /> New account
          </Button>
        </div>
      </div>

      {error && <Notice tone="error">{error}</Notice>}
      {flash && (
        <Notice tone="ok" onDismiss={() => setFlash(null)}>
          {flash}
        </Notice>
      )}

      {shown.length === 0 ? (
        <Empty title="No accounts match" />
      ) : (
        <div className="border border-line soft overflow-x-auto">
          <table className="w-full text-left font-mono simple:font-sans text-[12px] min-w-[860px]">
            <thead>
              <tr className="kicker text-[9px] border-b border-line">
                <th className="px-4 py-3 font-normal">account</th>
                <th className="px-4 py-3 font-normal">role · tier</th>
                <th className="px-4 py-3 font-normal">status</th>
                <th className="px-4 py-3 font-normal">last sign-in</th>
                <th className="px-4 py-3 font-normal text-right">actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => {
                const staffRow = u.role !== 'premium'
                const locked = (staffRow && !canStaff) || u.status === 'terminated'
                const self = u.id === me?.id
                return (
                  <tr key={u.id} className={`border-b border-line last:border-b-0 ${u.status === 'active' ? '' : 'opacity-60'}`}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[13px] text-[var(--fg)]">
                        {u.name} {self && <span className="kicker text-[8px] text-flame">you</span>}
                      </div>
                      <div className="text-[var(--fg-dim)] text-[11px] mt-0.5">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Badge tone={staffRow ? 'flame' : 'muted'}>{u.role}</Badge>
                        {u.role === 'premium' && <Badge>{u.tier}</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={u.status === 'active' ? 'ok' : u.status === 'suspended' ? 'warn' : 'bad'}>{u.status}</Badge>
                      {u.mustChangePassword && u.status === 'active' && <div className="kicker text-[8px] mt-1">temp password</div>}
                    </td>
                    <td className="px-4 py-3 text-[var(--fg-dim)]">{formatDate(u.lastLoginAt, true)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end flex-wrap gap-1.5">
                        <Button size="sm" variant="ghost" disabled={locked} onClick={() => setEditing(u)} aria-label={`Edit ${u.name}`}>
                          <Pencil size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={locked}
                          onClick={async () => {
                            if (!confirm(`Reset ${u.name}'s password? Their current password stops working immediately.`)) return
                            const r = await reset.run(u.id)
                            if (r.ok) setSecret({ email: u.email, password: r.value, created: false })
                          }}
                        >
                          <KeyRound size={12} /> Reset
                        </Button>
                        {u.status === 'active' ? (
                          <Button size="sm" variant="ghost" disabled={locked || self} onClick={() => status.run(u.id, 'suspended').then((r) => r.ok && setFlash(`${u.name} is suspended and signed out.`))}>
                            Suspend
                          </Button>
                        ) : u.status === 'suspended' ? (
                          <Button size="sm" variant="ghost" disabled={locked} onClick={() => status.run(u.id, 'active').then((r) => r.ok && setFlash(`${u.name} can sign in again.`))}>
                            Reactivate
                          </Button>
                        ) : null}
                        {u.status !== 'terminated' && (
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={locked || self}
                            onClick={async () => {
                              if (!confirm(`Close ${u.name}'s account for good? Their orders stay on record but they can never sign in again.`)) return
                              const r = await status.run(u.id, 'terminated')
                              if (r.ok) setFlash(`${u.name}'s account is closed.`)
                            }}
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <AccountEditor
          user={editing === 'new' ? null : editing}
          canStaff={canStaff}
          isSelf={editing !== 'new' && editing.id === me?.id}
          onClose={() => setEditing(null)}
          onCreated={(email, password) => {
            setEditing(null)
            setSecret({ email, password, created: true })
          }}
          onSaved={(name) => {
            setEditing(null)
            setFlash(`Saved ${name}.`)
          }}
        />
      )}
      {secret && <SecretModal {...secret} onClose={() => setSecret(null)} />}
    </div>
  )
}

function AccountEditor({
  user,
  canStaff,
  isSelf,
  onClose,
  onCreated,
  onSaved,
}: {
  user: PublicUser | null
  canStaff: boolean
  isSelf: boolean
  onClose: () => void
  onCreated: (email: string, password: string) => void
  onSaved: (name: string) => void
}) {
  const [form, setForm] = useState<AccountInput>({
    email: user?.email ?? '',
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    role: user?.role ?? 'premium',
    tier: user?.tier ?? 'silver',
  })
  const [password, setPassword] = useState('')
  const save = useAction(async () => {
    if (user) {
      await updateAccount(user.id, form)
      return null
    }
    return createAccount(form, password)
  })
  const set = <K extends keyof AccountInput>(k: K, v: AccountInput[K]) => setForm((f) => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const r = await save.run()
    if (!r.ok) return
    if (r.value) onCreated(r.value.user.email, r.value.password)
    else onSaved(form.name)
  }

  return (
    <Modal title={user ? `edit · ${user.name}` : 'create pre-made account'} onClose={onClose}>
      <form onSubmit={submit} className="grid grid-cols-1 gap-4">
        <TextField label="full name" required value={form.name} onChange={(e) => set('name', e.target.value)} />
        <TextField label="email (login)" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
        <TextField label="phone / whatsapp" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="role" hint={canStaff ? undefined : 'admins create staff accounts'}>
            <Select value={form.role} onChange={(e) => set('role', e.target.value as Role)} disabled={!canStaff || isSelf}>
              <option value="premium">Premium customer</option>
              {canStaff && <option value="moderator">Moderator</option>}
              {canStaff && <option value="admin">Admin</option>}
            </Select>
          </Field>
          <Field label="tier" hint="sets queue priority">
            <Select value={form.tier} onChange={(e) => set('tier', e.target.value as Tier)}>
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {!user && <TextField label="initial password, optional" value={password} onChange={(e) => setPassword(e.target.value)} hint="Leave blank to generate one. They must change it at first sign-in." />}
        {save.error && <Notice tone="error">{save.error}</Notice>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.pending}>
            {user ? 'Save' : 'Create account'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function SecretModal({ email, password, created, onClose }: { email: string; password: string; created: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const text = `Pyraxis portal login\nEmail: ${email}\nTemporary password: ${password}\nSign in at ${window.location.origin}/login — you'll be asked to set your own password.`
  return (
    <Modal title={created ? 'account created' : 'password reset'} onClose={onClose}>
      <p className="font-mono simple:font-sans text-[13px] text-[var(--fg-dim)] mb-4">Share this once — it won't be shown again. They'll pick their own password at first sign-in.</p>
      <div className="border border-flame/60 p-4 font-mono text-[13px] grid grid-cols-1 gap-1 simple:rounded-lg">
        <div>
          <span className="text-[var(--fg-dim)]">email </span>
          {email}
        </div>
        <div>
          <span className="text-[var(--fg-dim)]">password </span>
          <span className="text-flame font-bold select-all">{password}</span>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button
          variant="ghost"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text)
              setCopied(true)
            } catch {
              setCopied(false)
            }
          }}
        >
          <Copy size={13} /> {copied ? 'Copied' : 'Copy login message'}
        </Button>
        <Button onClick={onClose}>Done</Button>
      </div>
    </Modal>
  )
}
