import { createContext, useContext, useEffect, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { AlertTriangle, CheckCircle2, Info, Loader2, X } from 'lucide-react'
import { btnClass, inputClass, surface, type ButtonSize, type ButtonVariant } from './styles'

/* -------------------------------------------------------------- buttons */

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean }) {
  return (
    <button {...rest} disabled={disabled || loading} className={btnClass(variant, size, className)}>
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}

/* --------------------------------------------------------------- fields */

/** Lets the control inside a Field pick up the label's id without wiring it by hand. */
const FieldId = createContext<string | undefined>(undefined)

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  group = false,
  className = '',
}: {
  label: ReactNode
  hint?: ReactNode
  error?: string | null
  children: ReactNode
  htmlFor?: string
  /** several controls under one label: rendered as a labelled group instead */
  group?: boolean
  className?: string
}) {
  const auto = useId()
  const id = htmlFor ?? auto
  return (
    <div className={`flex flex-col gap-1.5 ${className}`} role={group ? 'group' : undefined} aria-labelledby={group ? `${id}-label` : undefined}>
      {group ? (
        <span id={`${id}-label`} className="kicker text-[10px]">
          {label}
        </span>
      ) : (
        <label htmlFor={id} className="kicker text-[10px]">
          {label}
        </label>
      )}
      <FieldId.Provider value={group ? undefined : id}>{children}</FieldId.Provider>
      {error ? (
        <p role="alert" className="font-mono simple:font-sans text-[11px] text-red-400">{error}</p>
      ) : hint ? (
        <p className="font-mono simple:font-sans text-[11px] text-[var(--fg-dim)]">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ className = '', id, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  const fieldId = useContext(FieldId)
  return <input {...rest} id={id ?? fieldId} className={`${inputClass} ${className}`} />
}

export function Select({ className = '', children, id, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  const fieldId = useContext(FieldId)
  return (
    <select {...rest} id={id ?? fieldId} className={`${inputClass} bg-[var(--bg)] cursor-pointer ${className}`}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', id, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fieldId = useContext(FieldId)
  return <textarea {...rest} id={id ?? fieldId} className={`${inputClass} h-auto min-h-[84px] py-2 resize-y ${className}`} />
}

/** Labelled field + input in one, for the common case. */
export function TextField({
  label,
  hint,
  error,
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; hint?: ReactNode; error?: string | null }) {
  const id = useId()
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id} className={className}>
      <Input id={id} aria-invalid={!!error} {...rest} />
    </Field>
  )
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 shrink-0 border transition-colors simple:rounded-full disabled:opacity-50 ${checked ? 'bg-flame border-flame' : 'border-line'}`}
    >
      <span className={`absolute top-0.5 w-3.5 h-3.5 transition-all simple:rounded-full ${checked ? 'left-[22px] bg-black' : 'left-0.5 bg-[var(--fg-dim)]'}`} />
    </button>
  )
}

/* -------------------------------------------------------------- display */

export function Panel({
  title,
  actions,
  children,
  className = '',
  bodyClass = 'p-5',
}: {
  title?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClass?: string
}) {
  return (
    <section className={`border border-line bg-[var(--bg)] soft overflow-hidden ${className}`}>
      {title !== undefined && (
        <header className={`flex items-center justify-between gap-3 px-4 min-h-10 py-2 border-b border-line ${surface}`}>
          <span className="kicker text-[10px]">{title}</span>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  )
}

export type Tone = 'flame' | 'ok' | 'muted' | 'warn' | 'bad'

const TONES: Record<Tone, string> = {
  flame: 'border-flame/60 text-flame',
  ok: 'border-emerald-500/50 text-emerald-400 light:text-emerald-700',
  muted: 'border-line text-[var(--fg-dim)]',
  warn: 'border-amber-400/50 text-amber-300 light:text-amber-700',
  bad: 'border-red-500/50 text-red-400 light:text-red-700',
}

export function Badge({ tone = 'muted', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 h-5 px-1.5 border text-[10px] font-mono simple:font-sans uppercase tracking-wider whitespace-nowrap simple:rounded-full simple:px-2 ${TONES[tone]}`}>
      {children}
    </span>
  )
}

export function Notice({ tone = 'info', children, onDismiss }: { tone?: 'info' | 'ok' | 'error'; children: ReactNode; onDismiss?: () => void }) {
  const Icon = tone === 'error' ? AlertTriangle : tone === 'ok' ? CheckCircle2 : Info
  const color = tone === 'error' ? 'border-red-500/50 text-red-300 light:text-red-700' : tone === 'ok' ? 'border-emerald-500/40 text-emerald-300 light:text-emerald-700' : 'border-line text-[var(--fg-dim)]'
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2.5 border px-3 py-2.5 font-mono simple:font-sans text-[12px] simple:text-[13px] simple:rounded-lg ${color}`}>
      <Icon size={15} className="mt-px shrink-0" />
      <div className="flex-1 min-w-0">{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="shrink-0 opacity-70 hover:opacity-100">
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="border border-line p-4 soft">
      <span className="kicker text-[10px]">{label}</span>
      <div className="font-display simple:font-sans font-bold text-[clamp(1.4rem,3vw,2rem)] leading-tight mt-1.5 tabular-nums">{value}</div>
      {sub && <div className="font-mono simple:font-sans text-[11px] text-[var(--fg-dim)] mt-1">{sub}</div>}
    </div>
  )
}

export function Loading({ label = 'loading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-10 justify-center kicker" role="status">
      <Loader2 size={14} className="animate-spin text-flame" /> {label}…
    </div>
  )
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-dashed border-line p-8 text-center soft">
      <p className="font-display simple:font-sans font-bold text-lg">{title}</p>
      {children && <div className="font-mono simple:font-sans text-[12px] simple:text-sm text-[var(--fg-dim)] mt-2">{children}</div>}
    </div>
  )
}

/* ----------------------------------------------------------------- tabs */

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: T; label: ReactNode; hint?: ReactNode }[]
  value: T
  onChange: (id: T) => void
  label: string
}) {
  return (
    <div role="tablist" aria-label={label} className="flex border border-line overflow-x-auto soft">
      {tabs.map((t) => {
        const active = t.id === value
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`flex-1 min-w-max px-4 py-3 text-left border-r border-line last:border-r-0 transition-colors ${
              active ? 'bg-flame text-black' : 'hover:bg-flame/[0.06] text-[var(--fg-dim)] hover:text-[var(--fg)]'
            }`}
          >
            <span className="block font-display simple:font-sans font-bold text-[14px] leading-none">{t.label}</span>
            {t.hint && <span className={`block kicker text-[9px] mt-1.5 ${active ? 'text-black/60' : ''}`}>{t.hint}</span>}
          </button>
        )
      })}
    </div>
  )
}

/** Compact pill-row variant for secondary navigation inside a tab. */
export function SubTabs<T extends string>({ tabs, value, onChange, label }: { tabs: { id: T; label: ReactNode }[]; value: T; onChange: (id: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-1.5">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={t.id === value}
          onClick={() => onChange(t.id)}
          className={`h-8 px-3 border font-mono simple:font-sans text-[12px] transition-colors simple:rounded-full ${
            t.id === value ? 'border-flame text-flame bg-flame/[0.08]' : 'border-line text-[var(--fg-dim)] hover:text-[var(--fg)]'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- modal */

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[120] bg-black/80 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} my-8 border border-line bg-ink light:bg-[var(--bg)] shadow-[10px_10px_0_0_var(--color-flame-dim)] simple:rounded-2xl simple:overflow-hidden hardshadow`}
      >
        <div className={`flex items-center justify-between px-4 h-10 border-b border-line ${surface}`}>
          <span className="kicker text-[10px]">{title}</span>
          <button onClick={onClose} aria-label="Close" className="text-[var(--fg-dim)] hover:text-flame">
            <X size={15} />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- misc */

export function KV({ k, v }: { k: ReactNode; v: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="text-[var(--fg-dim)]">{k}</span>
      <span className="text-[var(--fg)] text-right tabular-nums">{v}</span>
    </div>
  )
}

export function SectionHead({ kicker, title, children }: { kicker: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
      <div>
        <span className="kicker">{kicker}</span>
        <h2 className="display text-[clamp(1.8rem,4vw,2.8rem)] mt-2">{title}</h2>
      </div>
      {children}
    </div>
  )
}
