export default function SaleBanner() {
  const msg = 'NEW YEAR DROP — 25% OFF ALL PYKEY MODELS · CODE: PYRAXIS25'
  return (
    <div className="bg-flame text-black overflow-hidden select-none border-b border-flame-dim">
      <div className="flex w-max animate-ticker py-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="font-mono font-bold text-[11px] tracking-[0.12em] whitespace-nowrap px-6">
            ★ {msg}
          </span>
        ))}
      </div>
    </div>
  )
}
