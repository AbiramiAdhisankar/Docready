const STAGES = ['Reading document', 'Checking formatting', 'Applying styles', 'Adjusting paragraphs', 'Applying page settings', 'Finalizing document']

export default function ProcessingState() {
  return (
    <div className="card page-enter mx-auto max-w-xl p-8 text-center" role="status" aria-live="polite">
      <span className="spinner mx-auto block h-12 w-12 rounded-full border-4 border-accent-soft border-t-accent" aria-hidden />
      <h2 className="mt-6 text-3xl font-semibold">Formatting your document...</h2>
      <p className="mt-2 text-sm text-muted">This usually takes a few seconds. Your original file is not changed.</p>
      <ol className="mx-auto mt-6 inline-block space-y-1.5 text-left text-sm text-muted">
        {STAGES.map((s) => <li key={s} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />{s}</li>)}
      </ol>
    </div>
  )
}
