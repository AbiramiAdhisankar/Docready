import type { HeaderFooterCfg, PagePosition, Settings } from '../types'
import { Section, SelectField, Segmented, TextField, Toggle } from './ui'

function Block({ title, cfg, onChange }: { title: string; cfg: HeaderFooterCfg; onChange: (c: HeaderFooterCfg) => void }) {
  return (
    <div className="space-y-4 rounded-lg border border-line p-4">
      <Toggle label={`Add ${title.toLowerCase()}`} checked={cfg.enabled} onChange={(v) => onChange({ ...cfg, enabled: v })} />
      {cfg.enabled && (
        <>
          <TextField label={`${title} text`} value={cfg.text} onChange={(v) => onChange({ ...cfg, text: v })} placeholder={`Enter ${title.toLowerCase()} text`} />
          <Segmented label="Alignment" value={cfg.alignment} onChange={(v) => onChange({ ...cfg, alignment: v })}
            options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} />
        </>
      )}
    </div>
  )
}

const POSITIONS: { value: PagePosition; label: string }[] = [
  { value: 'top-left', label: 'Top left' }, { value: 'top-center', label: 'Top center' }, { value: 'top-right', label: 'Top right' },
  { value: 'bottom-left', label: 'Bottom left' }, { value: 'bottom-center', label: 'Bottom center' }, { value: 'bottom-right', label: 'Bottom right' },
]

export default function HeaderFooterSettings({ s, set }: { s: Settings; set: (p: Partial<Settings>) => void }) {
  return (
    <Section title="Header, footer and page numbers"
      description="Page numbers are real Word fields, so they update automatically when pages change.">
      <Block title="Header" cfg={s.header} onChange={(c) => set({ header: c })} />
      <Block title="Footer" cfg={s.footer} onChange={(c) => set({ footer: c })} />
      <div className="space-y-4 rounded-lg border border-line p-4">
        <Toggle label="Add page numbers" checked={s.page_numbers.enabled}
          onChange={(v) => set({ page_numbers: { ...s.page_numbers, enabled: v } })} />
        {s.page_numbers.enabled && (
          <SelectField label="Position" value={s.page_numbers.position}
            onChange={(v) => set({ page_numbers: { ...s.page_numbers, position: v } })} options={POSITIONS} />
        )}
      </div>
    </Section>
  )
}
