import type { Analysis } from '../types'
import { formatBytes } from '../services/api'
import { Icon } from './ui'

const LEVEL = {
  ok: { cls: 'text-ok', icon: 'check', label: 'Good' },
  warn: { cls: 'text-warn', icon: 'alert', label: 'Warning' },
  error: { cls: 'text-err', icon: 'x', label: 'Error' },
} as const

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="truncate font-display text-2xl font-semibold leading-tight" title={String(value)}>{value}</dd>
    </div>
  )
}

export default function DocumentAnalysis({ a, loading }: { a: Analysis | null; loading: boolean }) {
  if (!a) {
    return (
      <aside className="card p-6" aria-label="Document analysis">
        <h3 className="text-xl font-semibold">Document analysis</h3>
        <div className="mt-4 rounded-lg border border-dashed border-line px-4 py-10 text-center text-sm text-muted" role={loading ? 'status' : undefined}>
          {loading ? 'Reading your document…' : 'Upload a document to see its structure and any formatting issues.'}
        </div>
      </aside>
    )
  }
  const o = a.overview
  return (
    <aside className="card page-enter p-5 sm:p-6" aria-label="Document analysis">
      <h3 className="text-xl font-semibold">Document overview</h3>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
        <div className="col-span-2 min-w-0">
          <dt className="text-xs text-muted">File</dt>
          <dd className="truncate font-medium" title={a.file_name}>{a.file_name} <span className="font-normal text-muted">({formatBytes(a.file_size)})</span></dd>
        </div>
        <Stat label={o.pages.source === 'estimate' ? 'Pages (estimate)' : 'Pages'} value={o.pages.source === 'estimate' ? `~${o.pages.value}` : o.pages.value} />
        <Stat label="Paragraphs" value={o.paragraphs} />
        <Stat label="Headings" value={o.headings} />
        <Stat label="Tables" value={o.tables} />
        <Stat label="Images" value={o.images} />
        <Stat label="Hyperlinks" value={o.hyperlinks} />
      </dl>

      <h4 className="mt-7 font-display text-lg font-semibold">Formatting check</h4>
      <ul className="mt-2 space-y-2">
        {a.issues.map((i, k) => {
          const l = LEVEL[i.level]
          return (
            <li key={k} className={`flex items-start gap-2 text-sm ${l.cls}`}>
              <Icon name={l.icon} className="mt-0.5 h-4 w-4 shrink-0" />
              <span><span className="sr-only">{l.label}: </span><span className="text-ink">{i.text}</span></span>
            </li>
          )
        })}
      </ul>

      <details className="mt-6 border-t border-line pt-4">
        <summary className="cursor-pointer text-sm font-semibold">Fonts, sizes and alignment found</summary>
        <div className="mt-3 space-y-4 text-sm">
          <div>
            <p className="mb-1 font-medium">Fonts</p>
            {a.fonts.length === 0 ? <p className="text-muted">No text found.</p> : a.fonts.map((f) => (
              <div key={f.name} className="mb-1.5">
                <div className="flex justify-between gap-2"><span className="truncate">{f.name}</span><span className="text-muted">{f.percent}%</span></div>
                <div className="h-1.5 rounded bg-paper"><div className="h-1.5 rounded bg-accent" style={{ width: `${Math.max(f.percent, 2)}%` }} /></div>
              </div>
            ))}
          </div>
          <p><span className="font-medium">Body sizes: </span>{a.font_sizes.length ? a.font_sizes.map((s) => `${s.size} pt`).join(', ') : '—'}</p>
          <p><span className="font-medium">Alignments: </span>{a.alignments.length ? a.alignments.map((s) => `${s.name} (${s.count})`).join(', ') : '—'}</p>
          <p><span className="font-medium">Line spacing: </span>{a.line_spacing.length ? a.line_spacing.map((s) => `${s.label} (${s.count})`).join(', ') : '—'}</p>
          <p><span className="font-medium">Blank paragraphs: </span>{o.blank_paragraphs}</p>
          <p><span className="font-medium">Page: </span>{a.page.size}, {a.page.orientation}</p>
        </div>
      </details>
    </aside>
  )
}
