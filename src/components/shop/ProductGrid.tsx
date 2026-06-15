import { motion } from 'framer-motion'
import { Plus, Bell } from 'lucide-react'
import { PRODUCTS } from '../../data/products'
import { useCart } from '../../context/CartContext'

export default function ProductGrid() {
  const { addItem } = useCart()

  return (
    <section id="products" className="px-5 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <span className="kicker">// models &amp; kits</span>
            <h2 className="display text-[clamp(2.2rem,6vw,4.5rem)] mt-3">pick your <span className="flame-text">unit</span>.</h2>
          </div>
          <p className="font-mono text-[13px] text-[var(--fg-dim)] max-w-xs">All prices reflect the 25% launch discount.</p>
        </div>

        <div className="grid md:grid-cols-3 border border-line">
          {PRODUCTS.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group flex flex-col border-line border-r last:border-r-0 md:border-b-0 border-b"
            >
              <div className="relative overflow-hidden border-b border-line">
                <img src={p.image} alt={p.name} className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105" />
                {p.badge && (
                  <span className="absolute top-3 left-3 font-mono text-[10px] tracking-wide px-2 py-1 bg-flame text-black font-bold">
                    {p.badge.label.toUpperCase()}
                  </span>
                )}
                <span className="absolute top-3 right-3 kicker text-[9px] text-[var(--fg-dim)]">[{String(i + 1).padStart(2, '0')}]</span>
              </div>

              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display font-bold text-xl">{p.name}</h3>
                  {p.rating && <span className="font-mono text-[11px] text-flame">{'★'.repeat(p.rating)}</span>}
                </div>
                <p className="font-mono text-[12px] text-[var(--fg-dim)] leading-relaxed flex-1">{p.description}</p>

                <div className="flex items-end justify-between pt-3 border-t border-line">
                  <div className="font-mono">
                    {p.oldPrice && (
                      <span className="text-[11px] text-[var(--fg-dim)] line-through mr-2">${p.oldPrice}</span>
                    )}
                    <span className="font-display font-bold text-2xl">${p.price}</span>
                    {p.discount && <span className="text-[11px] text-flame ml-2">{p.discount}</span>}
                  </div>
                  {p.comingSoon ? (
                    <button disabled className="inline-flex items-center gap-1.5 h-9 px-3 border border-line text-[12px] text-[var(--fg-dim)] cursor-not-allowed">
                      <Bell size={13} /> notify
                    </button>
                  ) : (
                    <button
                      onClick={() => addItem({ id: p.id, name: p.name, price: p.price, image: p.image })}
                      className="inline-flex items-center gap-1.5 h-9 px-4 bg-flame text-black font-bold text-[12px] hover:bg-ember transition-colors"
                    >
                      <Plus size={14} /> add
                    </button>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
