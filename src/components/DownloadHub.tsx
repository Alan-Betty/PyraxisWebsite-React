import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Download } from 'lucide-react'
import { RELEASES, OS_META, detectOS, type OS, type Channel } from '../data/releases'
import { useMode } from '../context/ModeContext'

const CHANNELS: Channel[] = ['stable', 'beta']
const CHANNEL_META: Record<string, { label: string; note: string; simpleLabel: string; simpleNote: string }> = {
  stable: { label: 'stable', note: 'production-ready · recommended', simpleLabel: 'Stable', simpleNote: 'Recommended for everyone' },
  beta: { label: 'beta', note: 'early features · mostly safe', simpleLabel: 'Beta', simpleNote: 'Try new features early' },
}

const OS_ORDER: OS[] = ['macos', 'windows', 'linux', 'mobile']

export default function DownloadHub() {
  const { isDev } = useMode()
  const [os, setOs] = useState<OS>(() => detectOS())
  const [channel, setChannel] = useState<Channel>('beta')
  const [copied, setCopied] = useState(false)
  const comingSoon = OS_META[os].comingSoon

  // newest release matching channel
  const release = useMemo(() => {
    const inChannel = RELEASES.filter((r) => r.channel === channel)
    const pool = inChannel.length ? inChannel : RELEASES
    return [...pool].sort((a, b) => b.date.localeCompare(a.date))[0]
  }, [channel])

  const build = release.builds.find((b) => b.os === os) ?? release.builds[0]
  const cmd = OS_META[os].cmd

  function copyCmd() {
    navigator.clipboard?.writeText(cmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section id="download" className="px-5 py-24 border-t border-line">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <span className="kicker"><span className="dev-only">// release registry</span><span className="simple-only">Download</span></span>
            <h2 className="display text-[clamp(2.2rem,6vw,4.5rem)] mt-3">
              get <span className="flame-text">pyraxis</span>.
            </h2>
          </div>
          <p className="font-mono simple:font-sans text-[13px] simple:text-sm text-[var(--fg-dim)] max-w-xs">
            Pick your platform{isDev ? ' and channel' : ''}. We picked{' '}
            <span className="text-flame">{OS_META[os].label}</span> for you.
          </p>
        </div>

        {/* OS tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 border border-line">
          {OS_ORDER.map((o) => {
            const active = o === os
            return (
              <button
                key={o}
                onClick={() => setOs(o)}
                className={`relative px-5 py-4 text-left border-line border-r last:border-r-0 [&:nth-child(2)]:border-r md:[&:nth-child(2)]:border-r transition-colors ${
                  active ? 'bg-flame text-black' : 'hover:bg-flame/[0.06] text-[var(--fg-dim)] hover:text-[var(--fg)]'
                }`}
              >
                <span className="block font-display simple:font-sans font-bold text-base leading-none">{OS_META[o].label}</span>
                <span className={`block kicker text-[9px] mt-1.5 ${active ? 'text-black/60' : ''}`}>
                  {OS_META[o].comingSoon ? 'coming soon' : o === detectOS() ? 'detected' : 'available'}
                </span>
              </button>
            )
          })}
        </div>

        {/* channel + primary card */}
        <div className="grid lg:grid-cols-[260px_1fr] border border-line border-t-0">
          {/* channel rail */}
          <div className="border-line border-b lg:border-b-0 lg:border-r">
            {CHANNELS.map((c) => {
              const active = c === channel
              return (
                <button
                  key={c}
                  onClick={() => setChannel(c)}
                  className={`w-full text-left px-5 py-5 border-b border-line last:border-b-0 transition-colors ${
                    active ? 'bg-ink-2 light:bg-bone/40' : 'hover:bg-flame/[0.04]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 ${active ? 'bg-flame' : 'border border-line'} simple:rounded-full`} />
                    <span className={`font-display simple:font-sans font-semibold ${active ? '' : 'text-[var(--fg-dim)]'}`}>
                      <span className="dev-only">{CHANNEL_META[c].label}</span>
                      <span className="simple-only">{CHANNEL_META[c].simpleLabel}</span>
                    </span>
                  </span>
                  <span className="block kicker text-[9px] mt-1.5 pl-4">
                    <span className="dev-only">{CHANNEL_META[c].note}</span>
                    <span className="simple-only">{CHANNEL_META[c].simpleNote}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* primary build */}
          <motion.div
            key={`${os}-${channel}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="p-6 md:p-8"
          >
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-6">
              <span className="font-display simple:font-sans font-bold text-3xl">
                v{release.version}
                <span className="text-flame text-base ml-2">/{release.channel}</span>
              </span>
              <span className="kicker"><span className="dev-only">released </span>{release.date}</span>
            </div>

            <div className="grid sm:grid-cols-[1fr_auto] gap-6 items-start">
              {/* changelog */}
              <ul className="font-mono simple:font-sans text-[13px] simple:text-sm text-[var(--fg-dim)] space-y-1.5">
                {release.notes.map((n, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-flame">+</span>
                    {n}
                  </li>
                ))}
              </ul>

              {/* meta block */}
              <div className="font-mono text-[11px] text-[var(--fg-dim)] border border-line p-3 min-w-[150px] space-y-1 simple:rounded-xl">
                <Meta k="file" v={comingSoon ? '—' : `pyraxis${build.ext}`} />
                <Meta k="size" v={comingSoon ? '—' : build.size} />
                <Meta k="arch" v={comingSoon ? '—' : build.arch} />
                <Meta k="os" v={OS_META[os].label} />
              </div>
            </div>

            {/* actions */}
            {comingSoon ? (
              <div className="mt-7 border border-dashed border-line p-5 text-center simple:rounded-xl">
                <p className="font-display simple:font-sans font-bold text-lg">{OS_META[os].label} build is coming soon</p>
                <p className="font-mono simple:font-sans text-[12px] simple:text-sm text-[var(--fg-dim)] mt-1">
                  Packaging in progress. Grab macOS or Windows in the meantime.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-3 mt-7">
                  <a
                    href={build.url}
                    download
                    className="group inline-flex items-center justify-center gap-3 h-[52px] px-7 py-4 bg-flame text-black font-bold tracking-wide hover:bg-ember transition-colors simple:rounded-full simple:font-sans"
                  >
                    <Download size={18} />
                    <span className="dev-only">download {OS_META[os].label} · {build.size}</span>
                    <span className="simple-only">Download for {OS_META[os].label} ({build.size})</span>
                  </a>

                  <button
                    onClick={copyCmd}
                    className="dev-only inline-flex items-center gap-3 h-[52px] px-5 py-4 border border-line hover:border-flame transition-colors font-mono text-[13px] text-[var(--fg-dim)] hover:text-[var(--fg)]"
                  >
                    <span className="text-flame">$</span>
                    <span className="truncate max-w-[220px]">{cmd}</span>
                    {copied ? <Check size={15} className="text-flame" /> : <Copy size={15} />}
                  </button>
                </div>
                <p className="kicker text-[9px] mt-4 dev-only">
                  sha256 verified · signed build · {build.url.includes('apk') ? 'sideload enabled' : 'notarized'}
                </p>
                <p className="kicker text-[11px] mt-4 simple-only">Verified & signed · safe to install</p>
              </>
            )}
          </motion.div>
        </div>

        {/* full release table */}
        <div className="mt-10">
          <span className="kicker"><span className="dev-only">// all builds</span><span className="simple-only">All versions</span></span>
          <div className="mt-3 border border-line overflow-x-auto simple:rounded-xl">
            <table className="w-full text-left font-mono simple:font-sans text-[12px] simple:text-[13px] min-w-[560px]">
              <thead>
                <tr className="text-[var(--fg-dim)] border-b border-line kicker">
                  <th className="px-4 py-3 font-normal">version</th>
                  <th className="px-4 py-3 font-normal">channel</th>
                  <th className="px-4 py-3 font-normal">date</th>
                  <th className="px-4 py-3 font-normal">{OS_META[os].label} size</th>
                  <th className="px-4 py-3 font-normal text-right">get</th>
                </tr>
              </thead>
              <tbody>
                {[...RELEASES].sort((a, b) => b.date.localeCompare(a.date)).map((r) => {
                  const b = r.builds.find((x) => x.os === os) ?? r.builds[0]
                  return (
                    <tr key={r.version + r.channel} className="border-b border-line last:border-b-0 hover:bg-flame/[0.04] transition-colors">
                      <td className="px-4 py-3 font-semibold">v{r.version}</td>
                      <td className="px-4 py-3">
                        <span className="text-flame">/{r.channel}</span>
                      </td>
                      <td className="px-4 py-3 text-[var(--fg-dim)]">{r.date}</td>
                      <td className="px-4 py-3 text-[var(--fg-dim)]">{comingSoon ? '—' : b.size}</td>
                      <td className="px-4 py-3 text-right">
                        {comingSoon ? (
                          <span className="text-[var(--fg-dim)]">soon</span>
                        ) : (
                          <a href={b.url} download className="text-flame hover:underline">
                            ↓ {b.ext}
                          </a>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-flame/70">{k}</span>
      <span className="text-[var(--fg)]">{v}</span>
    </div>
  )
}
