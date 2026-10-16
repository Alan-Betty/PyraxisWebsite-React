import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, KeyRound, MessageCircle } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import TerminalBackground from '../components/TerminalBackground'
import { useAuth } from '../auth/auth-context'
import { homeFor, isStaff } from '../api/permissions'
import type { Role } from '../api/types'
import { DEMO_ACCOUNTS } from '../api/seed'
import { getConfig } from '../api/public'
import { useQuery, errorMessage } from '../hooks/useQuery'
import { whatsappLink } from '../lib/whatsapp'
import { Button, Notice, TextField } from '../components/ui/ui'
import { surface } from '../components/ui/styles'

function safeNext(next: string | null, role: Role) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return homeFor(role)
  // don't bounce a customer into /admin or staff into /portal
  if (next.startsWith('/admin') && !isStaff(role)) return homeFor(role)
  if (next.startsWith('/portal') && isStaff(role)) return homeFor(role)
  return next
}

export default function LoginPage() {
  const { user, ready, login } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const { data: cfg } = useQuery(getConfig)

  if (ready && user) return <Navigate to={safeNext(params.get('next'), user.role)} replace />

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const u = await login(email, password)
      navigate(safeNext(params.get('next'), u.role), { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setPending(false)
    }
  }

  const requestLink = cfg ? whatsappLink(cfg.whatsappNumber, "Hi Pyraxis! I'd like a premium 3D printing account.") : undefined

  return (
    <div className="relative min-h-screen grain overflow-hidden">
      <TerminalBackground />
      <Header />
      <main className="px-5 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-12 items-center">
          <div>
            <span className="kicker">
              <span className="dev-only">// auth · premium portal</span>
              <span className="simple-only">Premium portal</span>
            </span>
            <h1 className="display text-[clamp(2.6rem,7vw,5.5rem)] mt-3 mb-6">
              <span className="dev-only">
                sign in.<br />print <span className="flame-text">faster</span>.
              </span>
              <span className="simple-only">
                Sign in.<br />Print <span className="flame-text">faster</span>.
              </span>
            </h1>
            <p className="font-mono simple:font-sans text-[14px] simple:text-base text-[var(--fg-dim)] max-w-md leading-relaxed">
              Premium customers get instant quotes, model uploads, saved shipping details and priority order tracking — all in one place.
            </p>
            <ul className="mt-8 grid grid-cols-1 gap-2 font-mono simple:font-sans text-[13px] simple:text-sm text-[var(--fg-dim)]">
              {['instant quotes from weight', 'STL · OBJ · 3MF uploads', 'saved shipping & billing', 'priority queue + live tracking'].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-flame">+</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="border border-line bg-ink light:bg-[var(--bg)] shadow-[10px_10px_0_0_var(--color-flame-dim)] soft hardshadow overflow-hidden"
          >
            <div className={`flex items-center justify-between px-4 h-9 border-b border-line ${surface}`}>
              <span className="kicker text-[9px]">
                <span className="dev-only">login.sh</span>
                <span className="simple-only">Sign in</span>
              </span>
              <KeyRound size={14} className="text-flame" />
            </div>
            <form onSubmit={submit} className="p-6 grid grid-cols-1 gap-4">
              {error && <Notice tone="error">{error}</Notice>}
              <TextField label="email" type="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              <TextField label="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" size="lg" loading={pending} className="mt-1">
                <span className="dev-only">./sign-in</span>
                <span className="simple-only">Sign in</span>
                <ArrowRight size={16} />
              </Button>
              <p className="font-mono simple:font-sans text-[12px] simple:text-[13px] text-[var(--fg-dim)]">
                Forgot your password? We'll reset it —{' '}
                <a href={requestLink} target="_blank" rel="noopener noreferrer" className="text-flame hover:underline">
                  message us
                </a>
                .
              </p>
            </form>

            <div className="border-t border-line p-6 grid grid-cols-1 gap-3">
              <span className="kicker text-[10px]">no account yet?</span>
              <p className="font-mono simple:font-sans text-[12px] simple:text-[13px] text-[var(--fg-dim)]">
                Premium accounts are set up by our team. Ask on WhatsApp, or get a quick quote without signing in.
              </p>
              <div className="flex flex-wrap gap-2">
                <a href={requestLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-9 px-3 border border-line hover:border-flame text-[12px] transition-colors simple:rounded-lg">
                  <MessageCircle size={14} /> Request access
                </a>
                <Link to="/print#quote" className="inline-flex items-center gap-2 h-9 px-3 border border-line hover:border-flame text-[12px] transition-colors simple:rounded-lg">
                  Guest quote <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {import.meta.env.DEV && (
              <div className={`border-t border-line p-4 ${surface}`}>
                <span className="kicker text-[9px]">dev only · demo accounts</span>
                <div className="mt-2 grid grid-cols-1 gap-1">
                  {DEMO_ACCOUNTS.map((a) => (
                    <button
                      key={a.email}
                      type="button"
                      onClick={() => {
                        setEmail(a.email)
                        setPassword(a.password)
                      }}
                      className="flex justify-between gap-3 text-left font-mono text-[11px] text-[var(--fg-dim)] hover:text-flame"
                    >
                      <span>{a.email}</span>
                      <span>{a.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
