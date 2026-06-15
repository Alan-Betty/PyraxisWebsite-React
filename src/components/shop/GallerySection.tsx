import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const IMAGES = [
  { src: '/images/PyKey Pro.jpeg', alt: 'PyKey Pro view' },
  { src: '/images/PyKey Core.jpeg', alt: 'PyKey Core view' },
  { src: '/images/demokit.jpg', alt: 'Demo Kit preview' },
]

export default function GallerySection() {
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    if (open === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % IMAGES.length))
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + IMAGES.length) % IMAGES.length))
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <section id="gallery" className="px-5 py-24 border-t border-line">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <span className="kicker"><span className="dev-only">// gallery</span><span className="simple-only">Gallery</span></span>
          <h2 className="display text-[clamp(2rem,5.5vw,4rem)] mt-3">see it <span className="flame-text">close</span>.</h2>
        </div>
        <div className="grid sm:grid-cols-3 border border-line">
          {IMAGES.map((img, i) => (
            <button
              key={img.src}
              onClick={() => setOpen(i)}
              className="group relative border-line border-r last:border-r-0 border-b sm:border-b-0 overflow-hidden aspect-square"
            >
              <img src={img.src} alt={img.alt} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute bottom-3 left-3 kicker text-[9px] text-black bg-flame px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                expand ⤢
              </span>
            </button>
          ))}
        </div>
      </div>

      {open !== null && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <button aria-label="Close" onClick={() => setOpen(null)} className="absolute top-5 right-5 w-10 h-10 grid place-items-center border border-line text-bone hover:border-flame hover:text-flame">
            <X size={18} />
          </button>
          <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); setOpen((i) => (i === null ? i : (i - 1 + IMAGES.length) % IMAGES.length)) }} className="absolute left-4 w-11 h-11 grid place-items-center border border-line text-bone hover:border-flame hover:text-flame">
            <ChevronLeft size={20} />
          </button>
          <figure onClick={(e) => e.stopPropagation()} className="max-w-3xl w-full border border-line">
            <img src={IMAGES[open].src} alt={IMAGES[open].alt} className="w-full block" />
            <figcaption className="kicker text-[10px] text-bone px-4 py-3 border-t border-line bg-ink">{IMAGES[open].alt}</figcaption>
          </figure>
          <button aria-label="Next" onClick={(e) => { e.stopPropagation(); setOpen((i) => (i === null ? i : (i + 1) % IMAGES.length)) }} className="absolute right-4 w-11 h-11 grid place-items-center border border-line text-bone hover:border-flame hover:text-flame">
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </section>
  )
}
