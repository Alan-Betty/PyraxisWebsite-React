import { useState } from 'react'
import { AlertTriangle, Download, MessageCircle, RotateCcw, Send } from 'lucide-react'
import type { OrderStatus } from '../../../api/types'
import { getOrderModel, sendQuote, setOrderStatus, type QueueRow } from '../../../api/admin/orders'
import { listCoupons } from '../../../api/admin/coupons'
import { getConfig } from '../../../api/public'
import { DEFAULT_CONFIG } from '../../../api/seed'
import { useAction, useQuery } from '../../../hooks/useQuery'
import { NEXT_STATUS, STATUS_META } from '../../../lib/orders'
import { exceedsBuildVolume } from '../../../lib/files'
import { formatBytes, formatDate, formatGrams, formatINR, formatNum, formatRate, toNum } from '../../../lib/format'
import { whatsappLink } from '../../../lib/whatsapp'
import { MATERIALS } from '../../../data/printing'
import { Badge, Button, Field, Input, KV, Modal, Notice, Panel, Textarea, TextField } from '../../../components/ui/ui'
import { btnClass } from '../../../components/ui/styles'
import OrderTimeline from '../../../components/printing/OrderTimeline'
import { customerWhatsApp, requote } from './requote'

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  accepted: 'Mark accepted',
  printing: 'Start printing',
  shipped: 'Mark shipped',
  completed: 'Mark completed',
  rejected: 'Decline order',
  cancelled: 'Cancel order',
}

/** Inspect a request, confirm or adjust the automated quote, and move it through production. */
export default function OrderReview({ row, onClose }: { row: QueueRow; onClose: () => void }) {
  const { order: o, customer } = row
  const { data: cfg = DEFAULT_CONFIG } = useQuery(getConfig)
  const { data: coupons = [] } = useQuery(listCoupons)
  const [weight, setWeight] = useState(String(o.quote?.weightG ?? o.estimate.totalWeightG))
  const [amountOverride, setAmountOverride] = useState<string | null>(o.quote ? String(o.quote.amount) : null)
  const [shippingOverride, setShippingOverride] = useState<string | null>(o.quote ? String(o.quote.shipping) : null)
  const [note, setNote] = useState(o.quote?.note ?? '')
  const [statusNote, setStatusNote] = useState('')
  const [tracking, setTracking] = useState(o.trackingNumber)
  const [fileMissing, setFileMissing] = useState(false)
  const quote = useAction(sendQuote)
  const move = useAction(setOrderStatus)

  const g = toNum(weight)
  const auto = requote(o, g > 0 ? g : 0, cfg, coupons)
  const amount = amountOverride !== null ? toNum(amountOverride) : auto.amount
  const shipping = shippingOverride !== null ? toNum(shippingOverride) : auto.shipping
  const total = (Number.isFinite(amount) ? amount : 0) + (Number.isFinite(shipping) ? shipping : 0)
  const canQuote = o.status === 'submitted' || o.status === 'quoted'
  const s = o.spec
  const tooBig = exceedsBuildVolume(s.dims, cfg.buildVolume)
  const nextActions = NEXT_STATUS[o.status].filter((x) => x !== 'quoted')

  async function downloadModel() {
    const blob = await getOrderModel(o.id)
    if (!blob || !o.file) {
      setFileMissing(true)
      return
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = o.file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 30_000)
  }

  const waNumber = customer ? customerWhatsApp(customer.shipping?.phone || customer.phone) : null
  const waQuote = [
    `Hi ${customer?.name.split(' ')[0] ?? ''}! Your Pyraxis print quote for ${o.ref} (${o.title}) is ready:`,
    `• Sliced weight: ${formatGrams(g || 0)}`,
    `• Print: ${formatINR(amount || 0)}`,
    `• Shipping: ${formatINR(shipping || 0)}`,
    `• Total: ${formatINR(total)}`,
    note.trim() ? `\n${note.trim()}` : '',
    '\nAccept it in your portal to start printing.',
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <Modal title={`review · ${o.ref}`} onClose={onClose} wide>
      <div className="grid grid-cols-1 gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="kicker text-flame">
              {o.ref} · {o.mode}
            </span>
            <h3 className="font-display simple:font-sans font-bold text-2xl mt-1">{o.title}</h3>
          </div>
          <Badge tone={STATUS_META[o.status].tone}>{STATUS_META[o.status].label}</Badge>
        </div>
        <OrderTimeline order={o} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <Panel title="customer">
            {customer ? (
              <div className="font-mono simple:font-sans text-[12px]">
                <KV k="name" v={customer.name} />
                <KV k="email" v={customer.email} />
                <KV k="phone" v={customer.phone || '—'} />
                <KV k="tier" v={<Badge tone={customer.tier === 'platinum' ? 'flame' : 'muted'}>{customer.tier}</Badge>} />
                <div className="mt-2 pt-2 border-t border-line text-[var(--fg-dim)] leading-relaxed">
                  {customer.shipping ? (
                    <>
                      <span className="kicker text-[9px] block mb-1">ship to</span>
                      {customer.shipping.name}, {customer.shipping.line1}
                      {customer.shipping.line2 && `, ${customer.shipping.line2}`}, {customer.shipping.city}, {customer.shipping.state} {customer.shipping.pincode}
                    </>
                  ) : (
                    'No shipping address saved.'
                  )}
                </div>
              </div>
            ) : (
              <p className="font-mono text-[12px] text-[var(--fg-dim)]">This customer account no longer exists.</p>
            )}
          </Panel>

          <Panel title="specification">
            <div className="font-mono simple:font-sans text-[12px]">
              <KV k="type" v={s.productType === 'keychain' ? 'Keychain (flat ₹7/g)' : 'Standard print'} />
              <KV k="material" v={`${s.material} · ${MATERIALS[s.material].full}`} />
              <KV k="layer / infill" v={`${s.layerHeight} mm · ${s.infill}%`} />
              <KV k="size h×w×d" v={`${s.dims.h} × ${s.dims.w} × ${s.dims.d} mm`} />
              <KV k="weight" v={`${formatGrams(s.weightG)} × ${s.quantity} = ${formatGrams(o.estimate.totalWeightG)}`} />
              {s.notes && <KV k="notes" v={<span className="whitespace-pre-wrap">{s.notes}</span>} />}
            </div>
            {tooBig && (
              <p className="flex items-center gap-1.5 mt-3 font-mono text-[11px] text-amber-300 light:text-amber-700">
                <AlertTriangle size={12} /> exceeds {cfg.buildVolume.x}×{cfg.buildVolume.y}×{cfg.buildVolume.z} mm build volume
              </p>
            )}
            {o.file && (
              <div className="mt-4 pt-3 border-t border-line grid grid-cols-1 gap-2">
                <button onClick={downloadModel} className={btnClass('ghost', 'sm', 'justify-start')}>
                  <Download size={13} /> {o.file.name} · {formatBytes(o.file.size)}
                </button>
                {o.file.measured && (
                  <span className="kicker text-[9px]">
                    measured {formatNum(o.file.measured.dims.h)}×{formatNum(o.file.measured.dims.w)}×{formatNum(o.file.measured.dims.d)} mm · {formatNum(o.file.measured.volumeCm3)} cm³
                  </span>
                )}
                {fileMissing && <Notice tone="error">The model isn't stored in this browser. Ask the customer to resend it on WhatsApp.</Notice>}
              </div>
            )}
          </Panel>
        </div>

        {/* quoting */}
        <Panel title={canQuote ? (o.quote ? 'revise quote' : 'confirm quote') : 'quote'}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
              <TextField label="sliced total weight (g)" type="number" min={0} step="any" value={weight} onChange={(e) => setWeight(e.target.value)} disabled={!canQuote} hint={`customer said ${formatGrams(o.estimate.totalWeightG)}`} />
              <Field label="print cost (₹)" hint={amountOverride === null ? `auto · ${formatRate(auto.rate)}${auto.discount ? ` − ${formatINR(auto.discount)} coupon` : ''}` : 'manual override'}>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    min={0}
                    disabled={!canQuote}
                    value={amountOverride ?? String(auto.amount)}
                    onChange={(e) => setAmountOverride(e.target.value)}
                    aria-label="Print cost in rupees"
                                      />
                  {amountOverride !== null && canQuote && (
                    <button type="button" onClick={() => setAmountOverride(null)} aria-label="Back to automatic price" title="Back to automatic price" className="w-10 h-10 grid place-items-center border border-line hover:border-flame shrink-0 simple:rounded-lg">
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>
              </Field>
              <Field label="shipping (₹)" hint={o.estimate.shippingDiscount ? 'free-shipping coupon' : `default ₹${cfg.shippingFee}`}>
                <Input
                  type="number"
                  min={0}
                  disabled={!canQuote}
                  value={shippingOverride ?? String(auto.shipping)}
                  onChange={(e) => setShippingOverride(e.target.value)}
                  aria-label="Shipping in rupees"
                                  />
              </Field>
              <Field label="note to customer" className="sm:col-span-3">
                <Textarea rows={2} value={note} disabled={!canQuote} onChange={(e) => setNote(e.target.value)} placeholder="e.g. printed in two parts, ready in 3 days" maxLength={600} />
              </Field>
            </div>
            <div className="border border-line p-4 soft font-mono simple:font-sans text-[12px] self-start">
              <KV k="customer estimate" v={formatINR(o.estimate.total)} />
              {o.estimate.couponCode && <KV k="coupon" v={o.estimate.couponCode} />}
              <div className="flex items-baseline justify-between border-t border-line mt-2 pt-2">
                <span className="kicker">quote total</span>
                <span className="font-display simple:font-sans font-bold text-2xl tabular-nums">{formatINR(total)}</span>
              </div>
              {total !== o.estimate.total && o.estimate.total > 0 && (
                <p className={`text-[11px] mt-1 ${total > o.estimate.total ? 'text-amber-300 light:text-amber-700' : 'text-emerald-400 light:text-emerald-700'}`}>
                  {total > o.estimate.total ? '+' : '−'}
                  {formatINR(Math.abs(total - o.estimate.total))} vs estimate
                </p>
              )}
            </div>
          </div>
          {quote.error && (
            <div className="mt-4">
              <Notice tone="error">{quote.error}</Notice>
            </div>
          )}
          {canQuote && (
            <div className="flex flex-wrap gap-2 mt-4">
              <Button loading={quote.pending} onClick={() => quote.run(o.id, { weightG: g, amount, shipping, note })}>
                <Send size={14} /> {o.quote ? 'Send revised quote' : 'Send formal quote'}
              </Button>
              {waNumber && (
                <a href={whatsappLink(waNumber, waQuote)} target="_blank" rel="noopener noreferrer" className={btnClass('ghost', 'md')}>
                  <MessageCircle size={14} /> Also send on WhatsApp
                </a>
              )}
            </div>
          )}
        </Panel>

        {/* production */}
        {nextActions.length > 0 && (
          <Panel title="production status">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nextActions.includes('shipped') && <TextField label="tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="courier + AWB" />}
              <TextField label="note (required to decline)" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} className={nextActions.includes('shipped') ? '' : 'sm:col-span-2'} />
            </div>
            {move.error && (
              <div className="mt-3">
                <Notice tone="error">{move.error}</Notice>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {nextActions.map((st) => (
                <Button
                  key={st}
                  variant={st === 'rejected' || st === 'cancelled' ? 'danger' : st === 'accepted' ? 'ghost' : 'primary'}
                  loading={move.pending}
                  onClick={async () => {
                    const r = await move.run(o.id, st, { note: statusNote, trackingNumber: st === 'shipped' ? tracking : undefined })
                    if (r.ok) setStatusNote('')
                  }}
                >
                  {ACTION_LABEL[st]}
                </Button>
              ))}
            </div>
            {nextActions.includes('accepted') && <p className="kicker text-[9px] mt-3">“mark accepted” is for customers who confirmed outside the portal, e.g. on WhatsApp</p>}
          </Panel>
        )}

        <Panel title="history">
          <ol className="grid grid-cols-1 gap-2 font-mono simple:font-sans text-[12px]">
            {[...o.history].reverse().map((h, i) => (
              <li key={i} className="flex flex-wrap gap-x-3">
                <span className="text-[var(--fg-dim)] w-36 shrink-0">{formatDate(h.at, true)}</span>
                <span className="text-flame">{STATUS_META[h.status].label}</span>
                <span className="text-[var(--fg-dim)]">by {h.by}</span>
                {h.note && <span className="basis-full sm:basis-auto">— {h.note}</span>}
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </Modal>
  )
}
