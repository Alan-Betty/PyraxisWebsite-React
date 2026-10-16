import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/auth-context'
import { can } from '../../api/permissions'
import AccountShell from '../../components/AccountShell'
import { Tabs } from '../../components/ui/ui'
import AssetsTab from './assets/AssetsTab'
import PrintingOpsTab from './printing/PrintingOpsTab'
import SettingsTab from './settings/SettingsTab'

type Tab = 'assets' | 'printing' | 'settings'

/**
 * Admin & moderator control panel. Asset/download management and premium
 * printing operations are separate tabs with separate modules underneath.
 */
export default function AdminPage() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()

  const tabs = [
    { id: 'printing' as const, label: 'Printing & accounts', hint: 'queue · quotes · coupons', show: can(user?.role, 'orders') },
    { id: 'assets' as const, label: 'Assets & downloads', hint: 'files · access · stats', show: can(user?.role, 'assets') },
    { id: 'settings' as const, label: 'Site settings', hint: 'pricing · contact', show: can(user?.role, 'settings') },
  ].filter((t) => t.show)

  const tab = (tabs.find((t) => t.id === params.get('tab'))?.id ?? tabs[0]?.id) as Tab

  return (
    <AccountShell
      kicker={user?.role === 'admin' ? '// admin · control panel' : '// moderator · control panel'}
      title={
        <>
          control <span className="flame-text">panel</span>.
        </>
      }
    >
      <div className="grid grid-cols-1 gap-8">
        <Tabs label="Admin sections" tabs={tabs} value={tab} onChange={(t) => setParams({ tab: t })} />
        {tab === 'printing' && <PrintingOpsTab />}
        {tab === 'assets' && <AssetsTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </AccountShell>
  )
}
