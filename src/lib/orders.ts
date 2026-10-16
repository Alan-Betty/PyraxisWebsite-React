import type { OrderStatus, Tier } from '../api/types'

export const STATUS_META: Record<OrderStatus, { label: string; tone: 'flame' | 'ok' | 'muted' | 'warn' | 'bad'; customer: string }> = {
  submitted: { label: 'Submitted', tone: 'warn', customer: "We've got your request and are reviewing it." },
  quoted: { label: 'Quote ready', tone: 'flame', customer: 'Your confirmed quote is ready — accept it to start printing.' },
  accepted: { label: 'Accepted', tone: 'ok', customer: "Quote accepted. You're in the print queue." },
  printing: { label: 'Printing', tone: 'flame', customer: 'Your part is on the printer.' },
  shipped: { label: 'Shipped', tone: 'ok', customer: 'On its way to you.' },
  completed: { label: 'Completed', tone: 'muted', customer: 'Delivered. Thanks for printing with us!' },
  rejected: { label: 'Declined', tone: 'bad', customer: "We can't take this one on — see the note below." },
  cancelled: { label: 'Cancelled', tone: 'muted', customer: 'This request was cancelled.' },
}

/** The happy path, used for the tracker timeline. */
export const ORDER_FLOW: OrderStatus[] = ['submitted', 'quoted', 'accepted', 'printing', 'shipped', 'completed']

/** Which statuses staff may move an order to from each status. */
export const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  submitted: ['quoted', 'rejected'],
  quoted: ['accepted', 'rejected'],
  accepted: ['printing', 'cancelled'],
  printing: ['shipped', 'completed'],
  shipped: ['completed'],
  completed: [],
  rejected: [],
  cancelled: [],
}

export const OPEN_STATUSES: OrderStatus[] = ['submitted', 'quoted', 'accepted', 'printing', 'shipped']

/** Orders that count as sold: the customer has accepted a confirmed quote. */
export const REVENUE_STATUSES: OrderStatus[] = ['accepted', 'printing', 'shipped', 'completed']

export const TIER_RANK: Record<Tier, number> = { platinum: 0, gold: 1, silver: 2 }
