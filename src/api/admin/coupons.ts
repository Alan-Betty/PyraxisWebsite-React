// Staff endpoints: the coupon & offer engine.
import type { Coupon, CouponType } from '../types'
import { ApiError, latency, mutate, now, readDb, uid } from '../store'
import { requireActor } from '../auth'

export async function listCoupons(): Promise<Coupon[]> {
  requireActor('coupons')
  return [...readDb().coupons].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export interface CouponInput {
  code: string
  description: string
  type: CouponType
  value: number
  minWeightG: number
  expiresAt: string | null
  maxUses: number | null
  active: boolean
}

function clean(input: CouponInput): CouponInput {
  const code = input.code.trim().toUpperCase()
  if (!/^[A-Z0-9_-]{3,24}$/.test(code)) throw new ApiError('Codes are 3–24 letters, numbers, dashes or underscores.')
  if (input.type === 'percent' && !(input.value > 0 && input.value <= 100)) throw new ApiError('Percentage must be between 1 and 100.')
  if (input.type === 'flat' && !(input.value > 0)) throw new ApiError('Flat discount must be more than ₹0.')
  if (!(input.minWeightG >= 0)) throw new ApiError('Minimum weight cannot be negative.')
  if (input.maxUses !== null && !(Number.isInteger(input.maxUses) && input.maxUses > 0)) throw new ApiError('Usage limit must be a whole number above 0, or empty.')
  if (input.expiresAt && Number.isNaN(Date.parse(input.expiresAt))) throw new ApiError('Pick a valid expiry date.')
  return { ...input, code, description: input.description.trim(), value: input.type === 'free_shipping' ? 0 : input.value }
}

export async function createCoupon(input: CouponInput): Promise<Coupon> {
  requireActor('coupons')
  await latency()
  const data = clean(input)
  return mutate((db) => {
    if (db.coupons.some((c) => c.code === data.code)) throw new ApiError('That code already exists.')
    const c: Coupon = { ...data, id: uid('cpn'), uses: 0, createdAt: now() }
    db.coupons.push(c)
    return c
  })
}

export async function updateCoupon(id: string, input: CouponInput): Promise<Coupon> {
  requireActor('coupons')
  await latency()
  const data = clean(input)
  return mutate((db) => {
    const c = db.coupons.find((x) => x.id === id)
    if (!c) throw new ApiError('Coupon not found.', 404)
    if (db.coupons.some((x) => x.code === data.code && x.id !== id)) throw new ApiError('That code already exists.')
    Object.assign(c, data)
    return c
  })
}

export async function deleteCoupon(id: string): Promise<void> {
  requireActor('coupons')
  await latency()
  mutate((db) => {
    db.coupons = db.coupons.filter((c) => c.id !== id)
  })
}
