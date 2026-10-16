import { useState } from 'react'
import { AlertTriangle, Send, Wand2 } from 'lucide-react'
import type { Coupon, Material, ModelFileRef, PrintOrder, PrintSpec, ProductType, SiteConfig } from '../../api/types'
import { submitOrder } from '../../api/portal'
import { validateSpec, hasErrors } from '../../api/validation'
import { useAction } from '../../hooks/useQuery'
import { LAYER_HEIGHTS } from '../../data/printing'
import { estimateWeight, exceedsBuildVolume } from '../../lib/files'
import { formatINR, formatNum, toNum } from '../../lib/format'
import { MAX_QUANTITY } from '../../lib/pricing'
import { Button, Field, Input, Notice, Panel, Select, Textarea, TextField } from '../../components/ui/ui'
import { MaterialPicker, ProductTypeToggle } from '../../components/printing/SpecControls'
import PriceBreakdownCard from '../../components/printing/PriceBreakdownCard'
import ModelUpload from './ModelUpload'
import CouponInput from './CouponInput'
import SubmittedCard from './SubmittedCard'
import { useLiveQuote } from './useLiveQuote'

type DimKey = 'h' | 'w' | 'd'
const DIM_LABEL: Record<DimKey, string> = { h: 'height', w: 'width', d: 'depth' }

/** Custom manual print request: upload a model, set parameters, get a live price. */
export default function CustomRequest({ cfg, onViewOrder }: { cfg: SiteConfig; onViewOrder: (id: string) => void }) {
  const [file, setFile] = useState<ModelFileRef | null>(null)
  const [title, setTitle] = useState('')
  const [productType, setProductType] = useState<ProductType>('print')
  const [material, setMaterial] = useState<Material>('PLA')
  const [layerHeight, setLayerHeight] = useState(0.2)
  const [infill, setInfill] = useState(20)
  const [dims, setDims] = useState<Record<DimKey, string>>({ h: '', w: '', d: '' })
  const [weight, setWeight] = useState('')
  const [qty, setQty] = useState('1')
  const [notes, setNotes] = useState('')
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [tried, setTried] = useState(false)
  const [done, setDone] = useState<PrintOrder | null>(null)
  const submit = useAction(submitOrder)

  const spec: PrintSpec = {
    productType,
    material,
    layerHeight,
    infill,
    dims: { h: toNum(dims.h) || 0, w: toNum(dims.w) || 0, d: toNum(dims.d) || 0 },
    weightG: toNum(weight),
    quantity: toNum(qty),
    notes,
  }
  const errors = validateSpec(spec)
  const show = (k: keyof typeof errors, live = false) => (tried || live ? errors[k] : undefined)
  const quote = useLiveQuote(cfg, productType, spec.weightG, spec.quantity, coupon)
  const suggested = file?.measured?.volumeCm3 ? estimateWeight(file.measured.volumeCm3, material, infill) : null
  const tooBig = exceedsBuildVolume(spec.dims, cfg.buildVolume)

  function onFile(ref: ModelFileRef | null) {
    setFile(ref)
    const m = ref?.measured
    if (!m) return
    if (!dims.h && !dims.w && !dims.d) setDims({ h: String(m.dims.h), w: String(m.dims.w), d: String(m.dims.d) })
    if (!weight && m.volumeCm3 > 0) setWeight(String(estimateWeight(m.volumeCm3, material, infill)))
    if (!title) setTitle(ref.name.replace(/\.[^.]+$/, ''))
  }

  function reset() {
    setFile(null)
    setTitle('')
    setDims({ h: '', w: '', d: '' })
    setWeight('')
    setQty('1')
    setNotes('')
    setCoupon(null)
    setTried(false)
    setDone(null)
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setTried(true)
    if (hasErrors(errors) || !file || quote.couponError) return
    const r = await submit.run({ mode: 'custom', templateId: null, title, spec, file, couponCode: quote.couponCode })
    if (r.ok) setDone(r.value)
  }

  if (done) return <SubmittedCard order={done} onView={() => onViewOrder(done.id)} onAnother={reset} />

  return (
    <form onSubmit={send} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start" noValidate>
      <div className="grid grid-cols-1 gap-6 min-w-0">
        <Panel title="01 · model file">
          <ModelUpload value={file} onChange={onFile} maxMB={cfg.maxUploadMB} />
          {tried && !file && <p role="alert" className="font-mono text-[11px] text-red-400 mt-2">Attach your STL, OBJ or 3MF file.</p>}
          <div className="mt-4">
            <TextField label="job name" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. drone arm v3" maxLength={80} />
          </div>
        </Panel>

        <Panel title="02 · print settings">
          <div className="grid grid-cols-1 gap-5">
            <ProductTypeToggle value={productType} onChange={setProductType} />
            <MaterialPicker value={material} onChange={setMaterial} />

            <Field label="object dimensions (mm)" error={show('dims')} group>
              <div className="grid grid-cols-3 gap-2">
                {(['h', 'w', 'd'] as const).map((k) => (
                  <div key={k} className="relative">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      inputMode="decimal"
                      aria-label={`${DIM_LABEL[k]} in mm`}
                      value={dims[k]}
                      onChange={(e) => setDims({ ...dims, [k]: e.target.value })}
                      className="pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 kicker text-[9px] pointer-events-none">{DIM_LABEL[k]}</span>
                  </div>
                ))}
              </div>
            </Field>
            {tooBig && (
              <Notice tone="error">
                <span className="inline-flex items-center gap-1.5">
                  <AlertTriangle size={13} /> Bigger than our {cfg.buildVolume.x}×{cfg.buildVolume.y}×{cfg.buildVolume.z} mm bed — we may need to split it into parts. Add a note and we'll advise.
                </span>
              </Notice>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="estimated weight per piece (g)"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                error={show('weightG', weight !== '')}
                hint={suggested ? undefined : 'from your slicer — we confirm after review'}
              />
              <Field label="layer height">
                <Select value={layerHeight} onChange={(e) => setLayerHeight(Number(e.target.value))}>
                  {LAYER_HEIGHTS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            {suggested !== null && (
              <div className="flex flex-wrap items-center gap-3 -mt-2 font-mono simple:font-sans text-[11px] text-[var(--fg-dim)]">
                <Wand2 size={13} className="text-flame" />
                <span>
                  From the model: ≈ <span className="text-[var(--fg)]">{formatNum(suggested)} g</span> in {material} at {infill}% infill
                </span>
                {String(suggested) !== weight && (
                  <button type="button" onClick={() => setWeight(String(suggested))} className="text-flame hover:underline">
                    use this
                  </button>
                )}
              </div>
            )}

            <Field label={`infill · ${infill}%`} error={show('infill')}>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={infill}
                  onChange={(e) => setInfill(Number(e.target.value))}
                  aria-label="Infill percentage"
                  className="flex-1 accent-[var(--color-flame)]"
                />
                <Input type="number" min={0} max={100} value={infill} onChange={(e) => setInfill(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} aria-label="Infill percent" className="w-20" />
              </div>
            </Field>
          </div>
        </Panel>

        <Panel title="03 · quantity & notes">
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4">
            <TextField label="quantity" type="number" min={1} max={MAX_QUANTITY} step={1} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} error={show('quantity', qty !== '')} />
            <Field label="notes for the print desk" error={show('notes')}>
              <Textarea rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="colour, orientation, tolerances, deadline…" />
            </Field>
          </div>
        </Panel>
      </div>

      <aside className="grid grid-cols-1 gap-4 lg:sticky lg:top-28">
        <CouponInput coupon={coupon} onChange={setCoupon} liveError={quote.couponError} />
        <PriceBreakdownCard quote={quote} label="instant estimate" />
        {submit.error && <Notice tone="error">{submit.error}</Notice>}
        {tried && (hasErrors(errors) || !file) && <Notice tone="error">Fix the highlighted fields to send your request.</Notice>}
        <Button type="submit" size="lg" loading={submit.pending} disabled={!cfg.acceptingOrders}>
          <Send size={16} /> Send for review · {quote.total > 0 ? formatINR(quote.total) : '—'}
        </Button>
        <p className="font-mono simple:font-sans text-[11px] text-[var(--fg-dim)]">
          {cfg.acceptingOrders
            ? "Nothing is charged now. We slice your model, confirm the final price, and you accept the quote before we print."
            : 'New requests are paused right now — message us on WhatsApp.'}
        </p>
      </aside>
    </form>
  )
}
