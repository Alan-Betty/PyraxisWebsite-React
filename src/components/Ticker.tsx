const ITEMS = [
  'ZERO TELEMETRY',
  'OPEN SOURCE',
  'SIGNED UPDATES',
  'TRACKER FIREWALL',
  'BRAILLE KEYBOARD',
  'TERRATABS AI',
  'READER MODE',
  'QUICK SEARCH SWITCH',
  'NATIVE SCREEN RECORDER',
]

export default function Ticker({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="border-y border-line bg-flame text-black overflow-hidden select-none">
      <div
        className="flex w-max animate-ticker py-2"
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {[...ITEMS, ...ITEMS].map((t, i) => (
          <span key={i} className="flex items-center font-mono font-bold text-[12px] tracking-[0.15em] whitespace-nowrap px-5">
            {t}
            <span className="mx-5 text-black/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
