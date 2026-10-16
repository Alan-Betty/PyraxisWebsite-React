import { useRef, useState } from 'react'
import { ExternalLink, FilePlus2, Link2, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import type { Asset } from '../../../api/types'
import { deleteAsset, listAssets, replaceAssetFile, updateAsset } from '../../../api/admin/assets'
import { assetStats } from '../../../api/admin/analytics'
import { useAction, useQuery } from '../../../hooks/useQuery'
import { formatBytes, formatDate, formatNum } from '../../../lib/format'
import { ACCESS_META, ASSET_CATEGORIES } from '../../../lib/assets'
import { Badge, Button, Empty, Loading, Notice, Panel, Select, Stat, Toggle } from '../../../components/ui/ui'
import { ColumnChart, RankBars } from '../charts'
import AssetEditor from './AssetEditor'

/** Tab 1 — site-wide digital resources and downloads. */
export default function AssetsTab() {
  const assets = useQuery(listAssets)
  const stats = useQuery(() => assetStats(14))
  const [editing, setEditing] = useState<Asset | 'upload' | 'link' | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const patch = useAction(updateAsset)
  const remove = useAction(deleteAsset)
  const replace = useAction(replaceAssetFile)
  const replaceInput = useRef<HTMLInputElement>(null)
  const [replacing, setReplacing] = useState<Asset | null>(null)

  const s = stats.data
  const error = patch.error || remove.error || replace.error

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="total downloads" value={s ? formatNum(s.totalDownloads) : '—'} />
        <Stat label="bandwidth served" value={s ? formatBytes(s.bandwidth) : '—'} sub="size × downloads" />
        <Stat label="live assets" value={s ? `${s.enabled}/${s.total}` : '—'} sub="enabled / total" />
        <Stat label="last 14 days" value={s ? formatNum(s.daily.reduce((a, d) => a + d.value, 0)) : '—'} sub="downloads" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        <Panel title="downloads per day · 14 days">{s ? <ColumnChart data={s.daily} title="Downloads per day, last 14 days" /> : <Loading />}</Panel>
        <Panel title="most downloaded">{s ? <RankBars data={s.popular} format={(n) => `${formatNum(n)} dl`} empty="No downloads recorded yet." /> : <Loading />}</Panel>
      </div>

      {/* registry */}
      <Panel
        title="asset registry"
        bodyClass=""
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={() => setEditing('link')}>
              <Link2 size={13} /> Add link
            </Button>
            <Button size="sm" onClick={() => setEditing('upload')}>
              <FilePlus2 size={13} /> Upload file
            </Button>
          </>
        }
      >
        <input
          ref={replaceInput}
          type="file"
          className="sr-only"
          aria-label="Replacement file"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (f && replacing) {
              const version = prompt(`New version label for ${replacing.name}`, replacing.version) ?? replacing.version
              const r = await replace.run(replacing.id, f, version)
              if (r.ok) setFlash(`Replaced the file behind “${replacing.name}”.`)
            }
            setReplacing(null)
            e.target.value = ''
          }}
        />
        {(error || flash) && (
          <div className="p-4 border-b border-line">
            {error ? <Notice tone="error">{error}</Notice> : <Notice tone="ok" onDismiss={() => setFlash(null)}>{flash}</Notice>}
          </div>
        )}
        {assets.loading ? (
          <Loading />
        ) : !assets.data?.length ? (
          <div className="p-5">
            <Empty title="No assets yet">Upload a file or add a link to get started.</Empty>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono simple:font-sans text-[12px] min-w-[860px]">
              <thead>
                <tr className="kicker text-[9px] border-b border-line">
                  <th className="px-4 py-3 font-normal">asset</th>
                  <th className="px-4 py-3 font-normal">placement</th>
                  <th className="px-4 py-3 font-normal">access</th>
                  <th className="px-4 py-3 font-normal text-right">size</th>
                  <th className="px-4 py-3 font-normal text-right">downloads</th>
                  <th className="px-4 py-3 font-normal">live</th>
                  <th className="px-4 py-3 font-normal text-right">actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.data.map((a) => (
                  <tr key={a.id} className={`border-b border-line last:border-b-0 ${a.enabled ? '' : 'opacity-60'}`}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[13px] text-[var(--fg)]">{a.name}</div>
                      <div className="text-[var(--fg-dim)] text-[11px] mt-0.5 flex items-center gap-1.5">
                        {a.filename} · v{a.version}
                        {a.source.kind === 'external' && <ExternalLink size={11} />}
                      </div>
                      <div className="kicker text-[8px] mt-1">updated {formatDate(a.updatedAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{ASSET_CATEGORIES.find((c) => c.id === a.category)?.label ?? a.category}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={a.access}
                        onChange={(e) => patch.run(a.id, { access: e.target.value as Asset['access'] })}
                        aria-label={`Access for ${a.name}`}
                        className="h-8 w-[120px] text-[12px]"
                      >
                        {Object.entries(ACCESS_META).map(([k, m]) => (
                          <option key={k} value={k}>
                            {m.label}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--fg-dim)]">{a.source.kind === 'external' ? 'link' : formatBytes(a.size)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNum(a.downloads)}</td>
                    <td className="px-4 py-3">
                      <Toggle checked={a.enabled} onChange={(v) => patch.run(a.id, { enabled: v })} label={`${a.enabled ? 'Disable' : 'Enable'} ${a.name}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <IconBtn label={`Edit ${a.name}`} onClick={() => setEditing(a)}>
                          <Pencil size={13} />
                        </IconBtn>
                        {a.source.kind !== 'external' && (
                          <IconBtn
                            label={`Replace file for ${a.name}`}
                            onClick={() => {
                              setReplacing(a)
                              replaceInput.current?.click()
                            }}
                          >
                            <RefreshCw size={13} />
                          </IconBtn>
                        )}
                        {a.source.kind !== 'static' && (
                          <IconBtn
                            label={`Delete ${a.name}`}
                            danger
                            onClick={async () => {
                              if (!confirm(`Delete “${a.name}” and its download stats? This can't be undone.`)) return
                              const r = await remove.run(a.id)
                              if (r.ok) setFlash(`Deleted “${a.name}”.`)
                            }}
                          >
                            <Trash2 size={13} />
                          </IconBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="px-4 py-3 border-t border-line kicker text-[9px]">
          placement: {ASSET_CATEGORIES.map((c) => `${c.label} → ${c.where}`).join(' · ')}
        </p>
      </Panel>

      {editing && (
        <AssetEditor
          mode={editing === 'upload' || editing === 'link' ? editing : 'edit'}
          asset={typeof editing === 'object' ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setFlash(msg)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function IconBtn({ label, onClick, children, danger = false }: { label: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={`w-8 h-8 grid place-items-center border border-line transition-colors simple:rounded-lg ${danger ? 'hover:border-red-400 hover:text-red-400' : 'hover:border-flame hover:text-flame'}`}>
      {children}
    </button>
  )
}
