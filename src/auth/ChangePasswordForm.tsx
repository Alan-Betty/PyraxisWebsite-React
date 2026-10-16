import { useState } from 'react'
import { changePassword, MIN_PASSWORD } from '../api/auth'
import { useAction } from '../hooks/useQuery'
import { Button, Notice, TextField } from '../components/ui/ui'
import { useAuth } from './auth-context'

export default function ChangePasswordForm({ onDone }: { onDone?: () => void }) {
  const { refresh } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const save = useAction(changePassword)

  const mismatch = confirm.length > 0 && confirm !== next
  const tooShort = next.length > 0 && next.length < MIN_PASSWORD

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (mismatch || tooShort) return
    const r = await save.run(current, next)
    if (r.ok) {
      setDone(true)
      setCurrent('')
      setNext('')
      setConfirm('')
      await refresh()
      onDone?.()
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4">
      {done && <Notice tone="ok">Password updated.</Notice>}
      {save.error && <Notice tone="error">{save.error}</Notice>}
      <TextField label="current password" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
      <TextField
        label="new password"
        type="password"
        autoComplete="new-password"
        required
        value={next}
        onChange={(e) => setNext(e.target.value)}
        hint={`At least ${MIN_PASSWORD} characters.`}
        error={tooShort ? `At least ${MIN_PASSWORD} characters.` : null}
      />
      <TextField
        label="confirm new password"
        type="password"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={mismatch ? "Passwords don't match." : null}
      />
      <div>
        <Button type="submit" loading={save.pending} disabled={mismatch || tooShort}>
          Update password
        </Button>
      </div>
    </form>
  )
}
