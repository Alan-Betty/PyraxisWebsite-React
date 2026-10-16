import type { Material, ProductType } from '../../api/types'
import { MATERIAL_LIST } from '../../data/printing'
import { Field } from '../ui/ui'

/** Segmented control for standard print vs keychain. */
export function ProductTypeToggle({ value, onChange }: { value: ProductType; onChange: (v: ProductType) => void }) {
  const opts: { id: ProductType; label: string; note: string }[] = [
    { id: 'print', label: 'Standard print', note: 'tiered ₹10 → ₹5/g' },
    { id: 'keychain', label: 'Keychain', note: 'flat ₹7/g' },
  ]
  return (
    <div role="radiogroup" aria-label="Print type" className="grid grid-cols-2 border border-line soft overflow-hidden">
      {opts.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={`px-4 py-3 text-left border-r border-line last:border-r-0 transition-colors ${active ? 'bg-flame text-black' : 'hover:bg-flame/[0.06] text-[var(--fg-dim)] hover:text-[var(--fg)]'}`}
          >
            <span className="block font-display simple:font-sans font-bold text-[14px] leading-none">{o.label}</span>
            <span className={`block kicker text-[9px] mt-1.5 ${active ? 'text-black/60' : ''}`}>{o.note}</span>
          </button>
        )
      })}
    </div>
  )
}

export function MaterialPicker({ value, onChange }: { value: Material; onChange: (m: Material) => void }) {
  return (
    <Field label="material" group hint={MATERIAL_LIST.find((m) => m.name === value)?.bestFor}>
      <div role="radiogroup" aria-label="Material" className="grid grid-cols-4 gap-px bg-line border border-line soft overflow-hidden">
        {MATERIAL_LIST.map((m) => (
          <button
            key={m.name}
            type="button"
            role="radio"
            aria-checked={m.name === value}
            onClick={() => onChange(m.name)}
            className={`h-10 font-mono simple:font-sans font-semibold text-[13px] transition-colors ${m.name === value ? 'bg-flame text-black' : 'bg-[var(--bg)] text-[var(--fg-dim)] hover:text-[var(--fg)]'}`}
          >
            {m.name}
          </button>
        ))}
      </div>
    </Field>
  )
}
