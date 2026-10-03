import { FONT_FAMILIES, FONT_SIZES, type FontStyle, type Settings } from '../types'
import { SelectField, Section, Segmented } from './ui'

const STACKS: Record<string, string> = {
  'Times New Roman': '"Times New Roman", Times, serif', Arial: 'Arial, Helvetica, sans-serif',
  Calibri: 'Calibri, Carlito, "Segoe UI", sans-serif', Georgia: 'Georgia, serif',
  Garamond: 'Garamond, "EB Garamond", Georgia, serif', Verdana: 'Verdana, Geneva, sans-serif',
}

export default function FontSettings({ s, set }: { s: Settings; set: (p: Partial<Settings>) => void }) {
  const style = s.font_style
  return (
    <Section title="Font" description="Applied to body text, including text inside links and tables.">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Font family" value={s.font_family} onChange={(v) => set({ font_family: v })}
          options={FONT_FAMILIES.map((f) => ({ value: f as string, label: f }))} />
        <SelectField label="Font size" value={s.font_size} onChange={(v) => set({ font_size: v })}
          options={FONT_SIZES.map((n) => ({ value: n as number, label: `${n} pt` }))} />
      </div>
      <Segmented<FontStyle> label="Font style (applies to body text)" value={style} onChange={(v) => set({ font_style: v })}
        options={[{ value: 'normal', label: 'Normal' }, { value: 'bold', label: 'Bold' },
          { value: 'italic', label: 'Italic' }, { value: 'underline', label: 'Underline' }]} />
      {style === 'normal' && <p className="-mt-3 text-xs text-muted">Normal keeps any bold or italic emphasis already in your document.</p>}
      <div className="rounded-lg bg-paper px-4 py-3" aria-label="Font preview">
        <p className="mb-1 text-xs text-muted">Preview</p>
        <p style={{
          fontFamily: STACKS[s.font_family], fontSize: `${Math.min(s.font_size, 18)}px`,
          fontWeight: style === 'bold' ? 700 : 400, fontStyle: style === 'italic' ? 'italic' : 'normal',
          textDecoration: style === 'underline' ? 'underline' : 'none',
        }}>The quick brown fox jumps over the lazy dog.</p>
      </div>
    </Section>
  )
}
