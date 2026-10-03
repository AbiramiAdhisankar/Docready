import { marginsOf } from '../templates'
import type { MarginPreset, Settings } from '../types'
import { NumberField, Section, SelectField, Segmented } from './ui'

export default function PageSettings({ s, set }: { s: Settings; set: (p: Partial<Settings>) => void }) {
  const m = marginsOf(s)
  const setMargin = (k: keyof typeof m, v: number) => set({ custom_margins: { ...s.custom_margins, [k]: v } })
  return (
    <Section title="Page" description="Applied to every section of the document.">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Page size" value={s.page_size} onChange={(v) => set({ page_size: v })}
          options={[{ value: 'A4', label: 'A4 (210 × 297 mm)' }, { value: 'Letter', label: 'Letter (8.5 × 11 in)' }, { value: 'Legal', label: 'Legal (8.5 × 14 in)' }]} />
        <Segmented label="Orientation" value={s.orientation} onChange={(v) => set({ orientation: v })}
          options={[{ value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' }]} />
      </div>
      <SelectField<MarginPreset> label="Margins" value={s.margin_preset}
        onChange={(v) => set(v === 'custom' ? { margin_preset: v, custom_margins: { ...m } } : { margin_preset: v })}
        hint={`Top ${m.top}", bottom ${m.bottom}", left ${m.left}", right ${m.right}"`}
        options={[{ value: 'normal', label: 'Normal (1" all round)' }, { value: 'narrow', label: 'Narrow (0.5")' },
          { value: 'moderate', label: 'Moderate (1" top/bottom, 0.75" sides)' }, { value: 'wide', label: 'Wide (2" sides)' },
          { value: 'custom', label: 'Custom' }]} />
      {s.margin_preset === 'custom' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(['top', 'bottom', 'left', 'right'] as const).map((k) => (
            <NumberField key={k} label={k[0].toUpperCase() + k.slice(1)} value={s.custom_margins[k]}
              onChange={(v) => setMargin(k, v)} min={0} max={4} step={0.05} suffix="in" />
          ))}
        </div>
      )}
    </Section>
  )
}
