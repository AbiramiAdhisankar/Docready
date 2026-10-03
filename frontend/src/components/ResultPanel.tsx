import { useState } from 'react'
import { downloadFile, saveBlob } from '../services/api'
import type { FormatResult } from '../types'
import { Icon } from './ui'

export default function ResultPanel({ r, onAnother }: { r: FormatResult; onAnother: () => void }) {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const download = async () => {
    setError(null)
    try {
      let b = blob
      if (!b) {
        setBusy(true)
        b = await downloadFile(r.file_id, r.formatted_name)
        setBlob(b) // the server deletes its copy after the first download; keep ours for re-saves
      }
      saveBlob(b, r.formatted_name)
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong while formatting your document. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-6">
      <div className="card p-6 text-center sm:p-8">
        <span className="pop-in mx-auto grid h-14 w-14 place-items-center rounded-full bg-ok-bg text-ok"><Icon name="check" className="h-7 w-7" /></span>
        <h2 className="mt-4 text-4xl font-semibold">Your document is ready! 🎉</h2>
        <dl className="mx-auto mt-5 grid max-w-md gap-3 text-left sm:grid-cols-2">
          <div className="min-w-0 rounded-lg bg-paper px-4 py-3"><dt className="text-xs text-muted">Original</dt><dd className="truncate font-medium" title={r.original_name}>{r.original_name}</dd></div>
          <div className="min-w-0 rounded-lg bg-accent-soft px-4 py-3"><dt className="text-xs text-muted">Formatted</dt><dd className="truncate font-medium" title={r.formatted_name}>{r.formatted_name}</dd></div>
        </dl>
        {error && <p role="alert" className="mx-auto mt-4 max-w-md rounded-lg bg-err-bg px-4 py-3 text-sm font-medium text-err">{error}</p>}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" className="btn-primary !px-6 !py-3 text-base" onClick={download} disabled={busy}>
            <Icon name="download" className="h-5 w-5" /> {busy ? 'Preparing…' : 'Download Formatted DOCX'}
          </button>
          <button type="button" className="btn-secondary !py-3" onClick={onAnother}>Format Another Document</button>
        </div>
        {done && <p className="mt-3 text-sm text-ok" role="status">Downloaded. Your temporary copy has been deleted from our server.</p>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card p-5 sm:p-6" aria-labelledby="applied">
          <h3 id="applied" className="text-xl font-semibold">Formatting applied</h3>
          <ul className="mt-3 space-y-2">
            {r.summary.map((s) => <li key={s} className="flex items-start gap-2 text-sm"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ok" />{s}</li>)}
          </ul>
        </section>
        <section className="card p-5 sm:p-6" aria-labelledby="ba">
          <h3 id="ba" className="text-xl font-semibold">Before and after</h3>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-1 font-semibold text-muted">Before</p>
              <ul className="space-y-1">
                <li>Fonts: {r.before.fonts}</li><li>Font sizes: {r.before.font_sizes}</li>
                <li>Alignments: {r.before.alignments}</li><li>Line spacing: {r.before.line_spacing}</li>
              </ul>
            </div>
            <div>
              <p className="mb-1 font-semibold text-accent-dark">After</p>
              <ul className="space-y-1">
                <li>Font: {r.after.font}</li><li>Size: {r.after.size}</li>
                <li>Alignment: {r.after.alignment}</li><li>Line spacing: {r.after.line_spacing}</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">The downloaded DOCX is the source of truth. Open it in Word or LibreOffice to review the result.</p>
        </section>
      </div>
    </div>
  )
}
