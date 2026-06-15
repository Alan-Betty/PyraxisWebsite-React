import { useState } from 'react'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../../context/CartContext'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, clearCart, subtotal } = useCart()
  const [promo, setPromo] = useState('')
  const [done, setDone] = useState(false)

  function checkout() {
    setDone(true)
    setTimeout(() => {
      setDone(false)
      clearCart()
      closeCart()
    }, 1800)
  }

  const count = items.reduce((s, i) => s + i.qty, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCart} className="fixed inset-0 z-[110] bg-black/70" />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            role="dialog"
            aria-modal="true"
            aria-label="Cart"
            className="fixed top-0 right-0 z-[111] h-full w-full sm:w-[420px] bg-ink light:bg-bg-2 border-l border-line flex flex-col"
          >
            <header className="flex items-center justify-between px-5 h-12 border-b border-line bg-ink-2 light:bg-bone/40">
              <span className="font-mono text-[13px]">
                <span className="text-flame">~/cart</span> <span className="text-[var(--fg-dim)]">[{count}]</span>
              </span>
              <button onClick={closeCart} aria-label="Close cart" className="text-[var(--fg-dim)] hover:text-flame"><X size={18} /></button>
            </header>

            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-6">
                  <span className="font-mono text-flame text-2xl">∅</span>
                  <p className="font-mono text-[13px] text-[var(--fg-dim)]">cart is empty.</p>
                  <p className="kicker text-[9px]">add a unit to continue</p>
                </div>
              ) : (
                <ul>
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3 p-4 border-b border-line">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover border border-line" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <span className="font-display font-semibold text-sm truncate">{item.name}</span>
                          <button onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`} className="text-[var(--fg-dim)] hover:text-flame"><Trash2 size={14} /></button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-line">
                            <button onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Decrease" className="w-7 h-7 grid place-items-center hover:text-flame"><Minus size={12} /></button>
                            <span className="w-7 text-center font-mono text-[12px]">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Increase" className="w-7 h-7 grid place-items-center hover:text-flame"><Plus size={12} /></button>
                          </div>
                          <span className="font-mono font-bold text-[14px]">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line p-5 flex flex-col gap-3 font-mono text-[13px]">
                <div className="flex items-center border border-line focus-within:border-flame transition-colors">
                  <span className="px-3 text-flame">$</span>
                  <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="promo code" className="flex-1 bg-transparent py-2 pr-3 text-[12px] focus:outline-none" />
                </div>
                <div className="flex justify-between text-[var(--fg-dim)]"><span>subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-[var(--fg-dim)]"><span>shipping</span><span className="text-flame">free</span></div>
                <div className="flex justify-between font-bold pt-2 border-t border-line"><span>total</span><span>${subtotal.toFixed(2)}</span></div>
                <button onClick={checkout} className="h-11 bg-flame text-black font-bold hover:bg-ember transition-colors mt-1">
                  {done ? '✓ order placed' : './checkout'}
                </button>
                <div className="flex gap-2">
                  <button onClick={closeCart} className="flex-1 h-10 border border-line text-[12px] hover:border-flame transition-colors">continue</button>
                  <button onClick={clearCart} className="flex-1 h-10 border border-line text-[12px] text-flame hover:bg-flame/10 transition-colors">clear</button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
