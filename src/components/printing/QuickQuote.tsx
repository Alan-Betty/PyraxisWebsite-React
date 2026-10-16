import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MessageCircle } from 'lucide-react'
import type { Material, ProductType } from '../../api/types'
import { getConfig } from '../../api/public'
import { DEFAULT_CONFIG } from '../../api/seed'
import { useQuery } from '../../hooks/useQuery'
import { useAuth } from '../../auth/auth-context'
import { isStaff } from '../../api/permissions'
import { computeQuote, MAX_QUANTITY, MAX_WEIGHT_G } from '../../lib/pricing'
import { quoteMessage, whatsappLink } from '../../lib/whatsapp'
import { toNum } from '../../lib/format'
import { Field, Input, Textarea, TextField } from '../ui/ui'
import { btnClass } from '../ui/styles'
import { MaterialPicker, ProductTypeToggle } from './SpecControls'
import PriceBreakdownCard from './PriceBreakdownCard'

/**
 * Guest quote flow: a live estimate from the pricing matrix that hands off
 * to WhatsApp with every detail pre-filled.
 */
export default function QuickQuote() {
  const { data: cfg = DEFAULT_CONFIG } = useQuery(getConfig)
  const { user } = useAuth()
  const [productType, setProductType] = useState<ProductType>('print')
  const [material, setMaterial] = useState<Material>('PLA')
  const [weight, setWeight] = useState('40')
  const [qty, setQty] = useState('1')
  const [dims, setDims] = useState({ h: '', w: '', d: '' })
  const [notes, setNotes] = useState('')

  const w = toNum(weight)
  const q = toNum(qty)
  const weightErr = weight !== '' && (!(w > 0) || w > MAX_WEIGHT_G) ? `Enter 0.1 – ${MAX_WEIGHT_G} g` : null
  const qtyErr = qty !== '' && (!Number.isInteger(q) || q < 1 || q > MAX_QUANTITY) ? `Whole number, 1 – ${MAX_QUANTITY}` : null
  const valid = w > 0 && !weightErr && q >= 1 && !qtyErr

  const quote = useMemo(
    () =>
      computeQuote({
        productType,
        weightG: valid ? w : 0,
        quantity: valid ? q : 0,
        shippingFee: cfg.shippingFee,
        mode: cfg.pricingMode,
      }),
    [productType, w, q, valid, cfg.shippingFee, cfg.pricingMode],
  )

  const message = quoteMessage({
    spec: {
      productType,
      material,
      weightG: valid ? w : 0,
      quantity: valid ? q : 0,
      dims: { h: toNum(dims.h) || 0, w: toNum(dims.w) || 0, d: toNum(dims.d) || 0 },
      notes,
    },
    estimate: valid ? quote : undefined,
  })

  const portalHref = user ? (isStaff(user.role) ? '/admin' : '/portal') : '/login?next=/portal'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] border border-line soft overflow-hidden">
      <div className="p-5 md:p-7 grid grid-cols-1 gap-5 border-b lg:border-b-0 lg:border-r border-line">
        <ProductTypeToggle value={productType} onChange={setProductType} />
        <MaterialPicker value={material} onChange={setMaterial} />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="weight per piece (g)"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            error={weightErr}
            hint="your slicer shows this"
          />
          <TextField label="quantity" type="number" inputMode="numeric" min={1} step={1} value={qty} onChange={(e) => setQty(e.target.value)} error={qtyErr} />
        </div>
        <Field label="size, optional (h × w × d mm)" group>
          <div className="grid grid-cols-3 gap-2">
            {(['h', 'w', 'd'] as const).map((k) => (
              <Input key={k} type="number" min={0} inputMode="decimal" aria-label={`${k === 'h' ? 'height' : k === 'w' ? 'width' : 'depth'} in mm`} placeholder={k.toUpperCase()} value={dims[k]} onChange={(e) => setDims({ ...dims, [k]: e.target.value })} />
            ))}
          </div>
        </Field>
        <Field label="notes, optional">
          <Textarea rows={2} maxLength={500} placeholder="colour, finish, deadline…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </div>

      <div className="p-5 md:p-7 flex flex-col gap-4 bg-ink-2/40 light:bg-bone/20">
        <PriceBreakdownCard quote={quote} label="instant estimate" compact />
        <a
          href={whatsappLink(cfg.whatsappNumber, message)}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!valid}
          onClick={(e) => !valid && e.preventDefault()}
          className={btnClass('primary', 'lg', `w-full ${valid ? '' : 'opacity-50 cursor-not-allowed'}`)}
        >
          <MessageCircle size={18} /> Order via WhatsApp
        </a>
        <p className="font-mono simple:font-sans text-[11px] simple:text-[12px] text-[var(--fg-dim)]">
          Opens WhatsApp with these details filled in. Attach your model there — we confirm the final price after slicing.
        </p>
        <Link to={portalHref} className={btnClass('ghost', 'md', 'w-full')}>
          Premium? Upload & book in the portal <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
