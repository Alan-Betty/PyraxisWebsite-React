import type { ProductType } from '../../api/types'
import { KEYCHAIN_RATE, PRINT_TIERS, tierIndexFor } from '../../lib/pricing'

/** The pricing matrix as a strip of cards. Pass the live weight to highlight the tier that applies. */
export default function PricingTiers({ totalWeightG, productType }: { totalWeightG?: number; productType?: ProductType }) {
  const live = totalWeightG !== undefined && totalWeightG > 0
  const activePrint = live && productType === 'print' ? tierIndexFor(totalWeightG) : -1
  const activeKey = live && productType === 'keychain'

  const cards = [
    ...PRINT_TIERS.map((t, i) => ({ key: `t${i}`, title: t.label, rate: t.rate, note: i === 0 ? 'small parts & prototypes' : i === 1 ? 'mid-size jobs' : 'bulk & big builds', active: i === activePrint })),
    { key: 'kc', title: 'Keychains', rate: KEYCHAIN_RATE, note: 'flat rate, any weight', active: activeKey },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line soft overflow-hidden">
      {cards.map((c) => (
        <div key={c.key} className={`p-5 transition-colors ${c.active ? 'bg-flame text-black' : 'bg-[var(--bg)]'}`}>
          <span className={`kicker text-[9px] ${c.active ? 'text-black/70' : ''}`}>{c.key === 'kc' ? 'keychains' : `standard · ${c.title}`}</span>
          <div className="font-display simple:font-sans font-bold text-[clamp(1.8rem,4vw,2.6rem)] leading-none mt-3 tabular-nums">
            ₹{c.rate}
            <span className={`text-sm font-mono ml-1 ${c.active ? 'text-black/70' : 'text-[var(--fg-dim)]'}`}>/g</span>
          </div>
          <span className={`block font-mono simple:font-sans text-[11px] mt-2 ${c.active ? 'text-black/70' : 'text-[var(--fg-dim)]'}`}>{c.note}</span>
        </div>
      ))}
    </div>
  )
}
