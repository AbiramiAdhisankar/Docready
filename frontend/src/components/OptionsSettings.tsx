import type { Settings } from '../types'
import { Section, Toggle } from './ui'

export default function OptionsSettings({ s, set }: { s: Settings; set: (p: Partial<Settings>) => void }) {
  return (
    <Section title="Automatic formatting" description="Switch off anything you want left exactly as it is in your document.">
      <Toggle label="Normalize fonts" description="Use the selected body font everywhere." checked={s.normalize_fonts} onChange={(v) => set({ normalize_fonts: v })} />
      <Toggle label="Normalize font sizes" description="Use the selected body size everywhere." checked={s.normalize_font_size} onChange={(v) => set({ normalize_font_size: v })} />
      <Toggle label="Normalize alignment" description="Apply the selected alignment to body paragraphs." checked={s.normalize_alignment} onChange={(v) => set({ normalize_alignment: v })} />
      <Toggle label="Normalize line spacing" description="Apply the selected line spacing." checked={s.normalize_line_spacing} onChange={(v) => set({ normalize_line_spacing: v })} />
      <Toggle label="Normalize paragraph spacing and indent" description="Apply the before/after spacing and first-line indent." checked={s.normalize_paragraph_spacing} onChange={(v) => set({ normalize_paragraph_spacing: v })} />
      <Toggle label="Remove extra blank paragraphs" description="Deletes empty paragraphs. Page breaks, images and blank lines that keep tables apart are kept." checked={s.remove_blank_paragraphs} onChange={(v) => set({ remove_blank_paragraphs: v })} />
      <hr className="border-line" />
      <Toggle label="Preserve images" checked={s.preserve_images} onChange={(v) => set({ preserve_images: v })} warning="Images will be removed from the formatted copy." />
      <Toggle label="Preserve tables" checked={s.preserve_tables} onChange={(v) => set({ preserve_tables: v })} warning="Tables will be removed from the formatted copy." />
      <Toggle label="Preserve hyperlinks" checked={s.preserve_hyperlinks} onChange={(v) => set({ preserve_hyperlinks: v })} warning="Links will become plain text in the formatted copy." />
    </Section>
  )
}
