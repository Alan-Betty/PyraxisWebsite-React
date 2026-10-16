// Staff endpoints: the print order queue and formal quoting.
import type { OrderStatus, PrintOrder, PublicUser } from '../types'
import { ApiError, blobs, latency, mutate, now, readDb } from '../store'
import { requireActor, toPublic } from '../auth'
import { NEXT_STATUS, TIER_RANK, OPEN_STATUSES } from '../../lib/orders'

export interface QueueRow {
  order: PrintOrder
  customer: PublicUser | null
}

/** Open orders first, then by customer tier (priority), then oldest first. */
export async function listOrders(): Promise<QueueRow[]> {
  requireActor('orders')
  const db = readDb()
  const users = new Map(db.users.map((u) => [u.id, toPublic(u)]))
  return db.orders
    .map((order) => ({ order, customer: users.get(order.userId) ?? null }))
    .sort((a, b) => {
      const openA = OPEN_STATUSES.includes(a.order.status) ? 0 : 1
      const openB = OPEN_STATUSES.includes(b.order.status) ? 0 : 1
      if (openA !== openB) return openA - openB
      if (openA === 0) {
        const tierA = a.customer ? TIER_RANK[a.customer.tier] : 9
        const tierB = b.customer ? TIER_RANK[b.customer.tier] : 9
        if (tierA !== tierB) return tierA - tierB
        return a.order.createdAt.localeCompare(b.order.createdAt)
      }
      return b.order.updatedAt.localeCompare(a.order.updatedAt)
    })
}

export interface QuoteInput {
  weightG: number
  amount: number
  shipping: number
  note: string
}

export async function sendQuote(id: string, input: QuoteInput): Promise<void> {
  const actor = requireActor('orders')
  await latency()
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new ApiError('Quote amount must be more than ₹0.')
  if (!Number.isFinite(input.shipping) || input.shipping < 0) throw new ApiError('Shipping cannot be negative.')
  if (!Number.isFinite(input.weightG) || input.weightG <= 0) throw new ApiError('Enter the sliced total weight.')
  mutate((db) => {
    const o = db.orders.find((x) => x.id === id)
    if (!o) throw new ApiError('Order not found.', 404)
    if (o.status !== 'submitted' && o.status !== 'quoted') throw new ApiError('Quotes can only be sent before the customer accepts.')
    const t = now()
    o.quote = {
      amount: Math.round(input.amount),
      shipping: Math.round(input.shipping),
      total: Math.round(input.amount) + Math.round(input.shipping),
      weightG: input.weightG,
      note: input.note.trim(),
      sentAt: t,
      by: actor.name,
    }
    o.history.push({ status: 'quoted', at: t, by: actor.name, note: o.status === 'quoted' ? 'Quote revised' : undefined })
    o.status = 'quoted'
    o.updatedAt = t
  })
}

export async function setOrderStatus(id: string, status: OrderStatus, opts: { note?: string; trackingNumber?: string } = {}) {
  const actor = requireActor('orders')
  await latency()
  mutate((db) => {
    const o = db.orders.find((x) => x.id === id)
    if (!o) throw new ApiError('Order not found.', 404)
    if (!NEXT_STATUS[o.status].includes(status) || status === 'quoted') {
      throw new ApiError(`Can't move an order from “${o.status}” to “${status}”.`)
    }
    if (status === 'accepted' && !o.quote) throw new ApiError('Send a quote before marking it accepted.')
    if (status === 'rejected' && !opts.note?.trim()) throw new ApiError('Tell the customer why the order was declined.')
    if (opts.trackingNumber !== undefined) o.trackingNumber = opts.trackingNumber.trim()
    const t = now()
    o.status = status
    o.updatedAt = t
    o.history.push({ status, at: t, by: actor.name, note: opts.note?.trim() || undefined })
  })
}

export async function getOrderModel(id: string): Promise<Blob | null> {
  requireActor('orders')
  const o = readDb().orders.find((x) => x.id === id)
  if (!o?.file) return null
  return (await blobs.get(o.file.id)) ?? null
}
