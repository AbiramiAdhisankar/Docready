import { useCallback, useEffect, useRef, useState } from 'react'
import ChapterSettings from '../components/ChapterSettings'
import DocumentAnalysis from '../components/DocumentAnalysis'
import FileUploader from '../components/FileUploader'
import FontSettings from '../components/FontSettings'
import HeaderFooterSettings from '../components/HeaderFooterSettings'
import HeadingSettings from '../components/HeadingSettings'
import OptionsSettings from '../components/OptionsSettings'
import PageSettings from '../components/PageSettings'
import ParagraphSettings from '../components/ParagraphSettings'
import PromptBox from '../components/PromptBox'
import ProcessingState from '../components/ProcessingState'
import ResultPanel from '../components/ResultPanel'
import TemplateSelector from '../components/TemplateSelector'
import { analyze, discardFile, formatDocument, validateFile } from '../services/api'
import { applyTemplate, DEFAULT_SETTINGS, TEMPLATES } from '../templates'
import type { Analysis, FormatResult, Settings } from '../types'

type Status = 'idle' | 'analyzing' | 'ready' | 'formatting' | 'done'
const spacingName = (n: number) => (n === 1 ? 'single' : n === 2 ? 'double' : `${n}`)

export default function Formatter() {
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FormatResult | null>(null)
  const resultId = useRef<string | null>(null)
  const token = useRef(0) // ignores responses from a file the user already removed

  useEffect(() => { document.title = 'Formatter · DocReady' }, [])
  useEffect(() => () => { if (resultId.current) discardFile(resultId.current) }, [])

  const set = useCallback((p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p })), [])

  const reset = () => {
    token.current++
    if (resultId.current) discardFile(resultId.current)
    resultId.current = null
    setFile(null); setAnalysis(null); setResult(null); setError(null); setStatus('idle')
  }

  const onFile = async (f: File) => {
    const problem = validateFile(f)
    if (problem) { setError(problem); return }
    const mine = ++token.current
    setError(null); setFile(f); setAnalysis(null); setStatus('analyzing')
    try {
      const a = await analyze(f)
      if (token.current !== mine) return
      setAnalysis(a); setStatus('ready')
    } catch (e) {
      if (token.current !== mine) return
      setFile(null); setStatus('idle')
      setError(e instanceof Error ? e.message : 'Please upload a valid DOCX file.')
    }
  }

  const run = async () => {
    if (!file) return
    const mine = ++token.current
    setError(null); setStatus('formatting')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    try {
      const r = await formatDocument(file, settings)
      if (token.current !== mine) { discardFile(r.file_id); return }
      resultId.current = r.file_id
      setResult(r); setStatus('done')
    } catch (e) {
      if (token.current !== mine) return
      setStatus('ready')
      setError(e instanceof Error ? e.message : 'Something went wrong while formatting your document. Please try again.')
    }
  }

  const template = TEMPLATES.find((t) => t.id === settings.template)
  const busy = status === 'analyzing' || status === 'formatting'

  return (
    <div className="page-enter mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-semibold sm:text-5xl">Formatter</h1>
          <p className="mt-1 text-muted">Upload a Word document, choose how it should look, and download a clean copy.</p>
        </div>
        {file && status !== 'formatting' && <button type="button" className="btn-secondary" onClick={reset}>Start Over</button>}
      </div>

      {status === 'formatting' && <ProcessingState />}

      {status === 'done' && result && <ResultPanel r={result} onAnother={reset} />}

      {status !== 'formatting' && status !== 'done' && (
        <>
          <FileUploader file={file} status={status} error={error && !file ? error : null} onFile={onFile} onRemove={reset} />
          {error && file && <p role="alert" className="mt-4 rounded-lg bg-err-bg px-4 py-3 text-sm font-medium text-err">{error}</p>}

          {!file ? (
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <p className="text-sm text-muted lg:self-center">Formatting settings appear here once your document has been analyzed. Everything you choose is applied to a new copy of the file.</p>
              <DocumentAnalysis a={null} loading={false} />
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="order-2 space-y-6 lg:order-1">
                <PromptBox current={settings} onApply={setSettings} />
                <TemplateSelector selected={settings.template} onSelect={(id) => {
                  const t = TEMPLATES.find((x) => x.id === id)
                  if (t) setSettings((s) => applyTemplate(s, t))
                }} />
                <FontSettings s={settings} set={set} />
                <ParagraphSettings s={settings} set={set} />
                <ChapterSettings s={settings} set={set} found={analysis?.overview.chapter_labels} />
                <PageSettings s={settings} set={set} />
                <HeadingSettings s={settings} set={set} headingCount={analysis?.overview.headings} />
                <HeaderFooterSettings s={settings} set={set} />
                <OptionsSettings s={settings} set={set} />
              </div>
              <div className="order-1 lg:order-2">
                <div className="lg:sticky lg:top-6"><DocumentAnalysis a={analysis} loading={status === 'analyzing'} /></div>
              </div>
            </div>
          )}
        </>
      )}

      {file && !busy && status !== 'done' && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="min-w-0 text-sm text-muted">
              <span className="font-medium text-ink">{template ? template.name : 'Custom'}</span>
              {' · '}{settings.font_family}, {settings.font_size} pt, {settings.alignment === 'justify' ? 'justified' : settings.alignment}, {spacingName(settings.line_spacing)} spacing, {settings.page_size}
            </p>
            <button type="button" className="btn-primary !px-8 !py-3 text-base max-sm:w-full" onClick={run}>Format Document</button>
          </div>
        </div>
      )}
    </div>
  )
}
