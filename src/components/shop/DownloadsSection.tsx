import { FileDown } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'

const LINKS = [
  { label: 'firmware.tar', sub: 'github · latest', href: 'https://github.com/Pyraxis/pykey-firmware', external: true },
  { label: 'config-tool.zip', sub: 'desktop · v1.2', href: '/downloads/pykey-config-tool.zip', filename: 'pykey-config-tool.zip' },
  { label: 'keymap-doc.pdf', sub: 'manual · 1.1 MB', href: '/downloads/PyKey Map Doc.pdf', filename: 'PyKey Map Doc.pdf' },
]

export default function DownloadsSection() {
  return (
    <section id="downloads" className="px-5 py-24 border-t border-line">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <span className="kicker">// software &amp; downloads</span>
          <h2 className="display text-[clamp(2rem,5.5vw,4rem)] mt-3">flash it. <span className="flame-text">tune it</span>.</h2>
        </div>
        <div className="border border-line">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              download={l.filename}
              target={l.external ? '_blank' : undefined}
              rel={l.external ? 'noopener' : undefined}
              className="group flex items-center justify-between gap-4 px-5 py-5 border-b border-line last:border-b-0 hover:bg-flame/[0.04] transition-colors"
            >
              <span className="flex items-center gap-4">
                <span className="text-flame">{l.external ? <FaGithub size={18} /> : <FileDown size={18} />}</span>
                <span>
                  <span className="block font-mono font-semibold text-[14px]">{l.label}</span>
                  <span className="block kicker text-[9px] mt-0.5">{l.sub}</span>
                </span>
              </span>
              <span className="font-mono text-[12px] text-flame group-hover:translate-x-1 transition-transform">↓ get</span>
            </a>
          ))}
        </div>
        <p className="font-mono text-[12px] text-[var(--fg-dim)] mt-5">
          accessibility needs? mail{' '}
          <a href="mailto:Pyraxis.official@gmail.com" className="text-flame hover:underline">Pyraxis.official@gmail.com</a>{' '}
          for tailored builds.
        </p>
      </div>
    </section>
  )
}
