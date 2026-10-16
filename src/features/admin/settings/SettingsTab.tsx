import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PricingMode, SiteConfig } from '../../../api/types'
import { getConfig } from '../../../api/public'
import { resetAllData, updateConfig } from '../../../api/admin/settings'
import { useAction, useQuery } from '../../../hooks/useQuery'
import { useAuth } from '../../../auth/auth-context'
import { computeQuote } from '../../../lib/pricing'
import { formatINR, toNum } from '../../../lib/format'
import { Button, Field, Loading, Notice, Panel, Select, TextField, Toggle } from '../../../components/ui/ui'

export default function SettingsTab() {
  const { data, loading } = useQuery(getConfig)
  // the form keeps its own state after the first load, so a save does not reset it
  if (loading || !data) return <Loading />
  return <SettingsForm cfg={data} />
}

function SettingsForm({ cfg }: { cfg: SiteConfig }) {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [wa, setWa] = useState(cfg.whatsappNumber)
  const [shipping, setShipping] = useState(String(cfg.shippingFee))
  const [mode, setMode] = useState<PricingMode>(cfg.pricingMode)
  const [bv, setBv] = useState({ x: String(cfg.buildVolume.x), y: String(cfg.buildVolume.y), z: String(cfg.buildVolume.z) })
  const [maxMB, setMaxMB] = useState(String(cfg.maxUploadMB))
  const [accepting, setAccepting] = useState(cfg.acceptingOrders)
  const [saved, setSaved] = useState(false)
  const save = useAction(updateConfig)
  const wipe = useAction(resetAllData)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(false)
    const r = await save.run({
      whatsappNumber: wa,
      shippingFee: toNum(shipping),
      pricingMode: mode,
      buildVolume: { x: toNum(bv.x), y: toNum(bv.y), z: toNum(bv.z) },
      maxUploadMB: toNum(maxMB),
      acceptingOrders: accepting,
    })
    if (r.ok) setSaved(true)
  }

  // the cliff between tiers, shown so the choice of mode is an informed one
  const sample = (g: number, m: PricingMode) => formatINR(computeQuote({ productType: 'print', weightG: g, quantity: 1, shippingFee: 0, mode: m }).subtotal)

  return (
    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <Panel title="orders & contact">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between gap-4 border border-line p-3 soft">
            <span>
              <span className="block font-display simple:font-sans font-semibold">Accepting new print requests</span>
              <span className="block font-mono simple:font-sans text-[11px] text-[var(--fg-dim)] mt-0.5">Pause during holidays or when the queue is full.</span>
            </span>
            <Toggle checked={accepting} onChange={setAccepting} label="Accepting orders" />
          </div>
          <TextField label="whatsapp number" value={wa} onChange={(e) => setWa(e.target.value)} hint="with country code, e.g. 918848901279 — used by every WhatsApp button" inputMode="tel" />
          <TextField label="flat shipping fee (₹)" type="number" min={0} value={shipping} onChange={(e) => setShipping(e.target.value)} />
          <TextField label="max model upload (MB)" type="number" min={1} max={200} value={maxMB} onChange={(e) => setMaxMB(e.target.value)} />
        </div>
      </Panel>

      <Panel title="pricing & printer">
        <div className="grid grid-cols-1 gap-4">
          <Field label="tier calculation" hint={mode === 'slab' ? 'The whole order is billed at the rate of its weight tier — the matrix as published.' : 'Each band of grams is billed at its own rate, so a heavier order never costs less.'}>
            <Select value={mode} onChange={(e) => setMode(e.target.value as PricingMode)}>
              <option value="slab">Slab — whole order at its tier rate</option>
              <option value="progressive">Progressive — each band at its own rate</option>
            </Select>
          </Field>
          <div className="border border-line soft overflow-hidden">
            <table className="w-full font-mono simple:font-sans text-[12px] tabular-nums">
              <thead>
                <tr className="kicker text-[9px] border-b border-line">
                  <th className="text-left px-3 py-2 font-normal">order weight</th>
                  <th className="text-right px-3 py-2 font-normal">slab</th>
                  <th className="text-right px-3 py-2 font-normal">progressive</th>
                </tr>
              </thead>
              <tbody>
                {[150, 151, 250, 251, 400].map((g) => (
                  <tr key={g} className="border-b border-line/60 last:border-b-0">
                    <td className="px-3 py-1.5">{g} g</td>
                    <td className={`px-3 py-1.5 text-right ${mode === 'slab' ? 'text-flame' : 'text-[var(--fg-dim)]'}`}>{sample(g, 'slab')}</td>
                    <td className={`px-3 py-1.5 text-right ${mode === 'progressive' ? 'text-flame' : 'text-[var(--fg-dim)]'}`}>{sample(g, 'progressive')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Field label="build volume x × y × z (mm)" group hint="parts bigger than this get flagged for splitting">
            <div className="grid grid-cols-3 gap-2">
              {(['x', 'y', 'z'] as const).map((k) => (
                <TextField key={k} label={k} type="number" min={1} value={bv[k]} onChange={(e) => setBv({ ...bv, [k]: e.target.value })} />
              ))}
            </div>
          </Field>
        </div>
      </Panel>

      <div className="lg:col-span-2 grid grid-cols-1 gap-3">
        {save.error && <Notice tone="error">{save.error}</Notice>}
        {saved && <Notice tone="ok">Settings saved. Quotes everywhere now use these values.</Notice>}
        <div>
          <Button type="submit" loading={save.pending}>
            Save settings
          </Button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <Panel title="danger zone">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono simple:font-sans text-[12px] text-[var(--fg-dim)] max-w-xl">
              Reset every account, order, coupon, asset record and uploaded file stored in this browser back to the starting data. You'll be signed out.
            </p>
            <Button
              type="button"
              variant="danger"
              loading={wipe.pending}
              onClick={async () => {
                if (prompt('Type RESET to wipe all data in this browser.') !== 'RESET') return
                const r = await wipe.run()
                if (r.ok) {
                  await refresh()
                  navigate('/login')
                }
              }}
            >
              Reset all data
            </Button>
          </div>
          {wipe.error && (
            <div className="mt-3">
              <Notice tone="error">{wipe.error}</Notice>
            </div>
          )}
        </Panel>
      </div>
    </form>
  )
}
