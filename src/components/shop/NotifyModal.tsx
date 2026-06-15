import { useState } from 'react'
import { X } from 'lucide-react'

export default function NotifyModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
    setTimeout(onClose, 1400)
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] bg-black/85 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm border border-line bg-ink light:bg-bg-2 shadow-[10px_10px_0_0_var(--color-flame-dim)]">
        <div className="flex items-center justify-between px-4 h-9 border-b border-line bg-ink-2 light:bg-bone/40">
          <span className="kicker text-[9px]">notify.sh</span>
          <button onClick={onClose} aria-label="Close" className="text-[var(--fg-dim)] hover:text-flame"><X size={15} /></button>
        </div>
        <div className="p-6">
          {sent ? (
            <p className="font-mono text-[13px] text-flame">&gt; registered. we'll ping you on launch.</p>
          ) : (
            <>
              <h3 className="font-display font-bold text-lg mb-2">notify me</h3>
              <p className="font-mono text-[12px] text-[var(--fg-dim)] mb-4">Drop your email — we ping you when pre-orders open.</p>
              <form onSubmit={submit} className="flex flex-col gap-3">
                <label htmlFor="notify-email" className="sr-only">Email</label>
                <div className="flex items-center border border-line focus-within:border-flame transition-colors">
                  <span className="px-3 text-flame font-mono text-sm">$</span>
                  <input id="notify-email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-transparent py-2.5 pr-3 font-mono text-[13px] focus:outline-none" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={onClose} className="h-10 px-4 border border-line text-[12px] font-mono hover:border-flame transition-colors">cancel</button>
                  <button type="submit" className="h-10 px-4 bg-flame text-black font-bold text-[12px] hover:bg-ember transition-colors">submit ↵</button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
