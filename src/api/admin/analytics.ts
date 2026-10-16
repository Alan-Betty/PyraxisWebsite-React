// Staff endpoints: read-only rollups for the dashboard.
import type { Material } from '../types'
import { readDb } from '../store'
import { requireActor } from '../auth'
import { OPEN_STATUSES, REVENUE_STATUSES } from '../../lib/orders'

export interface Bucket {
  key: string
  label: string
  value: number
}

function lastNDays(n: number) {
  const days: { key: string; label: string }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
    days.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) })
  }
  return days
}

export async function assetStats(days = 14) {
  requireActor('assets')
  const db = readDb()
  const byDay = new Map<string, number>()
  for (const e of db.downloads) {
    const k = e.at.slice(0, 10)
    byDay.set(k, (byDay.get(k) ?? 0) + 1)
  }
  const totalDownloads = db.assets.reduce((s, a) => s + a.downloads, 0)
  const bandwidth = db.assets.reduce((s, a) => s + a.downloads * a.size, 0)
  const popular = [...db.assets]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5)
    .map((a) => ({ key: a.id, label: a.name, value: a.downloads }))
  return {
    totalDownloads,
    bandwidth,
    enabled: db.assets.filter((a) => a.enabled).length,
    total: db.assets.length,
    popular,
    daily: lastNDays(days).map((d) => ({ ...d, value: byDay.get(d.key) ?? 0 })),
  }
}

export async function printStats(weeks = 8) {
  requireActor('orders')
  const db = readDb()
  const sold = db.orders.filter((o) => REVENUE_STATUSES.includes(o.status))
  const revenue = sold.reduce((s, o) => s + (o.quote?.total ?? o.estimate.total), 0)
  const printed = db.orders.filter((o) => o.status === 'printing' || o.status === 'shipped' || o.status === 'completed')
  const gramsPrinted = printed.reduce((s, o) => s + (o.quote?.weightG ?? o.estimate.totalWeightG), 0)

  const mat = new Map<Material, number>()
  for (const o of db.orders) {
    if (o.status === 'cancelled' || o.status === 'rejected') continue
    mat.set(o.spec.material, (mat.get(o.spec.material) ?? 0) + o.spec.weightG * o.spec.quantity)
  }
  const materials: Bucket[] = [...mat.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ key: k, label: k, value: Math.round(v) }))

  // orders per week, oldest → newest
  const weekly: Bucket[] = []
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay() - (weeks - 1) * 7)
  for (let i = 0; i < weeks; i++) {
    const from = new Date(start.getTime() + i * 7 * 86_400_000)
    const to = new Date(from.getTime() + 7 * 86_400_000)
    weekly.push({
      key: from.toISOString().slice(0, 10),
      label: from.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      value: db.orders.filter((o) => {
        const t = new Date(o.createdAt)
        return t >= from && t < to
      }).length,
    })
  }

  return {
    revenue,
    gramsPrinted,
    totalOrders: db.orders.length,
    openOrders: db.orders.filter((o) => OPEN_STATUSES.includes(o.status)).length,
    awaitingQuote: db.orders.filter((o) => o.status === 'submitted').length,
    avgOrder: sold.length ? Math.round(revenue / sold.length) : 0,
    materials,
    weekly,
  }
}
