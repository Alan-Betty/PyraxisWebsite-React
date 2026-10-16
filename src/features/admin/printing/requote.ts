import type { Coupon, PrintOrder, SiteConfig } from '../../../api/types'
import { baseCost } from '../../../lib/pricing'

/**
 * Re-run the pricing matrix at the weight staff measured after slicing.
 * A coupon the customer applied is honoured as it was at submission —
 * expiry or usage limits reached since then don't take it away.
 */
export function requote(order: PrintOrder, totalG: number, cfg: SiteConfig, coupons: Coupon[]) {
  const { subtotal, rate } = baseCost(order.spec.productType, totalG, cfg.pricingMode)
  const code = order.estimate.couponCode
  const c = code ? coupons.find((x) => x.code === code) : undefined
  let discount = 0
  let freeShipping = false
  if (code) {
    if (c?.type === 'percent') discount = Math.round((subtotal * c.value) / 100)
    else if (c?.type === 'flat') discount = Math.min(subtotal, Math.round(c.value))
    else if (c?.type === 'free_shipping') freeShipping = true
    else {
      // coupon deleted since: carry over what the customer was shown
      discount = Math.min(subtotal, order.estimate.discount)
      freeShipping = order.estimate.shippingDiscount > 0
    }
  }
  return { subtotal, rate, discount, amount: subtotal - discount, shipping: freeShipping ? 0 : cfg.shippingFee }
}

/** wa.me needs a country code; bare 10-digit numbers are assumed Indian. */
export function customerWhatsApp(phone: string) {
  const d = phone.replace(/\D/g, '')
  if (!d) return null
  return d.length === 10 ? `91${d}` : d
}
