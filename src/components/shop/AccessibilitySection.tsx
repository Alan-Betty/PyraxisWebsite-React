const POINTS = [
  'WCAG-compatible documentation and guidance',
  'Screen reader announcements via USB + Bluetooth HID',
  'On-device onboarding with audio prompts + haptic cues',
  'Customizable profiles for different abilities',
]

export default function AccessibilitySection() {
  return (
    <section id="accessibility" className="px-5 py-24">
      <div className="max-w-4xl mx-auto border border-line p-8 md:p-12">
        <span className="kicker">// compliance</span>
        <h2 className="display text-[clamp(1.8rem,5vw,3.5rem)] mt-3 mb-6">access is the <span className="flame-text">default</span>.</h2>
        <p className="font-mono text-[13px] text-[var(--fg-dim)] mb-6 max-w-xl">
          PyKey is designed to work alongside screen readers and assistive software. It supports:
        </p>
        <ul className="border-t border-line">
          {POINTS.map((p) => (
            <li key={p} className="flex items-start gap-3 py-3 border-b border-line font-mono text-[13px]">
              <span className="text-flame">✓</span>
              <span className="text-[var(--fg-dim)]">{p}</span>
            </li>
          ))}
        </ul>
        <p className="font-mono text-[12px] text-[var(--fg-dim)] mt-6">
          We welcome feedback from assistive-technology users to keep improving compatibility.
        </p>
      </div>
    </section>
  )
}
