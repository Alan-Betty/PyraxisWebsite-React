import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { OrderStatus } from '../../../api/types'
import { listOrders } from '../../../api/admin/orders'
import { useQuery } from '../../../hooks/useQuery'
import { OPEN_STATUSES, STATUS_META } from '../../../lib/orders'
import { formatDate, formatGrams, formatINR } from '../../../lib/format'
import { Badge, Empty, Input, Loading, Notice, SubTabs } from '../../../components/ui/ui'
import OrderReview from './OrderReview'

type Filter = 'open' | 'all' | OrderStatus

export default function OrdersQueue() {
  const { data: rows = [], loading, error } = useQuery(listOrders)
  const [filter, setFilter] = useState<Filter>('open')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length, open: 0 }
    for (const r of rows) {
      c[r.order.status] = (c[r.order.status] ?? 0) + 1
      if (OPEN_STATUSES.includes(r.order.status)) c.open++
    }
    return c
  }, [rows])

  const shown = rows.filter((r) => {
    if (filter === 'open' ? !OPEN_STATUSES.includes(r.order.status) : filter !== 'all' && r.order.status !== filter) return false
    if (!q.trim()) return true
    const hay = `${r.order.ref} ${r.order.title} ${r.customer?.name ?? ''} ${r.customer?.email ?? ''}`.toLowerCase()
    return hay.includes(q.trim().toLowerCase())
  })

  const open = rows.find((r) => r.order.id === openId)
  const filters: Filter[] = ['open', 'submitted', 'quoted', 'accepted', 'printing', 'shipped', 'completed', 'rejected', 'cancelled', 'all']

  if (loading) return <Loading label="loading queue" />
  if (error) return <Notice tone="error">{error}</Notice>

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SubTabs
          label="Filter orders"
          value={filter}
          onChange={setFilter}
          tabs={filters.map((f) => ({ id: f, label: `${f === 'open' || f === 'all' ? f : STATUS_META[f].label.toLowerCase()} · ${counts[f] ?? 0}` }))}
        />
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-dim)]" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ref, job or customer" aria-label="Search orders" className="pl-9" />
        </div>
      </div>

      {shown.length === 0 ? (
        <Empty title="Nothing here">{filter === 'open' ? 'The queue is clear.' : 'No orders match this filter.'}</Empty>
      ) : (
        <div className="border border-line soft overflow-x-auto">
          <table className="w-full text-left font-mono simple:font-sans text-[12px] min-w-[820px]">
            <thead>
              <tr className="kicker text-[9px] border-b border-line">
                <th className="px-4 py-3 font-normal">ref</th>
                <th className="px-4 py-3 font-normal">job</th>
                <th className="px-4 py-3 font-normal">customer</th>
                <th className="px-4 py-3 font-normal">status</th>
                <th className="px-4 py-3 font-normal text-right">weight</th>
                <th className="px-4 py-3 font-normal text-right">price</th>
                <th className="px-4 py-3 font-normal text-right">received</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(({ order: o, customer }) => (
                <tr key={o.id} onClick={() => setOpenId(o.id)} className="border-b border-line last:border-b-0 hover:bg-flame/[0.04] cursor-pointer">
                  <td className="px-4 py-3">
                    <button onClick={() => setOpenId(o.id)} className="text-flame hover:underline">
                      {o.ref}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[var(--fg)]">{o.title}</div>
                    <div className="kicker text-[8px] mt-0.5">
                      {o.mode === 'custom' ? `custom · ${o.file?.ext ?? 'no file'}` : 'instant'} · {o.spec.material} · ×{o.spec.quantity}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{customer?.name ?? 'deleted account'}</div>
                    {customer && (
                      <div className="mt-1">
                        <Badge tone={customer.tier === 'platinum' ? 'flame' : 'muted'}>{customer.tier}</Badge>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_META[o.status].tone}>{STATUS_META[o.status].label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatGrams(o.quote?.weightG ?? o.estimate.totalWeightG)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatINR(o.quote?.total ?? o.estimate.total)}
                    <div className="kicker text-[8px]">{o.quote ? 'quoted' : 'auto est.'}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--fg-dim)]">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="kicker text-[9px]">open orders sort by customer tier (platinum first), then oldest first</p>

      {open && <OrderReview row={open} onClose={() => setOpenId(null)} />}
    </div>
  )
}
