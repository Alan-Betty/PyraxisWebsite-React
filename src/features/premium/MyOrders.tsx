import { useState } from 'react'
import { ArrowLeft, Download, MessageCircle, Repeat2, Truck } from 'lucide-react'
import type { PrintOrder, SiteConfig } from '../../api/types'
import { acceptQuote, cancelOrder, getMyModel, listMyOrders } from '../../api/portal'
import { useAction, useQuery } from '../../hooks/useQuery'
import { STATUS_META } from '../../lib/orders'
import { formatBytes, formatDate, formatGrams, formatINR, formatRate } from '../../lib/format'
import { quoteMessage, whatsappLink } from '../../lib/whatsapp'
import { MATERIALS } from '../../data/printing'
import { Badge, Button, Empty, KV, Loading, Modal, Notice, Panel, Textarea } from '../../components/ui/ui'
import { btnClass } from '../../components/ui/styles'
import OrderTimeline from '../../components/printing/OrderTimeline'

export default function MyOrders({ cfg, openId, onOpen, onReorder }: { cfg: SiteConfig; openId: string | null; onOpen: (id: string | null) => void; onReorder: (id: string) => void }) {
  const { data: orders, loading, error } = useQuery(listMyOrders)
  if (loading) return <Loading label="loading orders" />
  if (error) return <Notice tone="error">{error}</Notice>
  const open = orders?.find((o) => o.id === openId)
  if (open) return <OrderDetail order={open} cfg={cfg} onBack={() => onOpen(null)} onReorder={() => onReorder(open.id)} />
  if (!orders?.length) return <Empty title="No orders yet">Your print requests and their progress will show up here.</Empty>

  return (
    <div className="border border-line soft overflow-hidden">
      {orders.map((o) => (
        <button key={o.id} onClick={() => onOpen(o.id)} className="w-full text-left grid grid-cols-1 md:grid-cols-[110px_1fr_200px_120px] gap-x-5 gap-y-2 items-center px-5 py-4 border-b border-line last:border-b-0 hover:bg-flame/[0.04] transition-colors">
          <span className="font-mono text-[12px] text-flame">{o.ref}</span>
          <span className="min-w-0">
            <span className="block font-display simple:font-sans font-semibold truncate">{o.title}</span>
            <span className="block kicker text-[9px] mt-1">
              {formatDate(o.createdAt)} · {o.spec.material} · ×{o.spec.quantity}
            </span>
          </span>
          <span className="grid grid-cols-1 gap-2">
            <Badge tone={STATUS_META[o.status].tone}>{STATUS_META[o.status].label}</Badge>
            <OrderTimeline order={o} compact />
          </span>
          <span className="font-display simple:font-sans font-bold text-lg tabular-nums md:text-right">
            {formatINR(o.quote?.total ?? o.estimate.total)}
            <span className="block kicker text-[8px] font-normal">{o.quote ? 'confirmed' : 'estimate'}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

function OrderDetail({ order, cfg, onBack, onReorder }: { order: PrintOrder; cfg: SiteConfig; onBack: () => void; onReorder: () => void }) {
  const accept = useAction(acceptQuote)
  const cancel = useAction(cancelOrder)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [reason, setReason] = useState('')
  const meta = STATUS_META[order.status]
  const lastNote = [...order.history].reverse().find((h) => h.note)?.note
  const s = order.spec

  async function downloadModel() {
    const blob = await getMyModel(order.id)
    if (!blob || !order.file) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = order.file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 30_000)
  }

  const waText = quoteMessage({ spec: s, estimate: order.estimate, ref: order.ref, fileName: order.file?.name })

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-2 font-mono simple:font-sans text-[12px] text-[var(--fg-dim)] hover:text-flame">
          <ArrowLeft size={14} /> all orders
        </button>
        <div className="flex flex-wrap gap-2">
          <a href={whatsappLink(cfg.whatsappNumber, waText)} target="_blank" rel="noopener noreferrer" className={btnClass('ghost', 'sm')}>
            <MessageCircle size={13} /> Ask about this order
          </a>
          {order.status !== 'rejected' && (
            <button onClick={onReorder} className={btnClass('ghost', 'sm')}>
              <Repeat2 size={13} /> Order again
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="kicker text-flame">{order.ref}</span>
          <h2 className="display text-[clamp(1.8rem,4vw,2.8rem)] mt-1">{order.title}</h2>
        </div>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>

      <OrderTimeline order={order} />
      <Notice tone={order.status === 'rejected' ? 'error' : 'info'}>
        {meta.customer}
        {lastNote && (order.status === 'rejected' || order.status === 'cancelled') && <span className="block mt-1 text-[var(--fg)]">“{lastNote}”</span>}
        {order.trackingNumber && (
          <span className="flex items-center gap-1.5 mt-1 text-[var(--fg)]">
            <Truck size={13} /> Tracking: <span className="font-mono">{order.trackingNumber}</span>
          </span>
        )}
      </Notice>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {order.quote ? (
          <Panel title="confirmed quote" className={order.status === 'quoted' ? 'shadow-[8px_8px_0_0_var(--color-flame-dim)] hardshadow' : ''}>
            <div className="font-mono simple:font-sans text-[13px]">
              <KV k="sliced weight" v={formatGrams(order.quote.weightG)} />
              <KV k="print cost" v={formatINR(order.quote.amount)} />
              <KV k="shipping" v={formatINR(order.quote.shipping)} />
              <div className="flex items-baseline justify-between border-t border-line mt-3 pt-3">
                <span className="kicker">total</span>
                <span className="font-display simple:font-sans font-bold text-3xl tabular-nums">{formatINR(order.quote.total)}</span>
              </div>
              {order.quote.note && <p className="mt-4 text-[12px] text-[var(--fg-dim)] border-l-2 border-flame pl-3">{order.quote.note}</p>}
              <p className="kicker text-[9px] mt-3">
                sent {formatDate(order.quote.sentAt, true)} · {order.quote.by}
              </p>
            </div>
            {order.status === 'quoted' && (
              <div className="grid grid-cols-1 gap-3 mt-5">
                {accept.error && <Notice tone="error">{accept.error}</Notice>}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => accept.run(order.id)} loading={accept.pending}>
                    Accept quote & start printing
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmCancel(true)}>
                    Decline
                  </Button>
                </div>
              </div>
            )}
          </Panel>
        ) : (
          <Panel title="your estimate">
            <div className="font-mono simple:font-sans text-[13px]">
              <KV k="total weight" v={formatGrams(order.estimate.totalWeightG)} />
              <KV k="rate" v={`${formatRate(order.estimate.rate)} · ${order.estimate.tierLabel}`} />
              <KV k="print cost" v={formatINR(order.estimate.subtotal)} />
              {order.estimate.discount > 0 && <KV k={`coupon ${order.estimate.couponCode}`} v={`− ${formatINR(order.estimate.discount)}`} />}
              <KV k="shipping" v={formatINR(order.estimate.shipping - order.estimate.shippingDiscount)} />
              <div className="flex items-baseline justify-between border-t border-line mt-3 pt-3">
                <span className="kicker">estimated total</span>
                <span className="font-display simple:font-sans font-bold text-3xl tabular-nums">{formatINR(order.estimate.total)}</span>
              </div>
              <p className="mt-3 text-[11px] text-[var(--fg-dim)]">We'll confirm the final price after slicing your model.</p>
            </div>
            {order.status === 'submitted' && (
              <div className="mt-5">
                <Button variant="ghost" size="sm" onClick={() => setConfirmCancel(true)}>
                  Cancel request
                </Button>
              </div>
            )}
          </Panel>
        )}

        <Panel title="specification">
          <div className="font-mono simple:font-sans text-[13px]">
            <KV k="type" v={s.productType === 'keychain' ? 'Keychain' : 'Standard print'} />
            <KV k="material" v={`${s.material} · ${MATERIALS[s.material].full}`} />
            <KV k="layer height" v={`${s.layerHeight} mm`} />
            <KV k="infill" v={`${s.infill}%`} />
            <KV k="size (h×w×d)" v={s.dims.h || s.dims.w || s.dims.d ? `${s.dims.h} × ${s.dims.w} × ${s.dims.d} mm` : '—'} />
            <KV k="weight" v={`${formatGrams(s.weightG)} × ${s.quantity}`} />
            {s.notes && <KV k="notes" v={<span className="whitespace-pre-wrap">{s.notes}</span>} />}
          </div>
          {order.file && (
            <button onClick={downloadModel} className={btnClass('ghost', 'sm', 'mt-4')}>
              <Download size={13} /> {order.file.name} · {formatBytes(order.file.size)}
            </button>
          )}
        </Panel>
      </div>

      {confirmCancel && (
        <Modal title={order.status === 'quoted' ? 'decline quote' : 'cancel request'} onClose={() => setConfirmCancel(false)}>
          <p className="font-mono simple:font-sans text-[13px] text-[var(--fg-dim)] mb-4">
            {order.ref} will be cancelled. Want a different price or setting? Tell us why and we can re-quote instead.
          </p>
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" aria-label="Reason" maxLength={500} />
          {cancel.error && (
            <div className="mt-3">
              <Notice tone="error">{cancel.error}</Notice>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-5">
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              loading={cancel.pending}
              onClick={async () => {
                const r = await cancel.run(order.id, reason)
                if (r.ok) setConfirmCancel(false)
              }}
            >
              Cancel order
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
