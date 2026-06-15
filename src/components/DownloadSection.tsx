import { motion } from 'framer-motion'
import { Download } from 'lucide-react'

export default function DownloadSection() {
  return (
    <section id="download" className="px-5 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="relative max-w-4xl mx-auto text-center rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/10 via-transparent to-pink/10 p-12 sm:p-16 overflow-hidden"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-accent/30 blur-[100px]" />
        <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          Ready to try <span className="gradient-text">Pyraxis</span>?
        </h3>
        <p className="text-gray-300 light:text-gray-600 mb-8">
          Secure, fast browsing is one click away.
        </p>
        <a
          href="https://media.githubusercontent.com/media/PyraxisBrowser/installers/refs/heads/main/Pyraxis.dmg?download=true"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent hover:bg-accent-2 transition-colors font-semibold text-lg shadow-lg shadow-accent/30"
        >
          <Download size={20} />
          Download now
        </a>
      </motion.div>
    </section>
  )
}
