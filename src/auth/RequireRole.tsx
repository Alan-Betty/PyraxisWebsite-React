import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import type { Role } from '../api/types'
import { homeFor } from '../api/permissions'
import { useAuth } from './auth-context'
import AccountShell from '../components/AccountShell'
import ChangePasswordForm from './ChangePasswordForm'
import { Empty, Loading, Panel } from '../components/ui/ui'

/**
 * Route guard. Sends guests to /login (and back afterwards), keeps roles out of
 * each other's areas, and holds anyone with a temporary password at a
 * change-password step before they get in.
 */
export default function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, ready } = useAuth()
  const location = useLocation()

  if (!ready) return <Loading label="checking session" />
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />

  if (!roles.includes(user.role)) {
    return (
      <AccountShell kicker="// 403" title="not your door.">
        <Empty title="This area isn't part of your account.">
          <Link to={homeFor(user.role)} className="text-flame hover:underline">
            Go to your {user.role === 'premium' ? 'portal' : 'dashboard'} →
          </Link>
        </Empty>
      </AccountShell>
    )
  }

  if (user.mustChangePassword) {
    return (
      <AccountShell kicker="// first sign-in" title={<>set your <span className="flame-text">password</span>.</>}>
        <div className="max-w-md">
          <Panel title="change temporary password">
            <p className="font-mono simple:font-sans text-[12px] simple:text-sm text-[var(--fg-dim)] mb-5">
              You signed in with a temporary password. Choose your own to continue.
            </p>
            <ChangePasswordForm />
          </Panel>
        </div>
      </AccountShell>
    )
  }

  return <>{children}</>
}
