import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, IndianRupee, Layers, MessageCircle, Ruler, Spool, UserRound } from 'lucide-react'
import { getConfig } from '../../api/public'
import { DEFAULT_CONFIG } from '../../api/seed'
import { useQuery } from '../../hooks/useQuery'
import { CAPABILITIES, MATERIAL_LIST } from '../../data/printing'
import { whatsappLink } from '../../lib/whatsapp'
import { btnClass } from '../ui/styles'
import PricingTiers from './PricingTiers'
import QuickQuote from './QuickQuote'

/** Landing-page feature block for the 3D printing service. */
export default function PrintSpotlight() {
  const { data: cfg = DEFAULT_CONFIG } = useQuery(getConfig)
  const bv = cfg.buildVolume
  const stats = [
    { icon: Ruler, k: 'build volume', v: `${bv.x}×${bv.y}×${bv.z}`, unit: 'mm' },
    { icon: Layers, k: 'layer height', v: '0.12–0.28', unit: 'mm' },
    { icon: Spool, k: 'materials', v: String(MATERIAL_LIST.length), unit: 'filaments' },
    { icon: IndianRupee, k: 'pricing from', v: '₹5', unit: '/ gram' },
  ]

  return (
    <section id="printing" className="relative px-5 py-24 border-b border-line">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-end mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="kicker">
                <span className="dev-only">[ services / 3d printing ]</span>
                <span className="simple-only">3D printing service</span>
              </span>
              <span className="h-px flex-1 bg-line dev-only" />
              <span className="kicker text-flame dev-only">FDM</span>
            </div>
            <h2 className="display text-[clamp(2.6rem,8vw,6rem)]">
              <span className="dev-only">
                got a model?<br />we <span className="flame-text">print</span> it.
              </span>
              <span className="simple-only">
                Got a model?<br />We <span className="flame-text">print</span> it.
              </span>
            </h2>
          </div>
          <div>
            <p className="font-mono simple:font-sans text-[14px] simple:text-base text-[var(--fg-dim)] leading-relaxed max-w-md">
              Prototypes, functional parts, keychains and small-batch runs — printed on our Creality Ender in PLA, ABS, PETG or TPU. Price it in seconds, then order over WhatsApp or book straight from the premium portal.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <a
                href="#quote"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#quote')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={btnClass('primary', 'lg', 'simple:rounded-full')}
              >
                <span className="dev-only">./instant-quote</span>
                <span className="simple-only">Get an instant quote</span>
                <ArrowRight size={16} />
              </a>
              <Link to="/print" className={btnClass('ghost', 'lg', 'simple:rounded-full')}>
                Materials & tech
              </Link>
              <a
                href={whatsappLink(cfg.whatsappNumber, "Hi Pyraxis! I'd like a 3D print quote. Here's my model:")}
                target="_blank"
                rel="noopener noreferrer"
                className={btnClass('ghost', 'lg', 'simple:rounded-full')}
              >
                <MessageCircle size={16} /> WhatsApp us
              </a>
            </div>
          </div>
        </div>

        {/* spec strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line soft overflow-hidden"
        >
          {stats.map((s) => (
            <div key={s.k} className="bg-[var(--bg)] p-5">
              <s.icon size={16} className="text-flame" />
              <div className="font-display simple:font-sans font-bold text-[clamp(1.4rem,3vw,2rem)] mt-3 leading-none tabular-nums">{s.v}</div>
              <span className="kicker text-[9px] mt-2 block">
                {s.k} · {s.unit}
              </span>
            </div>
          ))}
        </motion.div>

        {/* capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line border-t-0 soft overflow-hidden simple:mt-4 simple:border-t">
          {CAPABILITIES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (i % 2) * 0.06 }}
              className="group p-6 bg-[var(--bg)] hover:bg-[color-mix(in_srgb,var(--color-flame)_4%,var(--bg))] transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[12px] text-flame">{c.id}</span>
                <code className="dev-only font-mono text-[11px] text-flame border border-line px-2 py-0.5">{c.flag}</code>
              </div>
              <h3 className="font-display simple:font-sans font-semibold text-xl mt-3 group-hover:translate-x-1 transition-transform">{c.name}</h3>
              <p className="font-mono simple:font-sans text-[13px] simple:text-sm text-[var(--fg-dim)] mt-2 leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* pricing + instant quote */}
        <div id="quote" className="mt-14 scroll-mt-24">
          <span className="kicker">
            <span className="dev-only">// pricing matrix · instant quote</span>
            <span className="simple-only">Simple, weight-based pricing</span>
          </span>
          <div className="mt-3">
            <PricingTiers />
          </div>
          <p className="font-mono simple:font-sans text-[12px] simple:text-[13px] text-[var(--fg-dim)] mt-3 mb-6">
            The tier is set by the total weight of your order. Shipping is ₹{cfg.shippingFee} flat.
          </p>
          <QuickQuote />
        </div>

        {/* portal entry */}
        <div className="mt-6 border border-line p-6 md:p-8 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-5 items-center shadow-[8px_8px_0_0_var(--color-flame-dim)] soft hardshadow">
          <span className="grid place-items-center w-12 h-12 border border-line text-flame simple:rounded-xl">
            <UserRound size={20} />
          </span>
          <div>
            <h3 className="font-display simple:font-sans font-bold text-xl">Premium customer portal</h3>
            <p className="font-mono simple:font-sans text-[12px] simple:text-[13px] text-[var(--fg-dim)] mt-1 leading-relaxed max-w-2xl">
              Upload STL / OBJ / 3MF, apply coupons, re-order in one tap, keep your shipping details on file and track every job from queue to doorstep.
            </p>
          </div>
          <Link to="/login?next=/portal" className={btnClass('primary', 'md')}>
            Enter the portal <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
