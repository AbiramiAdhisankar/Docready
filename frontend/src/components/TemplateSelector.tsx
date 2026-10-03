import { TEMPLATES } from '../templates'

export default function TemplateSelector({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  return (
    <fieldset className="card p-5 sm:p-6">
      <legend className="sr-only">Quick templates</legend>
      <h3 className="text-xl font-semibold">Quick templates</h3>
      <p className="mt-1 text-sm text-muted">Start from a preset, then adjust any setting below.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <label key={t.id} className="cursor-pointer">
            <input type="radio" name="template" className="peer sr-only" checked={selected === t.id} onChange={() => onSelect(t.id)} />
            <span className="block h-full rounded-lg border border-line px-4 py-3 transition-colors hover:border-accent peer-checked:border-accent peer-checked:bg-accent-soft peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
              <span className="block text-sm font-semibold">{t.name}</span>
              <span className="mt-0.5 block text-xs text-muted">{t.summary}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
