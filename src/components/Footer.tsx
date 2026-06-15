import { Mail } from 'lucide-react'
import { FaGithub, FaInstagram, FaDiscord } from 'react-icons/fa'

const SOCIALS = [
  { icon: FaGithub, href: 'https://github.com/pyraxisofficial', label: 'github' },
  { icon: FaInstagram, href: 'https://instagram.com/pyraxis.official', label: 'instagram' },
  { icon: FaDiscord, href: 'https://discord.com/users/1428016747440767001', label: 'discord' },
  { icon: Mail, href: 'mailto:pyraxis.official@gmail.com', label: 'email' },
]

export default function Footer() {
  return (
    <footer className="border-t border-line">
      {/* big wordmark */}
      <div className="max-w-7xl mx-auto px-5 pt-16">
        <div className="display text-[clamp(3rem,18vw,13rem)] leading-none text-[var(--fg)] select-none overflow-hidden">
          pyraxis<span className="flame-text">.</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-12 grid gap-10 md:grid-cols-[1fr_auto_auto] border-t border-line">
        <div>
          <span className="kicker"><span className="dev-only">// the browser that forgets you</span><span className="simple-only">The browser that forgets you</span></span>
          <p className="font-mono simple:font-sans text-[13px] simple:text-sm text-[var(--fg-dim)] max-w-xs mt-3">
            Fast, private browsing with privacy-first defaults and signed updates.
          </p>
        </div>

        <nav className="flex flex-col gap-2 font-mono simple:font-sans text-[13px] simple:text-sm text-[var(--fg-dim)]">
          <span className="kicker mb-1"><span className="dev-only">~/legal</span><span className="simple-only">Legal</span></span>
          <a href="/privacy.html" className="hover:text-flame transition-colors w-fit">privacy</a>
          <a href="/terms.html" className="hover:text-flame transition-colors w-fit">terms</a>
          <a href="/about.html" className="hover:text-flame transition-colors w-fit">about</a>
        </nav>

        <div>
          <span className="kicker block mb-3"><span className="dev-only">~/connect</span><span className="simple-only">Connect</span></span>
          <div className="flex gap-2">
            {SOCIALS.map((s) => {
              const Icon = s.icon
              return (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-10 h-10 grid place-items-center border border-line hover:border-flame hover:text-flame transition-colors"
                >
                  <Icon size={16} />
                </a>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-5 border-t border-line flex flex-wrap justify-between gap-2 kicker text-[10px]">
        <span>© 2026 pyraxis · all rights reserved</span>
        <span>built with heart · built for everyone</span>
      </div>
    </footer>
  )
}
