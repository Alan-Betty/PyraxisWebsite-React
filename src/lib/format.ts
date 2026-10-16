const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const inrPrecise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const num = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })

export const formatINR = (n: number) => inr.format(n)
export const formatRate = (n: number) => `${inrPrecise.format(n)}/g`
export const formatNum = (n: number) => num.format(n)
export const formatGrams = (g: number) => (g >= 1000 ? `${num.format(g / 1000)} kg` : `${num.format(g)} g`)

/** Parse a controlled numeric input that may be blank (blank → NaN). */
export const toNum = (s: string) => (s.trim() === '' ? NaN : Number(s))

export function formatBytes(b: number) {
  if (!b) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let v = b
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

export function formatDate(iso: string | null | undefined, withTime = false) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}
