import { motion } from 'framer-motion'

interface Row {
  id: string
  name: string
  flag: string
  desc: string
  tag: string
}

const ROWS: Row[] = [
  { id: '01', name: 'Privacy Firewall', flag: '--no-track', desc: 'Tracker blocking, ad filtering, strict cookie controls. Private with zero config.', tag: 'core' },
  { id: '02', name: 'Render Pipeline', flag: '--fast', desc: 'Optimized rendering + resource loading. Responsive on any machine.', tag: 'core' },
  { id: '03', name: 'Signed Updates', flag: '--secure', desc: 'Automatic signed updates + frequent security patches against emerging threats.', tag: 'core' },
  { id: '04', name: 'TerraTabs AI', flag: '--assist', desc: 'Ask, summarize, generate inline. AI assistant lives in the browser, not the cloud.', tag: 'tools' },
  { id: '05', name: 'Accessibility Suite', flag: '--a11y', desc: 'ASL guidance, Braille keyboard support, screen-reader optimization for everyone.', tag: 'tools' },
  { id: '06', name: 'Native Toolkit', flag: '--tools', desc: 'Notepad, screenshot, screen recorder, reader mode. No extensions required.', tag: 'tools' },
  { id: '07', name: 'Quick Search Switch', flag: '--search', desc: 'Swap search engines instantly. No settings menu, no friction.', tag: 'tools' },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="px-5 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <span className="kicker">// capabilities</span>
            <h2 className="display text-[clamp(2.2rem,6vw,4.5rem)] mt-3">
              what ships<br />in the <span className="flame-text">box</span>.
            </h2>
          </div>
          <p className="font-mono text-[13px] text-[var(--fg-dim)] max-w-xs">
            Every feature is a default, not an upsell. Read it like a man page.
          </p>
        </div>

        <div className="border-t border-line">
          {ROWS.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
              className="group grid grid-cols-[auto_1fr] md:grid-cols-[3rem_minmax(0,14rem)_1fr_auto] items-baseline gap-x-5 gap-y-1 py-5 border-b border-line hover:bg-flame/[0.04] transition-colors"
            >
              <span className="font-mono text-[12px] text-flame">{r.id}</span>
              <h3 className="font-display font-semibold text-lg group-hover:translate-x-1 transition-transform">
                {r.name}
              </h3>
              <p className="font-mono text-[13px] text-[var(--fg-dim)] leading-relaxed col-span-2 md:col-span-1">
                {r.desc}
              </p>
              <div className="flex items-center gap-3 col-start-2 md:col-start-auto">
                <code className="font-mono text-[11px] text-flame border border-line px-2 py-0.5">{r.flag}</code>
                <span className="kicker text-[9px]">{r.tag}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
