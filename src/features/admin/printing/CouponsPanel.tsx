import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { Coupon, CouponType } from '../../../api/types'
import { createCoupon, deleteCoupon, listCoupons, updateCoupon, type CouponInput } from '../../../api/admin/coupons'
import { useAction, useQuery } from '../../../hooks/useQuery'
import { describeCoupon, endOfDay } from '../../../lib/pricing'
import { formatDate, toNum } from '../../../lib/format'
import { Badge, Button, Empty, Field, Loading, Modal, Notice, Select, TextField, Toggle, type Tone } from '../../../components/ui/ui'

function couponState(c: Coupon): { label: string; tone: Tone } {
  if (!c.active) return { label: 'disabled', tone: 'muted' }
  if (c.expiresAt && endOfDay(c.expiresAt) < new Date()) return { label: 'expired', tone: 'bad' }
  if (c.maxUses !== null && c.uses >= c.maxUses) return { label: 'used up', tone: 'warn' }
  return { label: 'live', tone: 'ok' }
}

export default function CouponsPanel() {
  const { data: coupons = [], loading } = useQuery(listCoupons)
  const [editing, setEditing] = useState<Coupon | 'new' | null>(null)
  const toggle = useAction((c: Coupon, active: boolean) => updateCoupon(c.id, { ...c, active }))
  const remove = useAction(deleteCoupon)

  if (loading) return <Loading />

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono simple:font-sans text-[12px] text-[var(--fg-dim)] max-w-xl">Codes are checked live in the customer's calculator and again when the request is submitted. Minimum weight is the order's total grams.</p>
        <Button onClick={() => setEditing('new')}>
          <Plus size={14} /> New coupon
        </Button>
      </div>
      {(toggle.error || remove.error) && <Notice tone="error">{toggle.error || remove.error}</Notice>}
      {coupons.length === 0 ? (
        <Empty title="No coupons yet" />
      ) : (
        <div className="border border-line soft overflow-x-auto">
          <table className="w-full text-left font-mono simple:font-sans text-[12px] min-w-[820px]">
            <thead>
              <tr className="kicker text-[9px] border-b border-line">
                <th className="px-4 py-3 font-normal">code</th>
                <th className="px-4 py-3 font-normal">offer</th>
                <th className="px-4 py-3 font-normal">expires</th>
                <th className="px-4 py-3 font-normal text-right">uses</th>
                <th className="px-4 py-3 font-normal">state</th>
                <th className="px-4 py-3 font-normal">on</th>
                <th className="px-4 py-3 font-normal text-right">actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const st = couponState(c)
                return (
                  <tr key={c.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="font-bold text-[13px] text-flame">{c.code}</div>
                      <div className="text-[var(--fg-dim)] text-[11px] mt-0.5">{c.description}</div>
                    </td>
                    <td className="px-4 py-3">{describeCoupon(c)}</td>
                    <td className="px-4 py-3 text-[var(--fg-dim)]">{c.expiresAt ? formatDate(c.expiresAt) : 'never'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {c.uses}
                      {c.maxUses !== null && <span className="text-[var(--fg-dim)]"> / {c.maxUses}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Toggle checked={c.active} onChange={(v) => toggle.run(c, v)} label={`${c.active ? 'Disable' : 'Enable'} ${c.code}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(c)} aria-label={`Edit ${c.code}`}>
                          <Pencil size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          aria-label={`Delete ${c.code}`}
                          onClick={() => {
                            if (confirm(`Delete ${c.code}? Orders that used it keep their discount.`)) remove.run(c.id)
                          }}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {editing && <CouponEditor coupon={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function CouponEditor({ coupon, onClose }: { coupon: Coupon | null; onClose: () => void }) {
  const [code, setCode] = useState(coupon?.code ?? '')
  const [description, setDescription] = useState(coupon?.description ?? '')
  const [type, setType] = useState<CouponType>(coupon?.type ?? 'percent')
  const [value, setValue] = useState(String(coupon?.value ?? 10))
  const [minWeight, setMinWeight] = useState(String(coupon?.minWeightG ?? 0))
  const [expiresAt, setExpiresAt] = useState(coupon?.expiresAt ?? '')
  const [maxUses, setMaxUses] = useState(coupon?.maxUses === null || coupon?.maxUses === undefined ? '' : String(coupon.maxUses))
  const [active, setActive] = useState(coupon?.active ?? true)

  const save = useAction(async () => {
    const input: CouponInput = {
      code,
      description,
      type,
      value: toNum(value),
      minWeightG: toNum(minWeight) || 0,
      expiresAt: expiresAt || null,
      maxUses: maxUses.trim() ? toNum(maxUses) : null,
      active,
    }
    return coupon ? updateCoupon(coupon.id, input) : createCoupon(input)
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const r = await save.run()
    if (r.ok) onClose()
  }

  return (
    <Modal title={coupon ? `edit · ${coupon.code}` : 'new coupon'} onClose={onClose}>
      <form onSubmit={submit} className="grid grid-cols-2 gap-4">
        <TextField label="code" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="DIWALI15" className="col-span-2" maxLength={24} />
        <TextField label="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="internal note / what it's for" className="col-span-2" />
        <Field label="type">
          <Select value={type} onChange={(e) => setType(e.target.value as CouponType)}>
            <option value="percent">Percentage off</option>
            <option value="flat">Flat ₹ off</option>
            <option value="free_shipping">Free shipping</option>
          </Select>
        </Field>
        {type === 'free_shipping' ? (
          <Field label="value" group>
            <div className="h-10 flex items-center font-mono text-[12px] text-[var(--fg-dim)]">waives the shipping fee</div>
          </Field>
        ) : (
          <TextField label={type === 'percent' ? 'percent off' : 'rupees off'} type="number" min={1} max={type === 'percent' ? 100 : undefined} required value={value} onChange={(e) => setValue(e.target.value)} />
        )}
        <TextField label="min order weight (g)" type="number" min={0} value={minWeight} onChange={(e) => setMinWeight(e.target.value)} hint="0 = no minimum" />
        <TextField label="usage limit" type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} hint="blank = unlimited" />
        <TextField label="expires on" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} hint="blank = never · valid through end of day" />
        <Field label="active" group>
          <div className="h-10 flex items-center">
            <Toggle checked={active} onChange={setActive} label="Active" />
          </div>
        </Field>
        {save.error && (
          <div className="col-span-2">
            <Notice tone="error">{save.error}</Notice>
          </div>
        )}
        <div className="col-span-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.pending}>
            {coupon ? 'Save' : 'Create coupon'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
