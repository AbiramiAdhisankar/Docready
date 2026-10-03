import type { Align, Settings } from '../types'
import { ALIGN_OPTIONS, Section, Segmented, Toggle } from './ui'

export default function ChapterSettings({ s, set, found }: { s: Settings; set: (p: Partial<Settings>) => void; found?: number }) {
  const cl = s.chapter_labels
  return (
    <Section title="Chapter and unit names"
      description="Lines like 1, 2, I, II, UNIT I or CHAPTER 2: Basics are not body text, so they are not justified.">
      <Toggle label="Detect chapter / unit labels" checked={cl.enabled}
        description={found ? `${found} found in this document.` : 'Matches 1, II, UNIT III, Chapter 4, Module 2: Title and similar lines.'}
        onChange={(v) => set({ chapter_labels: { ...cl, enabled: v } })} />
      {cl.enabled && (
        <Segmented<Align> label="Align them" value={cl.alignment}
          onChange={(v) => set({ chapter_labels: { ...cl, alignment: v } })} options={[...ALIGN_OPTIONS].filter((o) => o.value !== 'justify')} />
      )}
      <Toggle label="Keep short centered lines centered" description="A short line without a full stop that was centered in your document (a chapter title, for example) stays centered."
        checked={s.keep_centered_lines} onChange={(v) => set({ keep_centered_lines: v })} />
    </Section>
  )
}
