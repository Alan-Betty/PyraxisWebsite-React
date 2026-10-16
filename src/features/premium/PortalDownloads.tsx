import { listPremiumAssets } from '../../api/portal'
import { useQuery } from '../../hooks/useQuery'
import { Empty, Loading } from '../../components/ui/ui'
import AssetLinks from '../../components/AssetLinks'

export default function PortalDownloads() {
  const { data, loading } = useQuery(listPremiumAssets)
  if (loading) return <Loading />
  const premium = (data ?? []).filter((a) => a.access === 'premium')
  const rest = (data ?? []).filter((a) => a.access !== 'premium')
  if (!premium.length && !rest.length) return <Empty title="Nothing to download yet" />
  return (
    <div className="grid grid-cols-1 gap-8 max-w-4xl">
      {premium.length > 0 && (
        <div>
          <span className="kicker">members only</span>
          <div className="mt-3">
            <AssetLinks assets={premium} />
          </div>
        </div>
      )}
      {rest.length > 0 && (
        <div>
          <span className="kicker">public downloads</span>
          <div className="mt-3">
            <AssetLinks assets={rest} />
          </div>
        </div>
      )}
    </div>
  )
}
