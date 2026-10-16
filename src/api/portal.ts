// Premium customer endpoints. Everything here acts on the signed-in customer's own records only.
import type { Address, Asset, Coupon, ModelFileRef, OrderMode, PrintOrder, PrintSpec, PrintTemplate, PublicUser } from './types'
import { ApiError, blobs, latency, mutate, now, readDb, uid } from './store'
import { requireActor, toPublic } from './auth'
import { validateSpec, hasErrors } from './validation'
import { computeQuote, toBreakdown } from '../lib/pricing'
import { measureModel, toFileRef, validateModelFile } from '../lib/files'

const me = () => requireActor('portal')

export interface ProfileInput {
  name: string
  phone: string
  shipping: Address | null
  billing: Address | null
  billingSameAsShipping: boolean
}

export async function updateProfile(input: ProfileInput): Promise<PublicUser> {
  const actor = me()
  await latency()
  if (!input.name.trim()) throw new ApiError('Name is required.')
  if (input.shipping && !/^\d{6}$/.test(input.shipping.pincode)) throw new ApiError('Shipping PIN code must be 6 digits.')
  if (!input.billingSameAsShipping && input.billing && !/^\d{6}$/.test(input.billing.pincode)) {
    throw new ApiError('Billing PIN code must be 6 digits.')
  }
  return toPublic(
    mutate((db) => {
      const u = db.users.find((x) => x.id === actor.id)!
      u.name = input.name.trim()
      u.phone = input.phone.trim()
      u.shipping = input.shipping
      u.billingSameAsShipping = input.billingSameAsShipping
      u.billing = input.billingSameAsShipping ? null : input.billing
      return u
    }),
  )
}

export async function listTemplates(): Promise<PrintTemplate[]> {
  me()
  return readDb().templates.filter((t) => t.active)
}

export async function listMyOrders(): Promise<PrintOrder[]> {
  const actor = me()
  return readDb()
    .orders.filter((o) => o.userId === actor.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function listPremiumAssets(): Promise<Asset[]> {
  me()
  return readDb().assets.filter((a) => a.enabled && (a.access === 'premium' || a.access === 'public'))
}

/** Look up a code. Conditions (expiry, min weight, usage) are checked against the live order by the pricing engine. */
export async function lookupCoupon(code: string): Promise<Coupon> {
  me()
  await latency(200)
  const c = readDb().coupons.find((x) => x.code === code.trim().toUpperCase())
  if (!c) throw new ApiError('Code not recognised.', 404)
  return c
}

export async function uploadModel(file: File): Promise<ModelFileRef> {
  me()
  const cfg = readDb().config
  const check = await validateModelFile(file, cfg.maxUploadMB)
  if (!check.ok) throw new ApiError(check.error)
  const measured = await measureModel(file, check.ext)
  const id = uid('file')
  try {
    await blobs.put(id, file)
  } catch {
    throw new ApiError("Couldn't store the file in this browser. Try a smaller file.")
  }
  return toFileRef(id, file, check.ext, measured)
}

export async function discardModel(ref: ModelFileRef) {
  me()
  await blobs.remove(ref.id).catch(() => undefined)
}

export interface OrderInput {
  mode: OrderMode
  templateId: string | null
  title: string
  spec: PrintSpec
  file: ModelFileRef | null
  couponCode: string | null
}

export async function submitOrder(input: OrderInput): Promise<PrintOrder> {
  const actor = me()
  await latency(300)
  const db = readDb()
  if (!db.config.acceptingOrders) throw new ApiError("We're not taking new print requests right now — message us on WhatsApp.")
  if (hasErrors(validateSpec(input.spec))) throw new ApiError('Some print details are invalid. Check the form and try again.')
  if (input.mode === 'custom' && !input.file) throw new ApiError('Attach your 3D model file.')
  if (input.mode === 'instant' && input.templateId && !db.templates.some((t) => t.id === input.templateId)) {
    throw new ApiError('That template is no longer available.')
  }

  return mutate((draft) => {
    const coupon = input.couponCode ? draft.coupons.find((c) => c.code === input.couponCode) ?? null : null
    if (input.couponCode && !coupon) throw new ApiError('Coupon code not recognised.')
    // the estimate is recomputed here — the browser's number is never trusted
    const q = computeQuote({
      productType: input.spec.productType,
      weightG: input.spec.weightG,
      quantity: input.spec.quantity,
      shippingFee: draft.config.shippingFee,
      mode: draft.config.pricingMode,
      coupon,
    })
    if (q.couponError) throw new ApiError(q.couponError)
    if (coupon) coupon.uses += 1

    draft.seq.order += 1
    const t = now()
    const order: PrintOrder = {
      id: uid('ord'),
      ref: `PX-${draft.seq.order}`,
      userId: actor.id,
      mode: input.mode,
      templateId: input.templateId,
      title: input.title.trim() || (input.file?.name ?? 'Custom print'),
      spec: { ...input.spec, notes: input.spec.notes.trim() },
      file: input.file,
      estimate: toBreakdown(q),
      quote: null,
      status: 'submitted',
      trackingNumber: '',
      history: [{ status: 'submitted', at: t, by: actor.name }],
      createdAt: t,
      updatedAt: t,
    }
    draft.orders.push(order)
    return order
  })
}

function ownOrder(id: string) {
  const actor = me()
  const order = readDb().orders.find((o) => o.id === id && o.userId === actor.id)
  if (!order) throw new ApiError('Order not found.', 404)
  return { actor, order }
}

export async function acceptQuote(id: string) {
  const { actor, order } = ownOrder(id)
  await latency()
  if (order.status !== 'quoted' || !order.quote) throw new ApiError('There is no quote waiting on this order.')
  mutate((db) => {
    const o = db.orders.find((x) => x.id === id)!
    o.status = 'accepted'
    o.updatedAt = now()
    o.history.push({ status: 'accepted', at: o.updatedAt, by: actor.name })
  })
}

export async function cancelOrder(id: string, reason: string) {
  const { actor, order } = ownOrder(id)
  await latency()
  if (order.status !== 'submitted' && order.status !== 'quoted') {
    throw new ApiError('This order is already in production — message us to change it.')
  }
  mutate((db) => {
    const o = db.orders.find((x) => x.id === id)!
    o.status = 'cancelled'
    o.updatedAt = now()
    o.history.push({ status: 'cancelled', at: o.updatedAt, by: actor.name, note: reason.trim() || undefined })
    // give the coupon use back
    const c = o.estimate.couponCode && db.coupons.find((x) => x.code === o.estimate.couponCode)
    if (c && c.uses > 0) c.uses -= 1
  })
}

/** Download the customer's own uploaded model. */
export async function getMyModel(orderId: string): Promise<Blob | null> {
  const { order } = ownOrder(orderId)
  if (!order.file) return null
  return (await blobs.get(order.file.id)) ?? null
}
