import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Download } from 'lucide-react'
import { RELEASES, OS_META, detectOS, type OS, type Channel } from '../data/releases'

const CHANNELS: Channel[] = ['stable', 'beta', 'nightly']
const CHANNEL_META: Record<Channel, { label: string; note: string }> = {
  stable: { label: 'stable', note: 'production-ready · recommended' },
  beta: { label: 'beta', note: 'early features · mostly safe' },
  nightly: { label: 'nightly', note: 'bleeding edge · may break' },
}

const OS_ORDER: OS[] = ['macos', 'windows', 'linux', 'mobile']

export default function DownloadHub() {
  const [os, setOs] = useState<OS>(() => detectOS())
  const [channel, setChannel] = useState<Channel>('beta')
  const [copied, setCopied] = useState(false)

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
            <span className="kicker">// release registry</span>
            <h2 className="display text-[clamp(2.2rem,6vw,4.5rem)] mt-3">
              get <span className="flame-text">pyraxis</span>.
            </h2>
          </div>
          <p className="font-mono text-[13px] text-[var(--fg-dim)] max-w-xs">
            Pick your platform and channel. We pre-selected{' '}
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
                <span className="block font-display font-bold text-base leading-none">{OS_META[o].label}</span>
                <span className={`block kicker text-[9px] mt-1.5 ${active ? 'text-black/60' : ''}`}>
                  {o === detectOS() ? 'detected' : 'available'}
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
                    <span className={`w-2 h-2 ${active ? 'bg-flame' : 'border border-line'}`} />
                    <span className={`font-display font-semibold ${active ? '' : 'text-[var(--fg-dim)]'}`}>
                      {CHANNEL_META[c].label}
                    </span>
                  </span>
                  <span className="block kicker text-[9px] mt-1.5 pl-4">{CHANNEL_META[c].note}</span>
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
              <span className="font-display font-bold text-3xl">
                v{release.version}
                <span className="text-flame text-base ml-2">/{release.channel}</span>
              </span>
              <span className="kicker">released {release.date}</span>
            </div>

            <div className="grid sm:grid-cols-[1fr_auto] gap-6 items-start">
              {/* changelog */}
              <ul className="font-mono text-[13px] text-[var(--fg-dim)] space-y-1.5">
                {release.notes.map((n, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-flame">+</span>
                    {n}
                  </li>
                ))}
              </ul>

              {/* meta block */}
              <div className="font-mono text-[11px] text-[var(--fg-dim)] border border-line p-3 min-w-[150px] space-y-1">
                <Meta k="file" v={`pyraxis${build.ext}`} />
                <Meta k="size" v={build.size} />
                <Meta k="arch" v={build.arch} />
                <Meta k="os" v={OS_META[os].label} />
              </div>
            </div>

            {/* actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <a
                href={build.url}
                download
                className="group inline-flex items-center justify-center gap-3 h-[52px] px-7 py-4 bg-flame text-black font-bold tracking-wide hover:bg-ember transition-colors"
              >
                <Download size={18} />
                download {OS_META[os].label} · {build.size}
              </a>

              <button
                onClick={copyCmd}
                className="inline-flex items-center gap-3 h-[52px] px-5 py-4 border border-line hover:border-flame transition-colors font-mono text-[13px] text-[var(--fg-dim)] hover:text-[var(--fg)]"
              >
                <span className="text-flame">$</span>
                <span className="truncate max-w-[220px]">{cmd}</span>
                {copied ? <Check size={15} className="text-flame" /> : <Copy size={15} />}
              </button>
            </div>
            <p className="kicker text-[9px] mt-4">
              sha256 verified · signed build · {build.url.includes('apk') ? 'sideload enabled' : 'notarized'}
            </p>
          </motion.div>
        </div>

        {/* full release table */}
        <div className="mt-10">
          <span className="kicker">// all builds</span>
          <div className="mt-3 border border-line overflow-x-auto">
            <table className="w-full text-left font-mono text-[12px] min-w-[560px]">
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
                      <td className="px-4 py-3 text-[var(--fg-dim)]">{b.size}</td>
                      <td className="px-4 py-3 text-right">
                        <a href={b.url} download className="text-flame hover:underline">
                          ↓ {b.ext}
                        </a>
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
