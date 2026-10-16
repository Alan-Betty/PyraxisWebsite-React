import { useSearchParams } from 'react-router-dom'
import { SubTabs } from '../../../components/ui/ui'
import OrdersQueue from './OrdersQueue'
import AccountsPanel from './AccountsPanel'
import CouponsPanel from './CouponsPanel'
import TemplatesPanel from './TemplatesPanel'
import PrintAnalytics from './PrintAnalytics'

const SECTIONS = [
  { id: 'queue', label: 'Order queue' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'coupons', label: 'Coupons & offers' },
  { id: 'templates', label: 'Ready-made models' },
  { id: 'analytics', label: 'Analytics' },
] as const

type Section = (typeof SECTIONS)[number]['id']

/** Tab 2 — premium printing operations and customer accounts. */
export default function PrintingOpsTab() {
  const [params, setParams] = useSearchParams()
  const section = (SECTIONS.find((s) => s.id === params.get('section'))?.id ?? 'queue') as Section

  return (
    <div className="grid grid-cols-1 gap-6">
      <SubTabs label="Printing sections" tabs={[...SECTIONS]} value={section} onChange={(s) => setParams({ tab: 'printing', section: s })} />
      {section === 'queue' && <OrdersQueue />}
      {section === 'accounts' && <AccountsPanel />}
      {section === 'coupons' && <CouponsPanel />}
      {section === 'templates' && <TemplatesPanel />}
      {section === 'analytics' && <PrintAnalytics />}
    </div>
  )
}
