import type { ReactNode } from 'react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from './Header'
import TerminalBackground from './TerminalBackground'
import { useAuth } from '../auth/auth-context'
import { Badge } from './ui/ui'
import { btnClass } from './ui/styles'

/** Page frame for signed-in areas (portal, admin): site header, identity strip, slim footer. */
export default function AccountShell({ kicker, title, children }: { kicker: string; title: ReactNode; children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen grain overflow-hidden flex flex-col">
      <TerminalBackground />
      <Header />
      <main className="flex-1 px-5 py-10 md:py-14">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <span className="kicker">{kicker}</span>
              <h1 className="display text-[clamp(2rem,5vw,3.5rem)] mt-2">{title}</h1>
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-display simple:font-sans font-semibold text-[15px] leading-tight">{user.name}</div>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <Badge tone="flame">{user.role}</Badge>
                    {user.role === 'premium' && <Badge>{user.tier}</Badge>}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await logout()
                    navigate('/login')
                  }}
                  className={btnClass('ghost', 'md')}
                >
                  <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            )}
          </div>
          {children}
        </div>
      </main>
      <footer className="border-t border-line">
        <div className="max-w-7xl mx-auto px-5 py-5 flex flex-wrap justify-between gap-2 kicker text-[10px]">
          <span>© 2026 pyraxis · 3d printing</span>
          <span>need a hand? message us on whatsapp</span>
        </div>
      </footer>
    </div>
  )
}
