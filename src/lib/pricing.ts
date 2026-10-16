import type { Coupon, PriceBreakdown, PricingMode, ProductType } from '../api/types'

/*
 * Pricing matrix
 *   Normal prints, tiered by TOTAL order weight (per-piece grams × quantity):
 *     0g   – 150g  → ₹10 / g
 *     150g – 250g  → ₹7  / g
 *     250g+        → ₹5  / g
 *   Keychains: flat ₹7 / g
 *
 * Boundaries are inclusive on the upper end: exactly 150g is ₹10/g, exactly
 * 250g is ₹7/g, and the next tier starts the moment you go past them.
 *
 * Two modes (picked in admin → settings):
 *   slab        — the whole order is billed at the rate of the tier its total
 *                 weight falls in (the matrix as written).
 *   progressive — each band of grams is billed at its own rate, like income
 *                 tax brackets, so the price never drops as weight goes up.
 */

export interface Tier {
  /** inclusive upper bound in grams */
  upTo: number
  rate: number
  label: string
}

export const PRINT_TIERS: Tier[] = [
  { upTo: 150, rate: 10, label: '0–150 g' },
  { upTo: 250, rate: 7, label: '150–250 g' },
  { upTo: Infinity, rate: 5, label: '250 g+' },
]

export const KEYCHAIN_RATE = 7

export const MAX_WEIGHT_G = 10_000
export const MAX_QUANTITY = 500

const round2 = (n: number) => Math.round(n * 100) / 100

export function tierIndexFor(totalG: number): number {
  const i = PRINT_TIERS.findIndex((t) => totalG <= t.upTo)
  return i === -1 ? PRINT_TIERS.length - 1 : i
}

/** Print cost before discounts and shipping, in whole rupees. */
export function baseCost(productType: ProductType, totalG: number, mode: PricingMode) {
  if (totalG <= 0) return { subtotal: 0, rate: productType === 'keychain' ? KEYCHAIN_RATE : PRINT_TIERS[0].rate }
  if (productType === 'keychain') {
    return { subtotal: Math.round(totalG * KEYCHAIN_RATE), rate: KEYCHAIN_RATE }
  }
  if (mode === 'slab') {
    const rate = PRINT_TIERS[tierIndexFor(totalG)].rate
    return { subtotal: Math.round(totalG * rate), rate }
  }
  let remaining = totalG
  let floor = 0
  let cost = 0
  for (const t of PRINT_TIERS) {
    const band = Math.min(remaining, t.upTo - floor)
    cost += band * t.rate
    remaining -= band
    floor = t.upTo
    if (remaining <= 0) break
  }
  const subtotal = Math.round(cost)
  return { subtotal, rate: round2(cost / totalG) }
}

/** What the customer gains by adding a little more weight (slab mode only). */
export function nextTierHint(productType: ProductType, totalG: number) {
  if (productType === 'keychain' || totalG <= 0) return null
  const i = tierIndexFor(totalG)
  if (i >= PRINT_TIERS.length - 1) return null
  const boundary = PRINT_TIERS[i].upTo
  // "past the boundary": the smallest step that lands in the next tier
  const gramsNeeded = round2(boundary - totalG + 0.01)
  return { gramsNeeded, rate: PRINT_TIERS[i + 1].rate, label: PRINT_TIERS[i + 1].label }
}

/* -------------------------------------------------------------- coupons */

export type CouponCheck = { ok: true } | { ok: false; reason: string }

export function endOfDay(isoDate: string) {
  const d = new Date(isoDate)
  d.setHours(23, 59, 59, 999)
  return d
}

export function checkCoupon(coupon: Coupon | null | undefined, totalWeightG: number, now = new Date()): CouponCheck {
  if (!coupon) return { ok: false, reason: 'Code not recognised.' }
  if (!coupon.active) return { ok: false, reason: 'This code is no longer active.' }
  if (coupon.expiresAt && endOfDay(coupon.expiresAt) < now) return { ok: false, reason: 'This code has expired.' }
  if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) return { ok: false, reason: 'This code has reached its usage limit.' }
  if (totalWeightG < coupon.minWeightG) {
    return { ok: false, reason: `Needs an order of at least ${coupon.minWeightG} g (you have ${round2(totalWeightG)} g).` }
  }
  return { ok: true }
}

export function describeCoupon(c: Pick<Coupon, 'type' | 'value' | 'minWeightG'>) {
  const what = c.type === 'percent' ? `${c.value}% off` : c.type === 'flat' ? `₹${c.value} off` : 'Free shipping'
  return c.minWeightG > 0 ? `${what} · min ${c.minWeightG} g` : what
}

/* ---------------------------------------------------------------- quote */

export interface QuoteInput {
  productType: ProductType
  weightG: number
  quantity: number
  shippingFee: number
  mode: PricingMode
  coupon?: Coupon | null
  now?: Date
}

export interface QuoteResult extends PriceBreakdown {
  couponError: string | null
  nextTier: ReturnType<typeof nextTierHint>
}

export function computeQuote(input: QuoteInput): QuoteResult {
  const weight = Number.isFinite(input.weightG) ? Math.max(0, input.weightG) : 0
  const qty = Number.isFinite(input.quantity) ? Math.max(0, Math.floor(input.quantity)) : 0
  const totalWeightG = round2(weight * qty)
  const { subtotal, rate } = baseCost(input.productType, totalWeightG, input.mode)

  const tierLabel =
    input.productType === 'keychain'
      ? 'Keychain flat rate'
      : input.mode === 'slab'
        ? PRINT_TIERS[tierIndexFor(totalWeightG)].label
        : 'Progressive tiers'

  const shipping = totalWeightG > 0 ? input.shippingFee : 0
  let discount = 0
  let shippingDiscount = 0
  let couponCode: string | null = null
  let couponError: string | null = null

  if (input.coupon) {
    const check = checkCoupon(input.coupon, totalWeightG, input.now)
    if (check.ok) {
      couponCode = input.coupon.code
      if (input.coupon.type === 'percent') discount = Math.round((subtotal * Math.min(100, input.coupon.value)) / 100)
      else if (input.coupon.type === 'flat') discount = Math.min(subtotal, Math.round(input.coupon.value))
      else shippingDiscount = shipping
    } else {
      couponError = check.reason
    }
  }

  return {
    productType: input.productType,
    totalWeightG,
    rate,
    tierLabel,
    subtotal,
    discount,
    shipping,
    shippingDiscount,
    total: Math.max(0, subtotal - discount + shipping - shippingDiscount),
    couponCode,
    couponError,
    nextTier: input.mode === 'slab' ? nextTierHint(input.productType, totalWeightG) : null,
  }
}

/** Strip the UI-only fields before persisting a quote on an order. */
export function toBreakdown(q: QuoteResult): PriceBreakdown {
  return {
    productType: q.productType,
    totalWeightG: q.totalWeightG,
    rate: q.rate,
    tierLabel: q.tierLabel,
    subtotal: q.subtotal,
    discount: q.discount,
    shipping: q.shipping,
    shippingDiscount: q.shippingDiscount,
    total: q.total,
    couponCode: q.couponCode,
  }
}
