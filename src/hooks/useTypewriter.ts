import { useEffect, useState } from 'react'

/** Types each line in sequence. Returns rendered lines + whether finished. */
export function useTypewriter(lines: string[], speed = 38, lineDelay = 380) {
  const [rendered, setRendered] = useState<string[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    const out: string[] = []
    let li = 0
    let ci = 0

    function step() {
      if (cancelled) return
      if (li >= lines.length) {
        setDone(true)
        return
      }
      const line = lines[li]
      out[li] = line.slice(0, ci)
      setRendered([...out])
      ci++
      if (ci > line.length) {
        li++
        ci = 0
        setTimeout(step, lineDelay)
      } else {
        setTimeout(step, speed)
      }
    }
    step()
    return () => {
      cancelled = true
    }
  }, [lines, speed, lineDelay])

  return { rendered, done }
}
