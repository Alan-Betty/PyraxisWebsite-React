import { TrendingDown } from 'lucide-react'
import type { QuoteResult } from '../../lib/pricing'
import { formatGrams, formatINR, formatRate } from '../../lib/format'

/** The itemised estimate. Shared by the guest quick-quote and the premium request flows. */
export default function PriceBreakdownCard({ quote, label = 'estimate', compact = false }: { quote: QuoteResult; label?: string; compact?: boolean }) {
  const empty = quote.totalWeightG <= 0
  return (
    <div className="border border-line soft" aria-live="polite">
      <div className="flex items-center justify-between px-4 h-9 border-b border-line bg-ink-2 light:bg-bone/40">
        <span className="kicker text-[9px]">{label}</span>
        <span className="kicker text-[9px] text-flame">{quote.tierLabel}</span>
      </div>
      <div className={`${compact ? 'p-4' : 'p-5'} font-mono simple:font-sans text-[12px] simple:text-[13px]`}>
        <Row k="total weight" v={formatGrams(quote.totalWeightG)} />
        <Row k="rate" v={formatRate(quote.rate)} />
        <Row k="print cost" v={formatINR(quote.subtotal)} />
        {quote.discount > 0 && <Row k={`coupon ${quote.couponCode}`} v={`− ${formatINR(quote.discount)}`} accent />}
        <Row k="shipping" v={quote.shipping ? formatINR(quote.shipping) : '—'} />
        {quote.shippingDiscount > 0 && <Row k={`coupon ${quote.couponCode}`} v={`− ${formatINR(quote.shippingDiscount)}`} accent />}
        <div className="flex items-baseline justify-between gap-4 border-t border-line mt-3 pt-3">
          <span className="kicker">estimated total</span>
          <span className="font-display simple:font-sans font-bold text-3xl tabular-nums">{empty ? '—' : formatINR(quote.total)}</span>
        </div>
        {quote.nextTier && !empty && (
          <p className="flex items-start gap-2 mt-3 text-[11px] simple:text-[12px] text-[var(--fg-dim)]">
            <TrendingDown size={13} className="text-flame mt-px shrink-0" />
            <span>
              Add {formatGrams(quote.nextTier.gramsNeeded)} more in total to drop to <span className="text-flame">₹{quote.nextTier.rate}/g</span> ({quote.nextTier.label}).
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

function Row({ k, v, accent = false }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="text-[var(--fg-dim)]">{k}</span>
      <span className={`tabular-nums ${accent ? 'text-flame' : ''}`}>{v}</span>
    </div>
  )
}
