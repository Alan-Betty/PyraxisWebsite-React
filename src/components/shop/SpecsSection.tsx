const SPECS: [string, string][] = [
  ['form_factor', 'Compact 75% with tactile-optimized layout'],
  ['connectivity', 'USB wired'],
  ['actuation', 'Tactile domes optimized for confidence'],
  ['keycaps', 'High-contrast, Braille-printable PBT with raised markers'],
  ['firmware', 'Open-source, screen-reader friendly, voice/gesture'],
  ['assistive_hw', 'Haptic motor, tactile markers'],
  ['profiles', 'Multiple accessibility profiles (on-device)'],
  ['dimensions', 'Depends on model'],
]

export default function SpecsSection() {
  return (
    <section id="specs" className="px-5 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <span className="kicker">// pykey --specs</span>
          <h2 className="display text-[clamp(2rem,5.5vw,4rem)] mt-3">the <span className="flame-text">datasheet</span>.</h2>
        </div>
        <div className="border border-line font-mono text-[13px]">
          {SPECS.map(([k, v], i) => (
            <div key={k} className={`grid sm:grid-cols-[12rem_1fr] gap-2 sm:gap-6 px-5 py-4 border-b border-line last:border-b-0 ${i % 2 ? 'bg-ink-2/40 light:bg-bone/20' : ''}`}>
              <span className="text-flame">{k}</span>
              <span className="text-[var(--fg-dim)]">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
