import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import TerminalBackground from '../components/TerminalBackground'
import Ticker from '../components/Ticker'
import QuickQuote from '../components/printing/QuickQuote'
import PricingTiers from '../components/printing/PricingTiers'
import AssetLinks from '../components/AssetLinks'
import { getConfig, listPublicAssets } from '../api/public'
import { DEFAULT_CONFIG } from '../api/seed'
import { useQuery } from '../hooks/useQuery'
import { CAPABILITIES, LAYER_HEIGHTS, MATERIAL_LIST, PRINT_TICKER, PROCESS } from '../data/printing'
import { whatsappLink } from '../lib/whatsapp'
import { btnClass } from '../components/ui/styles'

export default function PrintingPage() {
  const { data: cfg = DEFAULT_CONFIG } = useQuery(getConfig)
  const { data: assets = [] } = useQuery(listPublicAssets)
  const resources = assets.filter((a) => a.category === 'printing')
  const bv = cfg.buildVolume

  const tech = [
    { k: 'process', v: 'FDM / FFF' },
    { k: 'printer', v: 'Creality Ender' },
    { k: 'build volume', v: `${bv.x} × ${bv.y} × ${bv.z} mm` },
    { k: 'layer heights', v: `${LAYER_HEIGHTS[0].value}–${LAYER_HEIGHTS[LAYER_HEIGHTS.length - 1].value} mm` },
    { k: 'infill', v: '0–100%' },
    { k: 'materials', v: MATERIAL_LIST.map((m) => m.name).join(' · ') },
    { k: 'file formats', v: 'STL · OBJ · 3MF' },
  ]

  return (
    <div className="relative min-h-screen grain overflow-hidden">
      <TerminalBackground />
      <Header />
      <main>
        {/* intro */}
        <section className="px-5 pt-16 pb-20 border-b border-line">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="kicker">
                  <span className="dev-only">[ services / 3d printing ]</span>
                  <span className="simple-only">3D printing</span>
                </span>
                <span className="h-px flex-1 bg-line dev-only" />
              </div>
              <h1 className="display text-[clamp(3rem,9vw,7rem)]">
                <span className="dev-only">
                  <span className="block">idea.</span>
                  <span className="block">model.</span>
                  <span className="block">
                    <span className="flame-text">object</span>
                    <span className="caret align-middle" />
                  </span>
                </span>
                <span className="simple-only">
                  From file to<br />
                  <span className="flame-text">finished part.</span>
                </span>
              </h1>
              <p className="font-mono simple:font-sans text-[15px] simple:text-base text-[var(--fg-dim)] max-w-md mt-8 leading-relaxed">
                Custom manufacturing on demand. Send a model, get an instant estimate, and pick it up printed — from one-off prototypes to runs of hundreds.
              </p>
              <div className="flex flex-wrap gap-3 mt-10">
                <a href="#quote" className={btnClass('primary', 'lg', 'simple:rounded-full')}>
                  <span className="dev-only">./quote</span>
                  <span className="simple-only">Get a quote</span>
                  <ArrowRight size={16} />
                </a>
                <Link to="/login?next=/portal" className={btnClass('ghost', 'lg', 'simple:rounded-full')}>
                  Premium portal
                </Link>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              id="technology"
              className="border border-line bg-ink-2 light:bg-bone/30 font-mono text-[12px] shadow-[8px_8px_0_0_var(--hair)] soft hardshadow overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 h-8 border-b border-line">
                <span className="w-2.5 h-2.5 rounded-full bg-flame" />
                <span className="w-2.5 h-2.5 rounded-full border border-line" />
                <span className="w-2.5 h-2.5 rounded-full border border-line" />
                <span className="ml-2 text-[var(--fg-dim)]">
                  <span className="dev-only">printer --spec</span>
                  <span className="simple-only font-sans">Our setup</span>
                </span>
              </div>
              <div className="p-5 leading-relaxed">
                {tech.map((t) => (
                  <div key={t.k} className="flex justify-between gap-6 py-1.5 border-b border-line/60 last:border-b-0 simple:font-sans simple:text-[13px]">
                    <span className="text-flame/80">{t.k}</span>
                    <span className="text-right">{t.v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <Ticker items={PRINT_TICKER} />

        {/* materials */}
        <section id="materials" className="px-5 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <span className="kicker">
                  <span className="dev-only">// materials</span>
                  <span className="simple-only">Materials</span>
                </span>
                <h2 className="display text-[clamp(2.2rem,6vw,4.5rem)] mt-3">
                  pick your <span className="flame-text">filament</span>.
                </h2>
              </div>
              <p className="font-mono simple:font-sans text-[13px] simple:text-sm text-[var(--fg-dim)] max-w-xs">
                Every material costs the same per gram. Choose for the job, not the price.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line soft overflow-hidden">
              {MATERIAL_LIST.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-[var(--bg)] p-6 flex flex-col"
                >
                  <span className="font-display simple:font-sans font-bold text-4xl">{m.name}</span>
                  <span className="kicker text-[9px] mt-2">{m.full}</span>
                  <p className="font-mono simple:font-sans text-[12px] simple:text-[13px] text-[var(--fg-dim)] mt-4 leading-relaxed flex-1">{m.bestFor}</p>
                  <div className="mt-5 grid grid-cols-1 gap-2">
                    <Meter label="strength" value={m.strength} />
                    <Meter label="flex" value={m.flex} />
                    <Meter label="heat" value={m.heat} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-5">
                    {m.traits.map((t) => (
                      <span key={t} className="kicker text-[9px] border border-line px-1.5 py-0.5 simple:rounded-full simple:px-2">
                        {t}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* solutions */}
        <section id="solutions" className="px-5 py-24 border-t border-line">
          <div className="max-w-7xl mx-auto">
            <span className="kicker">
              <span className="dev-only">// custom manufacturing</span>
              <span className="simple-only">What we make</span>
            </span>
            <h2 className="display text-[clamp(2.2rem,6vw,4.5rem)] mt-3 mb-12">
              built to <span className="flame-text">spec</span>.
            </h2>
            <div className="border-t border-line">
              {CAPABILITIES.map((r) => (
                <div key={r.id} className="group grid grid-cols-[auto_1fr] md:grid-cols-[3rem_minmax(0,16rem)_1fr_auto] items-baseline gap-x-5 gap-y-1 py-5 border-b border-line hover:bg-flame/[0.04] transition-colors">
                  <span className="font-mono text-[12px] text-flame">{r.id}</span>
                  <h3 className="font-display simple:font-sans font-semibold text-lg group-hover:translate-x-1 transition-transform">{r.name}</h3>
                  <p className="font-mono simple:font-sans text-[13px] simple:text-sm text-[var(--fg-dim)] leading-relaxed col-span-2 md:col-span-1">{r.desc}</p>
                  <code className="dev-only font-mono text-[11px] text-flame border border-line px-2 py-0.5 col-start-2 md:col-start-auto w-fit">{r.flag}</code>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line mt-14 soft overflow-hidden">
              {PROCESS.map((p) => (
                <div key={p.step} className="bg-[var(--bg)] p-6">
                  <span className="font-mono text-[12px] text-flame">{p.step}</span>
                  <h3 className="font-display simple:font-sans font-bold text-lg mt-3">{p.title}</h3>
                  <p className="font-mono simple:font-sans text-[12px] simple:text-[13px] text-[var(--fg-dim)] mt-2 leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {resources.length > 0 && (
          <section id="resources" className="px-5 pb-24">
            <div className="max-w-4xl mx-auto">
              <span className="kicker">
                <span className="dev-only">// resources</span>
                <span className="simple-only">Resources</span>
              </span>
              <h2 className="display text-[clamp(1.8rem,4.5vw,3rem)] mt-3 mb-8">
                design <span className="flame-text">guides</span>.
              </h2>
              <AssetLinks assets={resources} />
            </div>
          </section>
        )}

        <Ticker items={PRINT_TICKER} reverse />

        {/* quote */}
        <section id="quote" className="px-5 py-24 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <span className="kicker">
                  <span className="dev-only">// instant quote</span>
                  <span className="simple-only">Instant quote</span>
                </span>
                <h2 className="display text-[clamp(2.2rem,6vw,4.5rem)] mt-3">
                  price it in <span className="flame-text">seconds</span>.
                </h2>
              </div>
              <p className="font-mono simple:font-sans text-[13px] simple:text-sm text-[var(--fg-dim)] max-w-xs">
                Estimates use our live rates. The final price is confirmed once we slice your model.
              </p>
            </div>
            <PricingTiers />
            <div className="mt-6">
              <QuickQuote />
            </div>
          </div>
        </section>

        {/* portal CTA */}
        <section className="px-5 pb-24">
          <div className="max-w-4xl mx-auto border border-line p-8 md:p-14 text-center shadow-[12px_12px_0_0_var(--color-flame-dim)] soft hardshadow">
            <span className="kicker">
              <span className="dev-only">// premium portal</span>
              <span className="simple-only">Premium portal</span>
            </span>
            <h2 className="display text-[clamp(2.2rem,6vw,4.5rem)] mt-4 mb-5">
              print on <span className="flame-text">repeat</span>.
            </h2>
            <p className="font-mono simple:font-sans text-[13px] simple:text-base text-[var(--fg-dim)] max-w-lg mx-auto mb-8">
              Regulars get a premium account: upload models, apply coupons, re-order past jobs and follow every print through the queue.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/login?next=/portal" className={btnClass('primary', 'lg', 'simple:rounded-full')}>
                Sign in <ArrowRight size={16} />
              </Link>
              <a
                href={whatsappLink(cfg.whatsappNumber, "Hi Pyraxis! I'd like a premium 3D printing account.")}
                target="_blank"
                rel="noopener noreferrer"
                className={btnClass('ghost', 'lg', 'simple:rounded-full')}
              >
                <MessageCircle size={16} /> Request an account
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3" role="img" aria-label={`${label} ${value} out of 5`}>
      <span className="kicker text-[9px] w-14">{label}</span>
      <span className="flex gap-1 flex-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`h-1.5 flex-1 simple:rounded-full ${n <= value ? 'bg-flame' : 'bg-line'}`} />
        ))}
      </span>
    </div>
  )
}
