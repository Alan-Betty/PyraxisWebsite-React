import { motion } from 'framer-motion'

export default function PreviewSection() {
  return (
    <section id="preview" className="px-5 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <span className="kicker">// live preview</span>
          <span className="h-px flex-1 bg-line" />
          <span className="kicker text-flame">render @ 60fps</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="border border-line shadow-[12px_12px_0_0_var(--hair)]"
        >
          {/* browser chrome */}
          <div className="flex items-center gap-3 px-4 h-10 border-b border-line bg-ink-2 light:bg-bone/40">
            <span className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-flame/80" />
              <span className="w-2.5 h-2.5 rounded-full border border-line" />
              <span className="w-2.5 h-2.5 rounded-full border border-line" />
            </span>
            <span className="flex-1 max-w-md h-6 px-3 border border-line bg-ink light:bg-bg-2 text-[11px] flex items-center text-[var(--fg-dim)] font-mono">
              https://pyraxis.app
            </span>
            <span className="kicker text-[9px] hidden sm:block">tabs: 1 · trackers blocked: 0</span>
          </div>
          <img src="/images/Preview.png" alt="Pyraxis browser interface" className="w-full block" />
        </motion.div>
      </div>
    </section>
  )
}
