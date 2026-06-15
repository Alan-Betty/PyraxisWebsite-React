import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const SPECS = [
  ['tactile', 'braille-ready keycaps + raised home markers'],
  ['feedback', 'per-key haptic + audio guidance'],
  ['pairing', 'voice assistant + one-tap connect'],
  ['firmware', 'open source · screen-reader native'],
]

export default function ShopHero() {
  return (
    <section className="relative px-5 pt-16 pb-20 border-b border-line">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="kicker"><span className="dev-only">[ hardware / pykey ]</span><span className="simple-only">PyKey Keyboard</span></span>
            <span className="h-px flex-1 bg-line dev-only" />
            <span className="kicker text-flame dev-only">a11y-first</span>
          </div>

          <h1 className="display text-[clamp(2.5rem,7vw,5.5rem)] mb-6">
            type by<br /><span className="flame-text">touch</span>.
          </h1>

          <p className="font-mono text-[14px] text-[var(--fg-dim)] max-w-md leading-relaxed">
            PyKey is an assistive keyboard for blind & low-vision users — tactile
            guidance, Braille markers, haptic + audio feedback, fully programmable.
          </p>

          <div className="mt-8 border-t border-line">
            {SPECS.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7rem_1fr] gap-4 py-2.5 border-b border-line font-mono simple:font-sans text-[12px] simple:text-sm">
                <span className="text-flame">{k.replace(/_/g, ' ')}</span>
                <span className="text-[var(--fg-dim)]">{v}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <a
              href="#buy"
              onClick={(e) => { e.preventDefault(); document.querySelector('#buy')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="group inline-flex items-center gap-3 h-12 px-6 bg-flame text-black font-bold tracking-wide hover:bg-ember transition-colors simple:rounded-full simple:font-sans"
            >
              <span className="dev-only">./pre-order</span><span className="simple-only">Pre-order now</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#specs"
              onClick={(e) => { e.preventDefault(); document.querySelector('#specs')?.scrollIntoView({ behavior: 'smooth' }) }}
              className="inline-flex items-center gap-2 h-12 px-6 border border-line hover:border-flame transition-colors text-[var(--fg-dim)] hover:text-[var(--fg)] simple:rounded-full simple:font-sans"
            >
              <span className="dev-only">man pykey</span><span className="simple-only">See specs</span>
            </a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="border border-line shadow-[12px_12px_0_0_var(--color-flame-dim)]"
        >
          <div className="flex items-center justify-between px-4 h-9 border-b border-line bg-ink-2 light:bg-bone/40">
            <span className="kicker text-[9px]"><span className="dev-only">pykey.unit · render</span><span className="simple-only">PyKey Core</span></span>
            <span className="kicker text-[9px] text-flame">● in stock</span>
          </div>
          <img src="/images/PyKey Core.jpeg" alt="PyKey tactile keyboard" className="w-full block aspect-[4/3] object-cover" />
        </motion.div>
      </div>
    </section>
  )
}
