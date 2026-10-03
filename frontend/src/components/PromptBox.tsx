import { useId, useState } from 'react'
import { parsePrompt, PROMPT_EXAMPLES, type ParseResult } from '../promptParser'
import type { Settings } from '../types'
import { Icon } from './ui'

export default function PromptBox({ current, onApply }: { current: Settings; onApply: (s: Settings) => void }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState<ParseResult | null>(null)
  const id = useId()

  const apply = () => {
    if (!text.trim()) return
    const r = parsePrompt(text, current)
    setResult(r)
    if (r.understood.length) onApply(r.settings)
  }

  return (
    <section className="card p-5 sm:p-6" aria-labelledby={`${id}-t`}>
      <h3 id={`${id}-t`} className="text-xl font-semibold">Describe the formatting you want</h3>
      <p className="mt-1 text-sm text-muted">Type your requirements in plain English and the settings below are filled in for you. You can still change any of them.</p>
      <label htmlFor={id} className="sr-only">Formatting instructions</label>
      <textarea id={id} rows={3} className="input mt-4 resize-y" value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Example: Times New Roman 12, justified, 1.5 spacing, A4, 1 inch margins, page numbers bottom center, footer “Dept. of MCA”"
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) apply() }} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className="btn-primary" onClick={apply} disabled={!text.trim()}>Apply to settings</button>
        <span className="text-xs text-muted">or press Ctrl+Enter</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Example instructions">
        {PROMPT_EXAMPLES.map((ex) => (
          <button key={ex} type="button" onClick={() => setText(ex)}
            className="max-w-full truncate rounded-full border border-line px-3 py-1 text-xs text-muted transition-colors hover:border-accent hover:text-accent" title={ex}>
            {ex.length > 52 ? `${ex.slice(0, 52)}…` : ex}
          </button>
        ))}
      </div>

      {result && (
        <div className="page-enter mt-5 border-t border-line pt-4" role="status" aria-live="polite">
          {result.understood.length > 0 ? (
            <>
              <p className="text-sm font-semibold">Applied {result.understood.length} setting{result.understood.length === 1 ? '' : 's'}</p>
              <ul className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {result.understood.map((u, i) => <li key={i} className="flex items-start gap-2 text-sm"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ok" />{u}</li>)}
              </ul>
            </>
          ) : (
            <p className="rounded-lg bg-warn-bg px-4 py-3 text-sm text-warn">
              I couldn’t find any formatting instructions in that. Try naming a font, size, spacing, alignment, margins, page size, header, footer or page numbers.
            </p>
          )}
          {result.notes.map((n, i) => <p key={i} className="mt-2 text-sm text-warn">{n}</p>)}
          <p className="mt-3 text-xs text-muted">This reads keywords, it is not an AI model, so it may miss unusual wording. Check the settings below before formatting.</p>
        </div>
      )}
    </section>
  )
}
