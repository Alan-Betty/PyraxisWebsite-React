import { useState } from 'react'

export interface Datum {
  key: string
  label: string
  value: number
}

/**
 * Single-series column chart: thin flame bars on a recessive baseline, a
 * hover tooltip per bar, and a screen-reader table with the same numbers.
 */
export function ColumnChart({ data, format = String, title, height = 140 }: { data: Datum[]; format?: (n: number) => string; title: string; height?: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => d.value))
  const total = data.reduce((s, d) => s + d.value, 0)
  const labelEvery = Math.ceil(data.length / 7)

  return (
    <figure className="m-0">
      <figcaption className="sr-only">{title}</figcaption>
      <div className="relative" style={{ height }} onMouseLeave={() => setHover(null)}>
        {/* recessive gridlines at 0 / 50 / 100% */}
        {[0, 0.5, 1].map((f) => (
          <div key={f} className="absolute inset-x-0 border-t border-line/60" style={{ bottom: `${f * 100}%` }} aria-hidden="true" />
        ))}
        <span className="absolute -top-1 right-0 kicker text-[9px] -translate-y-full" aria-hidden="true">
          max {format(max)}
        </span>
        <div className="absolute inset-0 flex items-end gap-[2px]" aria-hidden="true">
          {data.map((d, i) => (
            <div key={d.key} className="relative flex-1 h-full flex items-end" onMouseEnter={() => setHover(i)}>
              <div
                className={`w-full rounded-t-[4px] transition-colors ${hover === i ? 'bg-ember' : 'bg-flame'} ${d.value === 0 ? 'opacity-0' : ''}`}
                style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 2 : 0 }}
              />
            </div>
          ))}
        </div>
        {hover !== null && (
          <div
            className="absolute z-10 -translate-x-1/2 -translate-y-full pointer-events-none border border-line bg-[var(--bg)] px-2 py-1 font-mono text-[11px] whitespace-nowrap shadow-lg simple:rounded-md"
            style={{ left: `${((hover + 0.5) / data.length) * 100}%`, bottom: `${(data[hover].value / max) * 100}%` }}
          >
            <span className="text-[var(--fg-dim)]">{data[hover].label}</span> · <span className="text-[var(--fg)]">{format(data[hover].value)}</span>
          </div>
        )}
      </div>
      <div className="flex gap-[2px] mt-2" aria-hidden="true">
        {data.map((d, i) => (
          <span key={d.key} className="flex-1 min-w-0 kicker text-[8px] whitespace-nowrap">
            {i % labelEvery === 0 ? d.label : ''}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>
          {title}, total {format(total)}
        </caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <th>{d.label}</th>
              <td>{format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

/** Ranked horizontal bars with the value printed beside each one. */
export function RankBars({ data, format = String, empty = 'No data yet' }: { data: Datum[]; format?: (n: number) => string; empty?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  if (!data.length || data.every((d) => d.value === 0)) return <p className="font-mono simple:font-sans text-[12px] text-[var(--fg-dim)] py-4">{empty}</p>
  return (
    <ul className="grid grid-cols-1 gap-3">
      {data.map((d) => (
        <li key={d.key} title={`${d.label}: ${format(d.value)}`}>
          <div className="flex justify-between gap-3 font-mono simple:font-sans text-[12px] mb-1">
            <span className="truncate">{d.label}</span>
            <span className="tabular-nums text-[var(--fg-dim)]">{format(d.value)}</span>
          </div>
          <div className="h-2 bg-line/50 simple:rounded-full overflow-hidden">
            <div className="h-full bg-flame rounded-r-[4px]" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
