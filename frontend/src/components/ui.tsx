import { useId, type ReactNode } from 'react'

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="card p-5 sm:p-6">
      <h3 id={id} className="text-xl font-semibold leading-tight">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}

interface Option<T> { value: T; label: string }

export function SelectField<T extends string | number>({ label, value, onChange, options, hint }: {
  label: string; value: T; onChange: (v: T) => void; options: Option<T>[]; hint?: string
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <select
        id={id} className="input" value={String(value)} aria-describedby={hint ? `${id}-h` : undefined}
        onChange={(e) => {
          const picked = options.find((o) => String(o.value) === e.target.value)
          if (picked) onChange(picked.value)
        }}
      >
        {options.map((o) => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
      </select>
      {hint && <p id={`${id}-h`} className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function Segmented<T extends string | number>({ label, value, onChange, options }: {
  label: string; value: T; onChange: (v: T) => void; options: Option<T>[]
}) {
  const name = useId()
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <label key={String(o.value)} className="cursor-pointer">
            <input type="radio" name={name} className="peer sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
            <span className="block rounded-lg border border-line bg-white px-3 py-1.5 text-sm transition-colors hover:border-accent peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:font-semibold peer-checked:text-accent-dark peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function Toggle({ label, description, checked, onChange, warning }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; warning?: string
}) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-sm font-medium">{label}</label>
        {description && <p className="text-xs text-muted">{description}</p>}
        {warning && !checked && <p className="mt-1 text-xs font-medium text-warn">{warning}</p>}
      </div>
      <span className="relative inline-flex shrink-0">
        {/* The real checkbox covers the whole switch, so clicking anywhere on it toggles it. */}
        <input id={id} type="checkbox" role="switch" aria-checked={checked} checked={checked}
          onChange={(e) => onChange(e.target.checked)} className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
        <span aria-hidden className="h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" />
        <span aria-hidden className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </div>
  )
}

export function NumberField({ label, value, onChange, min, max, step = 1, suffix }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; suffix?: string
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input id={id} type="number" inputMode="decimal" className="input pr-10" value={Number.isFinite(value) ? value : ''}
          min={min} max={max} step={step}
          onChange={(e) => {
            const n = parseFloat(e.target.value)
            onChange(Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min)
          }} />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">{suffix}</span>}
      </div>
    </div>
  )
}

export function TextField({ label, value, onChange, placeholder, disabled, maxLength = 200 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean; maxLength?: number
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <input id={id} type="text" className="input disabled:bg-paper disabled:text-muted" value={value} disabled={disabled}
        placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function Icon({ name, className = 'h-4 w-4' }: { name: 'check' | 'alert' | 'x' | 'file' | 'upload' | 'download'; className?: string }) {
  const paths: Record<string, string> = {
    check: 'M5 12.5l4.5 4.5L19 7.5',
    alert: 'M12 8v5m0 3.5h.01M10.3 3.9L2.6 17.3A2 2 0 004.3 20h15.4a2 2 0 001.7-2.7L13.7 3.9a2 2 0 00-3.4 0z',
    x: 'M6 6l12 12M18 6L6 18',
    file: 'M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5zM14 3v5h5',
    upload: 'M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3',
    download: 'M12 4v12m0 0l-4.5-4.5M12 16l4.5-4.5M4 20h16',
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}

export const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' }, { value: 'justify', label: 'Justified' },
] as const
