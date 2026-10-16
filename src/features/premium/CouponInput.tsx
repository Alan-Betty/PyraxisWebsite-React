import { useState } from 'react'
import { TicketPercent, X } from 'lucide-react'
import type { Coupon } from '../../api/types'
import { lookupCoupon } from '../../api/portal'
import { useAction } from '../../hooks/useQuery'
import { describeCoupon } from '../../lib/pricing'
import { Button, Field, Input } from '../../components/ui/ui'

/**
 * Look a code up, then hand it to the pricing engine. Conditions such as
 * minimum weight are re-checked live by the quote, so `liveError` reports
 * a code that stops applying when the order changes.
 */
export default function CouponInput({ coupon, onChange, liveError }: { coupon: Coupon | null; onChange: (c: Coupon | null) => void; liveError: string | null }) {
  const [code, setCode] = useState('')
  const lookup = useAction(lookupCoupon)

  async function apply(e?: React.FormEvent) {
    e?.preventDefault()
    if (!code.trim()) return
    const r = await lookup.run(code)
    if (r.ok) {
      onChange(r.value)
      setCode('')
    }
  }

  if (coupon) {
    return (
      <Field label="coupon" error={liveError} group>
        <div className={`flex items-center justify-between gap-3 border px-3 h-10 simple:rounded-lg ${liveError ? 'border-amber-400/50' : 'border-flame/60'}`}>
          <span className="flex items-center gap-2 font-mono simple:font-sans text-[13px] min-w-0">
            <TicketPercent size={15} className="text-flame shrink-0" />
            <span className="font-bold">{coupon.code}</span>
            <span className="text-[var(--fg-dim)] truncate">· {describeCoupon(coupon)}</span>
          </span>
          <button type="button" onClick={() => onChange(null)} aria-label="Remove coupon" className="text-[var(--fg-dim)] hover:text-flame">
            <X size={15} />
          </button>
        </div>
      </Field>
    )
  }

  return (
    <Field label="coupon code" error={lookup.error}>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            lookup.setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              apply()
            }
          }}
          placeholder="WELCOME10"
          aria-label="Coupon code"
          className="uppercase"
          maxLength={24}
        />
        <Button type="button" variant="ghost" onClick={() => apply()} loading={lookup.pending} disabled={!code.trim()}>
          Apply
        </Button>
      </div>
    </Field>
  )
}
