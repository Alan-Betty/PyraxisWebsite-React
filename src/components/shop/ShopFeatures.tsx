import { motion } from 'framer-motion'

const FEATURES = [
  { id: '01', title: 'Braille-Ready Keycaps', desc: 'Compatible with Braille overlays. Raised home-row markers easy to find by touch.' },
  { id: '02', title: 'Haptic + Audio Guidance', desc: 'Per-key haptic confirmation and audio prompts for keypresses, modes, and pairing.' },
  { id: '03', title: 'Assistive Firmware', desc: 'Open-source firmware integrates with screen readers. Voice commands + per-key profiles.' },
]

export default function ShopFeatures() {
  return (
    <section id="features" className="px-5 py-24 border-t border-line">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <span className="kicker"><span className="dev-only">// assistive features</span><span className="simple-only">Assistive Features</span></span>
          <h2 className="display text-[clamp(2rem,5.5vw,4rem)] mt-3">built for <span className="flame-text">touch</span>.</h2>
        </div>
        <div className="grid md:grid-cols-3 border border-line">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-7 border-line border-r last:border-r-0 border-b md:border-b-0 hover:bg-flame/[0.04] transition-colors"
            >
              <span className="font-mono text-[12px] text-flame">{f.id}</span>
              <h3 className="font-display simple:font-sans font-semibold text-lg mt-3 mb-2">{f.title}</h3>
              <p className="font-mono simple:font-sans text-[12px] simple:text-sm text-[var(--fg-dim)] leading-relaxed">{f.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
