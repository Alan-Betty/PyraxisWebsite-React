import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Terminal, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'

const LANDING_NAV = [
  { label: '~/features', hash: '#features' },
  { label: '~/download', hash: '#download' },
  { label: '~/preview', hash: '#preview' },
]

const SHOP_NAV = [
  { label: '~/products', hash: '#products' },
  { label: '~/specs', hash: '#specs' },
  { label: '~/gallery', hash: '#gallery' },
]

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const { itemCount, openCart } = useCart()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [clock, setClock] = useState('')
  const isShop = location.pathname.startsWith('/shop')

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-GB', { hour12: false }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  function jump(e: React.MouseEvent, hash: string) {
    setOpen(false)
    if (location.pathname !== '/' && !isShop) return
    if ((isShop && location.pathname !== '/shop')) return
    e.preventDefault()
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
  }

  const nav = isShop ? SHOP_NAV : LANDING_NAV

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[var(--bg)]/85 backdrop-blur-md">
      {/* top status strip */}
      <div className="hidden md:flex items-center justify-between px-5 h-7 border-b border-line text-[10px] kicker">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-flame animate-flicker" />
            SYSTEM: ONLINE
          </span>
          <span className="text-line">|</span>
          <span>BUILD 0.9.2-beta</span>
        </span>
        <span className="flex items-center gap-3">
          <span>{clock} LOCAL</span>
          <span className="text-line">|</span>
          <span>LAT 0ms</span>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <span className="grid place-items-center w-8 h-8 border border-line bg-ink-2 light:bg-bone/40 text-flame group-hover:border-flame transition-colors">
            <Terminal size={16} />
          </span>
          <span className="font-mono font-bold tracking-tight text-[15px]">
            pyraxis
            <span className="text-flame">{isShop ? ':shop' : ''}</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-[13px] text-[var(--fg-dim)]">
          {nav.map((n) => (
            <a
              key={n.hash}
              href={n.hash}
              onClick={(e) => jump(e, n.hash)}
              className="hover:text-[var(--fg)] transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-flame hover:after:w-full after:transition-all"
            >
              {n.label}
            </a>
          ))}
          {isShop ? (
            <Link to="/" className="hover:text-[var(--fg)] transition-colors">~/home</Link>
          ) : (
            <Link to="/shop" className="hover:text-[var(--fg)] transition-colors">~/shop</Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isShop && (
            <button
              onClick={openCart}
              aria-label="Open cart"
              className="relative h-9 px-3 grid place-items-center border border-line hover:border-flame text-[12px] transition-colors"
            >
              CART[{itemCount}]
            </button>
          )}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-9 w-9 grid place-items-center border border-line hover:border-flame transition-colors"
          >
            {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          {!isShop && (
            <a
              href="#download"
              onClick={(e) => jump(e, '#download')}
              className="hidden sm:grid place-items-center h-9 px-4 bg-flame text-black font-bold text-[12px] tracking-wide hover:bg-ember transition-colors"
            >
              ./download
            </a>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="md:hidden h-9 w-9 grid place-items-center border border-line"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-line px-5 py-3 flex flex-col gap-1 text-[13px] text-[var(--fg-dim)]">
          {nav.map((n) => (
            <a key={n.hash} href={n.hash} onClick={(e) => jump(e, n.hash)} className="py-2">{n.label}</a>
          ))}
          {isShop ? <Link to="/" onClick={() => setOpen(false)} className="py-2">~/home</Link> : <Link to="/shop" onClick={() => setOpen(false)} className="py-2">~/shop</Link>}
        </nav>
      )}
    </header>
  )
}
