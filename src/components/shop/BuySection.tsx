import { useState } from 'react'
import { Mail, BellRing } from 'lucide-react'
import NotifyModal from './NotifyModal'

export default function BuySection() {
  const [show, setShow] = useState(false)

  return (
    <section id="buy" className="px-5 py-24 border-t border-line">
      <div className="max-w-4xl mx-auto border border-line p-8 md:p-14 text-center shadow-[12px_12px_0_0_var(--color-flame-dim)]">
        <span className="kicker">// pre-order · ships Q2 2026</span>
        <h2 className="display text-[clamp(2.2rem,6vw,4.5rem)] mt-4 mb-5">reserve <span className="flame-text">pykey</span>.</h2>
        <p className="font-mono text-[13px] text-[var(--fg-dim)] max-w-lg mx-auto mb-8">
          Pre-orders open now. Accessibility demo kits available for organizations and testers.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="mailto:sales@pyraxis.example?subject=PyKey%20Pre-order" className="inline-flex items-center gap-2 h-12 px-6 bg-flame text-black font-bold tracking-wide hover:bg-ember transition-colors">
            <Mail size={17} /> email sales
          </a>
          <button onClick={() => setShow(true)} className="inline-flex items-center gap-2 h-12 px-6 border border-line hover:border-flame transition-colors text-[var(--fg-dim)] hover:text-[var(--fg)]">
            <BellRing size={17} /> notify me
          </button>
        </div>
      </div>
      {show && <NotifyModal onClose={() => setShow(false)} />}
    </section>
  )
}
