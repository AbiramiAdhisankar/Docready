import { useId, useRef, useState, type DragEvent } from 'react'
import { formatBytes } from '../services/api'
import { Icon } from './ui'

interface Props {
  file: File | null
  status: 'idle' | 'analyzing' | 'ready' | 'formatting' | 'done'
  error: string | null
  onFile: (f: File) => void
  onRemove: () => void
}

export default function FileUploader({ file, status, error, onFile, onRemove }: Props) {
  const [over, setOver] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const errId = useId()

  const drop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f)
  }

  if (file) {
    const label = status === 'analyzing' ? 'Analyzing…' : status === 'formatting' ? 'Formatting…' : 'Uploaded'
    return (
      <div className="card page-enter flex flex-wrap items-center gap-4 p-4 sm:p-5" aria-label="Uploaded document">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Icon name="file" className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold" title={file.name}>{file.name}</p>
          <p className="text-sm text-muted">{formatBytes(file.size)} · Word document (.docx)</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status === 'analyzing' || status === 'formatting' ? 'bg-warn-bg text-warn' : 'bg-ok-bg text-ok'}`} role="status">
          {(status === 'analyzing' || status === 'formatting')
            ? <span className="spinner h-3 w-3 rounded-full border-2 border-warn border-t-transparent" aria-hidden />
            : <Icon name="check" className="h-3.5 w-3.5" />}
          {label}
        </span>
        <button type="button" className="btn-secondary !px-3 !py-1.5" onClick={onRemove} disabled={status === 'formatting'} aria-label={`Remove ${file.name}`}>
          <Icon name="x" /> Remove
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={drop}
        className={`rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${over ? 'border-accent bg-accent-soft' : 'border-line bg-white'}`}
      >
        <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent transition-transform ${over ? 'scale-110' : ''}`}><Icon name="upload" className="h-6 w-6" /></span>
        <p className="mt-4 font-display text-2xl font-semibold">Drop your Word document here</p>
        <p className="mt-1 text-sm text-muted">.docx files only, up to 20 MB</p>
        <button type="button" className="btn-primary mt-5" onClick={() => input.current?.click()}>Choose a file</button>
        <input ref={input} type="file" className="sr-only" tabIndex={-1} accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          aria-label="Upload a .docx file" aria-describedby={error ? errId : undefined}
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onFile(f) }} />
      </div>
      {error && <p id={errId} role="alert" className="mt-3 rounded-lg bg-err-bg px-4 py-3 text-sm font-medium text-err">{error}</p>}
    </div>
  )
}
