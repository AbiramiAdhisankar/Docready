import { FONT_FAMILIES, FONT_SIZES, type Align, type HeadingCfg, type Settings } from '../types'
import { ALIGN_OPTIONS, Section, SelectField, Segmented, Toggle } from './ui'

const sizeOptions = FONT_SIZES.map((n) => ({ value: n as number, label: `${n} pt` }))

function HeadingRow({ label, cfg, onChange }: { label: string; cfg: HeadingCfg; onChange: (c: HeadingCfg) => void }) {
  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-3 font-display text-lg font-semibold">{label}</p>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <SelectField<string> label="Font" value={cfg.font_family ?? ''} onChange={(v) => onChange({ ...cfg, font_family: v || null })}
          options={[{ value: '', label: 'Same as body' }, ...FONT_FAMILIES.map((f) => ({ value: f as string, label: f }))]} />
        <SelectField label="Size" value={cfg.size} onChange={(v) => onChange({ ...cfg, size: v })} options={sizeOptions} />
        <div className="sm:pb-2"><Toggle label="Bold" checked={cfg.bold} onChange={(v) => onChange({ ...cfg, bold: v })} /></div>
      </div>
    </div>
  )
}

export default function HeadingSettings({ s, set, headingCount }: { s: Settings; set: (p: Partial<Settings>) => void; headingCount?: number }) {
  return (
    <Section title="Headings"
      description={headingCount === 0
        ? 'This document has no Word heading styles, so these settings will not change anything. Paragraphs are never turned into headings.'
        : 'Only paragraphs that already use Word’s Title and Heading styles are changed. Other paragraphs are never turned into headings.'}>
      <div className="rounded-lg border border-line p-4">
        <p className="mb-3 font-display text-lg font-semibold">Document title</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Font" value={s.title.font_family} onChange={(v) => set({ title: { ...s.title, font_family: v } })}
            options={FONT_FAMILIES.map((f) => ({ value: f as string, label: f }))} />
          <SelectField label="Size" value={s.title.size} onChange={(v) => set({ title: { ...s.title, size: v } })} options={sizeOptions} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Segmented<Align> label="Alignment" value={s.title.alignment} onChange={(v) => set({ title: { ...s.title, alignment: v } })} options={[...ALIGN_OPTIONS]} />
          <div className="sm:pb-1"><Toggle label="Bold" checked={s.title.bold} onChange={(v) => set({ title: { ...s.title, bold: v } })} /></div>
        </div>
      </div>
      <HeadingRow label="Heading 1" cfg={s.heading1} onChange={(c) => set({ heading1: c })} />
      <HeadingRow label="Heading 2" cfg={s.heading2} onChange={(c) => set({ heading2: c })} />
      <HeadingRow label="Heading 3" cfg={s.heading3} onChange={(c) => set({ heading3: c })} />
    </Section>
  )
}
