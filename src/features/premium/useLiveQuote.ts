import { useMemo } from 'react'
import type { Coupon, ProductType, SiteConfig } from '../../api/types'
import { computeQuote } from '../../lib/pricing'

/** Recompute the estimate on every keystroke; invalid input prices as zero instead of NaN. */
export function useLiveQuote(cfg: SiteConfig, productType: ProductType, weightG: number, quantity: number, coupon: Coupon | null) {
  const w = Number.isFinite(weightG) && weightG > 0 ? weightG : 0
  const q = Number.isInteger(quantity) && quantity > 0 ? quantity : 0
  return useMemo(
    () => computeQuote({ productType, weightG: w, quantity: q, shippingFee: cfg.shippingFee, mode: cfg.pricingMode, coupon }),
    [productType, w, q, cfg.shippingFee, cfg.pricingMode, coupon],
  )
}
