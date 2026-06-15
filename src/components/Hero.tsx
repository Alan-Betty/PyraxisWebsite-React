import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTypewriter } from '../hooks/useTypewriter'

const BOOT = [
  '$ pyraxis --init',
  'loading privacy engine ........ ok',
  'mounting tracker firewall ..... ok',
  'spawning render pipeline ...... ok',
  'ready.',
]

export default function Hero() {
  const { rendered } = useTypewriter(BOOT, 22, 240)
  const [mockUrl, setMockUrl] = useState('')

  useEffect(() => {
    const full = 'pyraxis://new-tab — nothing tracked'
    let i = 0
    const id = setInterval(() => {
      setMockUrl(full.slice(0, i))
      i++
      if (i > full.length) clearInterval(id)
    }, 30)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative px-5 pt-16 pb-24 border-b border-line">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        {/* left: headline */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="kicker">[ browser / v0.9.2-beta ]</span>
            <span className="h-px flex-1 bg-line" />
            <span className="kicker text-flame">2026</span>
          </div>

          <h1 className="display text-[clamp(3rem,9vw,7rem)] mb-2">
            <span className="block">fast.</span>
            <span className="block">private.</span>
            <span className="block">
              <span className="flame-text">yours</span>
              <span className="caret align-middle" />
            </span>
          </h1>

          <p className="font-mono text-[15px] text-[var(--fg-dim)] max-w-md mt-8 leading-relaxed">
            A browser that forgets you on purpose. Zero trackers, signed updates,
            and a tool suite built for everyone — shipped as open source.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-10">
            <a
              href="#download"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#download')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="group inline-flex items-center gap-3 h-12 px-6 bg-flame text-black font-bold tracking-wide hover:bg-ember transition-colors"
            >
              ./download
              <span className="font-mono text-xs opacity-70 group-hover:translate-x-1 transition-transform">↵</span>
            </a>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-flex items-center gap-2 h-12 px-6 border border-line hover:border-flame transition-colors text-[var(--fg-dim)] hover:text-[var(--fg)]"
            >
              man pyraxis
            </a>
          </div>

          <div className="flex flex-wrap gap-x-7 gap-y-2 mt-10 kicker">
            <span>◦ open-source core</span>
            <span>◦ zero telemetry</span>
            <span>◦ signed builds</span>
          </div>
        </div>

        {/* right: terminal + browser mock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative"
        >
          {/* terminal */}
          <div className="border border-line bg-ink-2 light:bg-bone/30 font-mono text-[12px] shadow-[8px_8px_0_0_var(--hair)]">
            <div className="flex items-center gap-2 px-3 h-8 border-b border-line">
              <span className="w-2.5 h-2.5 rounded-full bg-flame" />
              <span className="w-2.5 h-2.5 rounded-full border border-line" />
              <span className="w-2.5 h-2.5 rounded-full border border-line" />
              <span className="ml-2 text-[var(--fg-dim)]">zsh — pyraxis</span>
            </div>
            <div className="p-4 min-h-[148px] leading-relaxed">
              {rendered.map((l, i) => (
                <div key={i} className={l.includes('ok') || l === 'ready.' ? '' : 'text-[var(--fg-dim)]'}>
                  {l.startsWith('$') ? <span className="text-flame">{l}</span> : l}
                  {l.includes('ok') && <span className="text-flame"> ✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* browser chrome mock overlapping */}
          <div className="relative -mt-4 ml-8 border border-line bg-ink light:bg-bg-2 shadow-[8px_8px_0_0_var(--color-flame-dim)]">
            <div className="flex items-center gap-2 px-3 h-9 border-b border-line">
              <span className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-flame/80" />
                <span className="w-2.5 h-2.5 rounded-full border border-line" />
              </span>
              <span className="flex-1 mx-2 h-5 px-2 border border-line bg-ink-2 light:bg-bone/40 text-[11px] flex items-center text-[var(--fg-dim)] truncate">
                {mockUrl}<span className="animate-blink">_</span>
              </span>
              <span className="kicker text-[9px]">⛨ secure</span>
            </div>
            <div className="grid grid-cols-3 gap-px bg-line">
              {['no ads', 'no trackers', '0 cookies', 'reader', 'AI tabs', 'shields'].map((t) => (
                <div key={t} className="bg-ink light:bg-bg-2 px-3 py-4 text-[11px] text-[var(--fg-dim)] hover:text-flame transition-colors">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
