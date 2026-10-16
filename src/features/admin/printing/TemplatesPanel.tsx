import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { Material, PrintTemplate, ProductType } from '../../../api/types'
import { deleteTemplate, listAllTemplates, saveTemplate } from '../../../api/admin/templates'
import { getConfig } from '../../../api/public'
import { DEFAULT_CONFIG } from '../../../api/seed'
import { useAction, useQuery } from '../../../hooks/useQuery'
import { computeQuote } from '../../../lib/pricing'
import { formatGrams, formatINR, toNum } from '../../../lib/format'
import { LAYER_HEIGHTS, MATERIAL_LIST } from '../../../data/printing'
import { Badge, Button, Empty, Field, Input, Loading, Modal, Notice, Select, Textarea, TextField, Toggle } from '../../../components/ui/ui'

/** Ready-made models offered in the portal's instant booking. */
export default function TemplatesPanel() {
  const { data: templates = [], loading } = useQuery(listAllTemplates)
  const { data: cfg = DEFAULT_CONFIG } = useQuery(getConfig)
  const [editing, setEditing] = useState<PrintTemplate | 'new' | null>(null)
  const remove = useAction(deleteTemplate)

  if (loading) return <Loading />

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono simple:font-sans text-[12px] text-[var(--fg-dim)]">Active templates show up under Instant booking for premium customers.</p>
        <Button onClick={() => setEditing('new')}>
          <Plus size={14} /> New template
        </Button>
      </div>
      {remove.error && <Notice tone="error">{remove.error}</Notice>}
      {templates.length === 0 ? (
        <Empty title="No templates yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line soft overflow-hidden">
          {templates.map((t) => {
            const unit = computeQuote({ productType: t.productType, weightG: t.weightG, quantity: 1, shippingFee: 0, mode: cfg.pricingMode })
            return (
              <div key={t.id} className={`bg-[var(--bg)] p-5 ${t.active ? '' : 'opacity-60'}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display simple:font-sans font-bold text-[16px]">{t.name}</span>
                  <Badge tone={t.active ? 'ok' : 'muted'}>{t.active ? 'active' : 'hidden'}</Badge>
                </div>
                <p className="font-mono simple:font-sans text-[12px] text-[var(--fg-dim)] mt-2">{t.description}</p>
                <div className="kicker text-[9px] mt-3">
                  {t.productType} · {t.material} · {formatGrams(t.weightG)} · {t.layerHeight} mm · {t.infill}%
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-mono text-[12px]">
                    {formatINR(unit.subtotal)} <span className="text-[var(--fg-dim)]">/ piece</span>
                  </span>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(t)} aria-label={`Edit ${t.name}`}>
                      <Pencil size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      aria-label={`Delete ${t.name}`}
                      onClick={() => {
                        if (confirm(`Delete “${t.name}”? Past orders keep their details.`)) remove.run(t.id)
                      }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {editing && <TemplateEditor template={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function TemplateEditor({ template, onClose }: { template: PrintTemplate | null; onClose: () => void }) {
  const [name, setName] = useState(template?.name ?? '')
  const [description, setDescription] = useState(template?.description ?? '')
  const [productType, setProductType] = useState<ProductType>(template?.productType ?? 'print')
  const [material, setMaterial] = useState<Material>(template?.material ?? 'PLA')
  const [weight, setWeight] = useState(String(template?.weightG ?? ''))
  const [dims, setDims] = useState({ h: String(template?.dims.h ?? ''), w: String(template?.dims.w ?? ''), d: String(template?.dims.d ?? '') })
  const [layerHeight, setLayerHeight] = useState(template?.layerHeight ?? 0.2)
  const [infill, setInfill] = useState(String(template?.infill ?? 20))
  const [active, setActive] = useState(template?.active ?? true)

  const save = useAction(() =>
    saveTemplate(template?.id ?? null, {
      name,
      description,
      productType,
      material,
      weightG: toNum(weight),
      dims: { h: toNum(dims.h) || 0, w: toNum(dims.w) || 0, d: toNum(dims.d) || 0 },
      layerHeight,
      infill: toNum(infill),
      active,
    }),
  )

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const r = await save.run()
    if (r.ok) onClose()
  }

  return (
    <Modal title={template ? `edit · ${template.name}` : 'new template'} onClose={onClose} wide>
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="type">
          <Select value={productType} onChange={(e) => setProductType(e.target.value as ProductType)}>
            <option value="print">Standard print</option>
            <option value="keychain">Keychain</option>
          </Select>
        </Field>
        <Field label="description" className="sm:col-span-2">
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} />
        </Field>
        <Field label="material">
          <Select value={material} onChange={(e) => setMaterial(e.target.value as Material)}>
            {MATERIAL_LIST.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </Select>
        </Field>
        <TextField label="weight per piece (g)" type="number" min={0} step="any" required value={weight} onChange={(e) => setWeight(e.target.value)} />
        <Field label="size h × w × d (mm)" group>
          <div className="grid grid-cols-3 gap-2">
            {(['h', 'w', 'd'] as const).map((k) => (
              <Input key={k} type="number" min={0} aria-label={k} placeholder={k.toUpperCase()} value={dims[k]} onChange={(e) => setDims({ ...dims, [k]: e.target.value })} />
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="layer">
            <Select value={layerHeight} onChange={(e) => setLayerHeight(Number(e.target.value))}>
              {LAYER_HEIGHTS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.value} mm
                </option>
              ))}
            </Select>
          </Field>
          <TextField label="infill %" type="number" min={0} max={100} value={infill} onChange={(e) => setInfill(e.target.value)} />
        </div>
        <Field label="offered in portal" group>
          <div className="h-10 flex items-center">
            <Toggle checked={active} onChange={setActive} label="Active" />
          </div>
        </Field>
        {save.error && (
          <div className="sm:col-span-2">
            <Notice tone="error">{save.error}</Notice>
          </div>
        )}
        <div className="sm:col-span-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.pending}>
            {template ? 'Save' : 'Create template'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
