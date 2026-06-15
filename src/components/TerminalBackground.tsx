export default function TerminalBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 grid-bg" />
      {/* slow scanline sweep */}
      <div className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-flame/[0.06] to-transparent animate-scan" />
      {/* corner registration marks */}
      <CornerMark className="top-4 left-4" />
      <CornerMark className="top-4 right-4 rotate-90" />
      <CornerMark className="bottom-4 left-4 -rotate-90" />
      <CornerMark className="bottom-4 right-4 rotate-180" />
    </div>
  )
}

function CornerMark({ className }: { className: string }) {
  return (
    <svg className={`absolute w-5 h-5 text-line ${className}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0 6 V0 H6" />
      <circle cx="3" cy="3" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}
