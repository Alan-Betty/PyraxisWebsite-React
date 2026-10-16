import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/auth-context'
import { getConfig } from '../../api/public'
import { DEFAULT_CONFIG } from '../../api/seed'
import { useQuery } from '../../hooks/useQuery'
import AccountShell from '../../components/AccountShell'
import { Notice, Tabs } from '../../components/ui/ui'
import PortalOverview from './PortalOverview'
import InstantBooking from './InstantBooking'
import CustomRequest from './CustomRequest'
import MyOrders from './MyOrders'
import PortalDownloads from './PortalDownloads'
import AccountSettings from './AccountSettings'

const TABS = [
  { id: 'overview', label: 'Overview', hint: 'status' },
  { id: 'instant', label: 'Instant booking', hint: 'ready-made · re-order' },
  { id: 'custom', label: 'Custom print', hint: 'upload · calculator' },
  { id: 'orders', label: 'My orders', hint: 'tracking · quotes' },
  { id: 'downloads', label: 'Downloads', hint: 'files' },
  { id: 'account', label: 'Account', hint: 'addresses · password' },
] as const

type Tab = (typeof TABS)[number]['id']

/** Premium customer hub. Tab, open order and re-order source live in the URL so they survive reloads. */
export default function PortalPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const { data: cfg = DEFAULT_CONFIG } = useQuery(getConfig)
  const tab = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'overview') as Tab
  const orderId = params.get('order')
  const reorder = params.get('reorder')

  const go = (next: Tab, extra: Record<string, string> = {}) => {
    setParams({ tab: next, ...extra })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const openOrder = (id: string | null) => go('orders', id ? { order: id } : {})

  if (!user) return null

  return (
    <AccountShell
      kicker="// premium · customer hub"
      title={
        <>
          hey, <span className="flame-text">{user.name.split(' ')[0].toLowerCase()}</span>.
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6">
        <Tabs label="Portal sections" tabs={[...TABS]} value={tab} onChange={(t) => go(t)} />
        {!cfg.acceptingOrders && (tab === 'instant' || tab === 'custom') && <Notice tone="error">We're not taking new print requests right now. Existing orders are unaffected.</Notice>}

        {tab === 'overview' && <PortalOverview user={user} go={go} openOrder={openOrder} />}
        {tab === 'instant' && <InstantBooking key={reorder ?? 'new'} cfg={cfg} onViewOrder={openOrder} initialOrderId={reorder} />}
        {tab === 'custom' && <CustomRequest cfg={cfg} onViewOrder={openOrder} />}
        {tab === 'orders' && <MyOrders cfg={cfg} openId={orderId} onOpen={openOrder} onReorder={(id) => go('instant', { reorder: id })} />}
        {tab === 'downloads' && <PortalDownloads />}
        {tab === 'account' && <AccountSettings key={user.id} user={user} />}
      </div>
    </AccountShell>
  )
}
