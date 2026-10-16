import { useMemo, useState } from 'react'
import { Boxes, History, KeyRound, Send } from 'lucide-react'
import type { Coupon, Material, PrintOrder, PrintSpec, PrintTemplate, SiteConfig } from '../../api/types'
import { listMyOrders, listTemplates, submitOrder } from '../../api/portal'
import { useAction, useQuery } from '../../hooks/useQuery'
import { formatDate, formatGrams, formatINR, toNum } from '../../lib/format'
import { MAX_QUANTITY } from '../../lib/pricing'
import { Button, Empty, Field, Loading, Notice, Panel, SubTabs, Textarea, TextField } from '../../components/ui/ui'
import { MaterialPicker } from '../../components/printing/SpecControls'
import PriceBreakdownCard from '../../components/printing/PriceBreakdownCard'
import CouponInput from './CouponInput'
import SubmittedCard from './SubmittedCard'
import { useLiveQuote } from './useLiveQuote'

type Source = 'templates' | 'previous'

interface Choice {
  key: string
  title: string
  templateId: string | null
  spec: PrintSpec
  file: PrintOrder['file']
}

const fromTemplate = (t: PrintTemplate): Choice => ({
  key: t.id,
  title: t.name,
  templateId: t.id,
  file: null,
  spec: { productType: t.productType, material: t.material, layerHeight: t.layerHeight, infill: t.infill, dims: t.dims, weightG: t.weightG, quantity: 1, notes: '' },
})

const fromOrder = (o: PrintOrder): Choice => ({
  key: o.id,
  title: o.title,
  templateId: o.templateId,
  file: o.file,
  // re-order at the confirmed per-piece weight when we have one
  spec: { ...o.spec, weightG: o.quote ? Math.round((o.quote.weightG / o.spec.quantity) * 10) / 10 : o.spec.weightG, notes: '' },
})

/** Pre-made / instant booking: pick a template or a past job, set quantity, book. */
export default function InstantBooking({ cfg, onViewOrder, initialOrderId }: { cfg: SiteConfig; onViewOrder: (id: string) => void; initialOrderId?: string | null }) {
  const templates = useQuery(listTemplates)
  const orders = useQuery(listMyOrders)
  const [source, setSource] = useState<Source>(initialOrderId ? 'previous' : 'templates')
  const [pickedKey, setPickedKey] = useState<string | null>(initialOrderId ?? null)
  const [material, setMaterial] = useState<Material | null>(null)
  const [qty, setQty] = useState('1')
  const [notes, setNotes] = useState('')
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [done, setDone] = useState<PrintOrder | null>(null)
  const submit = useAction(submitOrder)

  // one entry per distinct past job, newest first
  const previous = useMemo(() => {
    const seen = new Set<string>()
    return (orders.data ?? []).filter((o) => {
      if (o.status === 'rejected' || o.status === 'cancelled') return false
      const k = `${o.title}|${o.spec.material}|${o.spec.weightG}`
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  }, [orders.data])

  const picks = source === 'templates' ? (templates.data ?? []).map(fromTemplate) : previous.map(fromOrder)
  const all = [...(templates.data ?? []).map(fromTemplate), ...previous.map(fromOrder)]
  const picked = all.find((p) => p.key === pickedKey) ?? null

  const quantity = toNum(qty)
  const qtyErr = qty !== '' && (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) ? `Whole number from 1 to ${MAX_QUANTITY}.` : null
  const quote = useLiveQuote(cfg, picked?.spec.productType ?? 'print', picked?.spec.weightG ?? 0, quantity, coupon)

  function choose(p: Choice) {
    setPickedKey(p.key)
    setMaterial(p.spec.material)
  }

  async function book() {
    if (!picked || qtyErr || !(quantity >= 1) || quote.couponError) return
    const spec: PrintSpec = { ...picked.spec, material: material ?? picked.spec.material, quantity, notes }
    const r = await submit.run({ mode: 'instant', templateId: picked.templateId, title: picked.title, spec, file: picked.file, couponCode: quote.couponCode })
    if (r.ok) setDone(r.value)
  }

  if (done) {
    return (
      <SubmittedCard
        order={done}
        onView={() => onViewOrder(done.id)}
        onAnother={() => {
          setDone(null)
          setPickedKey(null)
          setQty('1')
          setNotes('')
          setCoupon(null)
        }}
      />
    )
  }

  const loading = source === 'templates' ? templates.loading : orders.loading

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
      <div className="grid grid-cols-1 gap-4 min-w-0">
        <SubTabs
          label="Booking source"
          value={source}
          onChange={setSource}
          tabs={[
            { id: 'templates', label: <span className="inline-flex items-center gap-1.5"><Boxes size={13} /> Ready-made models</span> },
            { id: 'previous', label: <span className="inline-flex items-center gap-1.5"><History size={13} /> Previous orders</span> },
          ]}
        />
        {loading ? (
          <Loading />
        ) : picks.length === 0 ? (
          <Empty title={source === 'templates' ? 'No ready-made models yet' : 'No past orders to repeat'}>
            {source === 'templates' ? 'Use a custom print request instead.' : 'Once you place an order it shows up here for one-tap re-ordering.'}
          </Empty>
        ) : (
          <div role="radiogroup" aria-label="Choose a model" className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line border border-line soft overflow-hidden">
            {picks.map((p) => {
              const active = p.key === pickedKey
              const order = source === 'previous' ? previous.find((o) => o.id === p.key) : null
              const tpl = source === 'templates' ? templates.data?.find((t) => t.id === p.key) : null
              return (
                <button
                  key={p.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => choose(p)}
                  className={`text-left p-5 transition-colors ${active ? 'bg-flame text-black' : 'bg-[var(--bg)] hover:bg-[color-mix(in_srgb,var(--color-flame)_5%,var(--bg))]'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-display simple:font-sans font-bold text-[16px] leading-tight">{p.title}</span>
                    {p.spec.productType === 'keychain' && <KeyRound size={14} className={active ? '' : 'text-flame'} />}
                  </div>
                  <p className={`font-mono simple:font-sans text-[12px] mt-2 ${active ? 'text-black/70' : 'text-[var(--fg-dim)]'}`}>
                    {tpl?.description ?? (order ? `${order.ref} · ${formatDate(order.createdAt)} · ×${order.spec.quantity}` : '')}
                  </p>
                  <div className={`kicker text-[9px] mt-3 ${active ? 'text-black/60' : ''}`}>
                    {p.spec.material} · {formatGrams(p.spec.weightG)} each · {p.spec.layerHeight} mm · {p.spec.infill}%
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <aside className="grid grid-cols-1 gap-4 lg:sticky lg:top-28">
        <Panel title={picked ? `booking · ${picked.title}` : 'booking'}>
          {picked ? (
            <div className="grid grid-cols-1 gap-4">
              <MaterialPicker value={material ?? picked.spec.material} onChange={setMaterial} />
              <TextField label="quantity" type="number" min={1} max={MAX_QUANTITY} step={1} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} error={qtyErr} />
              <Field label="notes, optional">
                <Textarea rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={picked.spec.productType === 'keychain' ? 'name / text, colour…' : 'colour, deadline…'} />
              </Field>
              <CouponInput coupon={coupon} onChange={setCoupon} liveError={quote.couponError} />
            </div>
          ) : (
            <p className="font-mono simple:font-sans text-[12px] simple:text-[13px] text-[var(--fg-dim)]">Pick a model on the left to price it.</p>
          )}
        </Panel>
        <PriceBreakdownCard quote={quote} label="instant estimate" />
        {submit.error && <Notice tone="error">{submit.error}</Notice>}
        <Button size="lg" onClick={book} loading={submit.pending} disabled={!picked || !!qtyErr || !(quantity >= 1) || !!quote.couponError || !cfg.acceptingOrders}>
          <Send size={16} /> Book now · {quote.total > 0 ? formatINR(quote.total) : '—'}
        </Button>
        <p className="font-mono simple:font-sans text-[11px] text-[var(--fg-dim)]">
          {cfg.acceptingOrders ? 'We validate the quote and confirm before printing. Nothing is charged now.' : 'New requests are paused right now — message us on WhatsApp.'}
        </p>
      </aside>
    </div>
  )
}
