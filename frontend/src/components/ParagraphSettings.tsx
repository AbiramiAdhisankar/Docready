import type { Align, Settings } from '../types'
import { ALIGN_OPTIONS, NumberField, Section, SelectField, Segmented } from './ui'

export default function ParagraphSettings({ s, set }: { s: Settings; set: (p: Partial<Settings>) => void }) {
  return (
    <Section title="Paragraph">
      <Segmented<Align> label="Alignment" value={s.alignment} onChange={(v) => set({ alignment: v })} options={[...ALIGN_OPTIONS]} />
      <Segmented<number> label="Line spacing" value={s.line_spacing} onChange={(v) => set({ line_spacing: v })}
        options={[{ value: 1, label: 'Single' }, { value: 1.15, label: '1.15' }, { value: 1.5, label: '1.5' }, { value: 2, label: 'Double' }]} />
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField label="Space before" value={s.space_before} onChange={(v) => set({ space_before: v })} min={0} max={24} suffix="pt" />
        <NumberField label="Space after" value={s.space_after} onChange={(v) => set({ space_after: v })} min={0} max={24} suffix="pt" />
        <SelectField<number> label="First-line indent" value={s.first_line_indent} onChange={(v) => set({ first_line_indent: v })}
          options={[{ value: 0, label: 'None' }, { value: 0.25, label: '0.25 inch' }, { value: 0.5, label: '0.5 inch' }]} />
      </div>
    </Section>
  )
}
