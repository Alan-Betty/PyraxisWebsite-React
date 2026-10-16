import { ArrowRight, Boxes, FileUp, MapPin } from 'lucide-react'
import type { PublicUser } from '../../api/types'
import { listMyOrders } from '../../api/portal'
import { useQuery } from '../../hooks/useQuery'
import { OPEN_STATUSES, STATUS_META } from '../../lib/orders'
import { formatINR } from '../../lib/format'
import { Badge, Empty, Loading, Panel, Stat } from '../../components/ui/ui'
import OrderTimeline from '../../components/printing/OrderTimeline'

export default function PortalOverview({ user, go, openOrder }: { user: PublicUser; go: (tab: 'instant' | 'custom' | 'account') => void; openOrder: (id: string) => void }) {
  const { data: orders = [], loading } = useQuery(listMyOrders)
  if (loading) return <Loading />

  const open = orders.filter((o) => OPEN_STATUSES.includes(o.status))
  const needsYou = orders.filter((o) => o.status === 'quoted')
  const done = orders.filter((o) => o.status === 'completed')

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="active orders" value={open.length} />
        <Stat label="needs your ok" value={needsYou.length} sub={needsYou.length ? 'quotes waiting' : 'all clear'} />
        <Stat label="completed" value={done.length} />
        <Stat label="priority tier" value={<span className="capitalize">{user.tier}</span>} sub="queue priority" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <QuickAction icon={Boxes} title="Instant booking" body="Ready-made models or a previous job — set quantity and book." onClick={() => go('instant')} />
        <QuickAction icon={FileUp} title="Custom print request" body="Upload STL / OBJ / 3MF, tune settings, see the price live." onClick={() => go('custom')} />
      </div>

      {needsYou.length > 0 && (
        <Panel title="action needed" bodyClass="">
          {needsYou.map((o) => (
            <button key={o.id} onClick={() => openOrder(o.id)} className="w-full flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-line last:border-b-0 hover:bg-flame/[0.04] text-left">
              <span>
                <span className="font-mono text-[12px] text-flame mr-3">{o.ref}</span>
                <span className="font-display simple:font-sans font-semibold">{o.title}</span>
              </span>
              <span className="flex items-center gap-3">
                <span className="font-display simple:font-sans font-bold tabular-nums">{formatINR(o.quote?.total ?? 0)}</span>
                <span className="kicker text-flame">review quote →</span>
              </span>
            </button>
          ))}
        </Panel>
      )}

      <Panel title="in progress" bodyClass={open.length ? '' : 'p-5'}>
        {open.length === 0 ? (
          <Empty title="Nothing on the printer">Start a booking above — it'll be tracked here.</Empty>
        ) : (
          open.map((o) => (
            <button key={o.id} onClick={() => openOrder(o.id)} className="w-full grid grid-cols-1 sm:grid-cols-[1fr_240px] gap-3 items-center px-5 py-4 border-b border-line last:border-b-0 hover:bg-flame/[0.04] text-left">
              <span className="min-w-0">
                <span className="font-mono text-[12px] text-flame mr-3">{o.ref}</span>
                <span className="font-display simple:font-sans font-semibold">{o.title}</span>
              </span>
              <span className="grid grid-cols-1 gap-2">
                <Badge tone={STATUS_META[o.status].tone}>{STATUS_META[o.status].label}</Badge>
                <OrderTimeline order={o} compact />
              </span>
            </button>
          ))
        )}
      </Panel>

      {!user.shipping && (
        <button onClick={() => go('account')} className="flex items-center gap-3 border border-dashed border-line hover:border-flame p-4 text-left soft">
          <MapPin size={16} className="text-flame" />
          <span className="font-mono simple:font-sans text-[12px] simple:text-[13px] text-[var(--fg-dim)]">Save a shipping address so we can dispatch without asking.</span>
          <ArrowRight size={14} className="ml-auto text-flame" />
        </button>
      )}
    </div>
  )
}

function QuickAction({ icon: Icon, title, body, onClick }: { icon: typeof Boxes; title: string; body: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group text-left border border-line hover:border-flame p-5 transition-colors soft flex gap-4 items-start">
      <span className="grid place-items-center w-10 h-10 border border-line text-flame shrink-0 simple:rounded-lg">
        <Icon size={18} />
      </span>
      <span className="flex-1">
        <span className="block font-display simple:font-sans font-bold text-lg">{title}</span>
        <span className="block font-mono simple:font-sans text-[12px] simple:text-[13px] text-[var(--fg-dim)] mt-1">{body}</span>
      </span>
      <ArrowRight size={16} className="text-flame mt-1 group-hover:translate-x-1 transition-transform" />
    </button>
  )
}
