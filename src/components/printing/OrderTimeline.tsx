import { Check } from 'lucide-react'
import type { PrintOrder } from '../../api/types'
import { ORDER_FLOW, STATUS_META } from '../../lib/orders'
import { formatDate } from '../../lib/format'

/** Step tracker along the happy path; ended orders show where they stopped. */
export default function OrderTimeline({ order, compact = false }: { order: PrintOrder; compact?: boolean }) {
  const ended = order.status === 'rejected' || order.status === 'cancelled'
  const reachedIdx = ended
    ? Math.max(0, ...order.history.map((h) => ORDER_FLOW.indexOf(h.status)).filter((i) => i >= 0))
    : ORDER_FLOW.indexOf(order.status)
  const at = (s: string) => [...order.history].reverse().find((h) => h.status === s)?.at

  return (
    <ol className={`grid ${compact ? 'grid-cols-6 gap-1' : 'grid-cols-3 sm:grid-cols-6 gap-px bg-line border border-line soft overflow-hidden'}`} aria-label="Order progress">
      {ORDER_FLOW.map((s, i) => {
        const done = i < reachedIdx || (i === reachedIdx && (order.status === 'completed' || ended))
        const current = !ended && i === reachedIdx && order.status !== 'completed'
        if (compact) {
          return (
            <li key={s} title={STATUS_META[s].label} className={`h-1.5 simple:rounded-full ${done ? 'bg-flame' : current ? 'bg-flame/50 animate-flicker' : 'bg-line'}`}>
              <span className="sr-only">
                {STATUS_META[s].label}: {done ? 'done' : current ? 'current' : 'pending'}
              </span>
            </li>
          )
        }
        return (
          <li key={s} className={`p-3 ${current ? 'bg-flame text-black' : 'bg-[var(--bg)]'}`} aria-current={current ? 'step' : undefined}>
            <span className={`grid place-items-center w-5 h-5 border text-[10px] font-mono simple:rounded-full ${done ? 'bg-flame border-flame text-black' : current ? 'border-black' : 'border-line text-[var(--fg-dim)]'}`}>
              {done ? <Check size={12} /> : i + 1}
            </span>
            <span className={`block font-mono simple:font-sans text-[11px] mt-2 font-semibold ${done || current ? '' : 'text-[var(--fg-dim)]'}`}>{STATUS_META[s].label}</span>
            <span className={`block kicker text-[8px] mt-0.5 ${current ? 'text-black/60' : ''}`}>{at(s) ? formatDate(at(s)) : '—'}</span>
          </li>
        )
      })}
    </ol>
  )
}
