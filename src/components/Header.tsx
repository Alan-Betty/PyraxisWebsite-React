import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Terminal, Menu, X, Code2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useMode } from '../context/ModeContext'
import { useCart } from '../context/CartContext'

const LANDING_NAV = [
  { dev: '~/features', simple: 'Features', hash: '#features' },
  { dev: '~/download', simple: 'Download', hash: '#download' },
  { dev: '~/preview', simple: 'Preview', hash: '#preview' },
]

const SHOP_NAV = [
  { dev: '~/products', simple: 'Products', hash: '#products' },
  { dev: '~/specs', simple: 'Specs', hash: '#specs' },
  { dev: '~/gallery', simple: 'Gallery', hash: '#gallery' },
]

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const { isDev, toggleMode } = useMode()
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
    if (isShop && location.pathname !== '/shop') return
    e.preventDefault()
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
  }

  const nav = isShop ? SHOP_NAV : LANDING_NAV

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[var(--bg)]/85 backdrop-blur-md">
      {/* dev status strip */}
      <div className="dev-only hidden md:flex items-center justify-between px-5 h-7 border-b border-line text-[10px] kicker">
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
          <span className="grid place-items-center w-8 h-8 border border-line bg-ink-2 light:bg-bone/40 text-flame group-hover:border-flame transition-colors simple:rounded-lg">
            <Terminal size={16} className="dev-only" />
            <Sparkles size={16} className="simple-only" />
          </span>
          <span className="font-mono simple:font-sans font-bold tracking-tight text-[15px]">
            pyraxis
            <span className="text-flame">{isShop ? <><span className="dev-only">:shop</span><span className="simple-only"> Shop</span></> : ''}</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-[13px] simple:text-sm text-[var(--fg-dim)]">
          {nav.map((n) => (
            <a
              key={n.hash}
              href={n.hash}
              onClick={(e) => jump(e, n.hash)}
              className="hover:text-[var(--fg)] transition-colors relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-flame hover:after:w-full after:transition-all"
            >
              <span className="dev-only">{n.dev}</span>
              <span className="simple-only">{n.simple}</span>
            </a>
          ))}
          {isShop ? (
            <Link to="/" className="hover:text-[var(--fg)] transition-colors">
              <span className="dev-only">~/home</span><span className="simple-only">Home</span>
            </Link>
          ) : (
            <Link to="/shop" className="hover:text-[var(--fg)] transition-colors">
              <span className="dev-only">~/shop</span><span className="simple-only">Shop</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isShop && (
            <button
              onClick={openCart}
              aria-label="Open cart"
              className="relative h-9 px-3 grid place-items-center border border-line hover:border-flame text-[12px] transition-colors simple:rounded-lg simple:font-sans"
            >
              <span className="dev-only">CART[{itemCount}]</span>
              <span className="simple-only">Cart ({itemCount})</span>
            </button>
          )}

          {/* MODE toggle */}
          <button
            onClick={toggleMode}
            aria-label="Toggle simple / developer view"
            title={isDev ? 'Switch to simple view' : 'Switch to developer view'}
            className="h-9 px-2.5 flex items-center gap-1.5 border border-line hover:border-flame transition-colors simple:rounded-lg text-[11px] kicker"
          >
            {isDev ? <Code2 size={14} /> : <Sparkles size={14} />}
            <span className="hidden sm:inline">{isDev ? 'DEV' : 'SIMPLE'}</span>
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-9 w-9 grid place-items-center border border-line hover:border-flame transition-colors simple:rounded-lg"
          >
            {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {!isShop && (
            <a
              href="#download"
              onClick={(e) => jump(e, '#download')}
              className="hidden sm:grid place-items-center h-9 px-4 bg-flame text-black font-bold text-[12px] tracking-wide hover:bg-ember transition-colors simple:rounded-lg simple:font-sans"
            >
              <span className="dev-only">./download</span>
              <span className="simple-only">Download</span>
            </a>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="md:hidden h-9 w-9 grid place-items-center border border-line simple:rounded-lg"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-line px-5 py-3 flex flex-col gap-1 text-[13px] text-[var(--fg-dim)]">
          {nav.map((n) => (
            <a key={n.hash} href={n.hash} onClick={(e) => jump(e, n.hash)} className="py-2">
              <span className="dev-only">{n.dev}</span><span className="simple-only">{n.simple}</span>
            </a>
          ))}
          {isShop ? (
            <Link to="/" onClick={() => setOpen(false)} className="py-2"><span className="dev-only">~/home</span><span className="simple-only">Home</span></Link>
          ) : (
            <Link to="/shop" onClick={() => setOpen(false)} className="py-2"><span className="dev-only">~/shop</span><span className="simple-only">Shop</span></Link>
          )}
        </nav>
      )}
    </header>
  )
}
