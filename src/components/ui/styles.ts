export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'quiet'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-flame text-black font-bold tracking-wide hover:bg-ember',
  ghost: 'border border-line text-[var(--fg-dim)] hover:text-[var(--fg)] hover:border-flame',
  danger: 'border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400',
  quiet: 'text-[var(--fg-dim)] hover:text-flame',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[12px]',
  md: 'h-10 px-4 text-[13px]',
  lg: 'h-12 px-6 text-[14px]',
}

export function btnClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = '') {
  return `inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono simple:font-sans transition-colors disabled:opacity-50 disabled:cursor-not-allowed simple:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame ${VARIANTS[variant]} ${SIZES[size]} ${extra}`
}

export const inputClass =
  'w-full h-10 px-3 bg-transparent border border-line focus:border-flame outline-none transition-colors font-mono simple:font-sans text-[13px] simple:text-sm text-[var(--fg)] placeholder:text-[var(--fg-dim)]/60 simple:rounded-lg disabled:opacity-50 aria-[invalid=true]:border-red-500/70'

export const surface = 'bg-ink-2 light:bg-bone/40'
