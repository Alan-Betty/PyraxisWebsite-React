import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

// Replace with the real WhatsApp number in international format (no +, no spaces).
const WHATSAPP = '+918848901279'
const MESSAGE = "Hi! I'd like to ask about your 3D printing service."
const WA_LINK = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MESSAGE)}`

export default function PrintingSection() {
  return (
    <section id="printing" className="px-5 py-24 border-t border-line">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-[1fr_auto] gap-10 items-end border border-line p-8 md:p-12"
        >
          <div>
            <span className="kicker">// services · 3d printing</span>
            <h2 className="display text-[clamp(2rem,5.5vw,4rem)] mt-3 mb-4">
              got a 3D model?<br />we <span className="flame-text">print</span> it.
            </h2>
            <p className="font-mono text-[13px] text-[var(--fg-dim)] max-w-md">
              On-demand 3D printing on our Creality Ender 3D. Send us your model over
              WhatsApp — we quote, print, and hand it off.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 kicker">
              <span>◦ creality ender</span>
              <span>◦ FDM · PLA / PETG</span>
              <span>◦ quote over whatsapp</span>
            </div>
          </div>

          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 h-[52px] px-7 bg-flame text-black font-bold tracking-wide hover:bg-ember transition-colors whitespace-nowrap"
          >
            <MessageCircle size={18} />
            Message us on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  )
}
