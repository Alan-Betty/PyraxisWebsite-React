import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function ShopTeaser() {
  return (
    <section id="shop" className="px-5 py-24 border-t border-line">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-[1fr_auto] gap-10 items-end border border-line p-8 md:p-12"
        >
          <div>
            <span className="kicker">// hardware · pykey</span>
            <h2 className="display text-[clamp(2rem,5.5vw,4rem)] mt-3 mb-4">
              looks good.<br />does <span className="flame-text">good</span>.
            </h2>
            <p className="font-mono text-[13px] text-[var(--fg-dim)] max-w-md">
              PyKey — an assistive mechanical keyboard for blind & low-vision users.
              Every purchase funds privacy-first development.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 kicker">
              <span>◦ braille-ready keycaps</span>
              <span>◦ haptic + audio guidance</span>
              <span>◦ open firmware</span>
            </div>
          </div>

          <Link
            to="/shop"
            className="group inline-flex items-center gap-3 h-[52px] px-7 bg-flame text-black font-bold tracking-wide hover:bg-ember transition-colors whitespace-nowrap"
          >
            cd ~/shop
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
