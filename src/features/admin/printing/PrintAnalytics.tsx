import { printStats } from '../../../api/admin/analytics'
import { useQuery } from '../../../hooks/useQuery'
import { formatGrams, formatINR, formatNum } from '../../../lib/format'
import { Loading, Notice, Panel, Stat } from '../../../components/ui/ui'
import { ColumnChart, RankBars } from '../charts'

export default function PrintAnalytics() {
  const { data: s, loading, error } = useQuery(() => printStats(8))
  if (loading) return <Loading />
  if (error || !s) return <Notice tone="error">{error ?? 'No data.'}</Notice>

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="revenue" value={formatINR(s.revenue)} sub="accepted quotes onwards" />
        <Stat label="weight printed" value={formatGrams(s.gramsPrinted)} sub="printing · shipped · done" />
        <Stat label="orders" value={formatNum(s.totalOrders)} sub={`${s.openOrders} open · ${s.awaitingQuote} awaiting quote`} />
        <Stat label="avg order value" value={formatINR(s.avgOrder)} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        <Panel title="orders per week · 8 weeks">
          <ColumnChart data={s.weekly} title="Orders received per week, last 8 weeks" format={(n) => `${n} order${n === 1 ? '' : 's'}`} />
        </Panel>
        <Panel title="material preference · by grams">
          <RankBars data={s.materials} format={formatGrams} empty="No orders yet." />
        </Panel>
      </div>
    </div>
  )
}
