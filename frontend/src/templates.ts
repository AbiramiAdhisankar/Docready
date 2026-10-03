import type { Settings } from './types'

export const DEFAULT_SETTINGS: Settings = {
  template: null,
  font_family: 'Times New Roman', font_size: 12, font_style: 'normal',
  alignment: 'justify', line_spacing: 1.5, space_before: 0, space_after: 6, first_line_indent: 0,
  page_size: 'A4', orientation: 'portrait', margin_preset: 'normal',
  custom_margins: { top: 1, bottom: 1, left: 1, right: 1 },
  chapter_labels: { enabled: true, alignment: 'center' }, keep_centered_lines: true,
  title: { font_family: 'Times New Roman', size: 20, bold: true, alignment: 'center' },
  heading1: { font_family: null, size: 16, bold: true },
  heading2: { font_family: null, size: 14, bold: true },
  heading3: { font_family: null, size: 12, bold: true },
  normalize_fonts: true, normalize_font_size: true, normalize_alignment: true,
  normalize_line_spacing: true, normalize_paragraph_spacing: true, remove_blank_paragraphs: true,
  preserve_images: true, preserve_tables: true, preserve_hyperlinks: true,
  header: { enabled: false, text: '', alignment: 'center' },
  footer: { enabled: false, text: '', alignment: 'center' },
  page_numbers: { enabled: false, position: 'bottom-center' },
}

export interface Template { id: string; name: string; summary: string; patch: Partial<Settings> }

export const TEMPLATES: Template[] = [
  {
    id: 'assignment', name: 'College Assignment',
    summary: 'A4, Times New Roman 12 pt, justified, 1.5 spacing',
    patch: { page_numbers: { enabled: true, position: 'bottom-center' } },
  },
  {
    id: 'seminar', name: 'Seminar Report',
    summary: '12 pt body, 16 pt Heading 1, 14 pt Heading 2, 1.5 spacing',
    patch: {
      title: { font_family: 'Times New Roman', size: 20, bold: true, alignment: 'center' },
      page_numbers: { enabled: true, position: 'bottom-center' },
    },
  },
  {
    id: 'project', name: 'Project Report',
    summary: 'Binding margin on the left, numbered pages, 24 pt title',
    patch: {
      margin_preset: 'custom', custom_margins: { top: 1, bottom: 1, left: 1.5, right: 1 },
      title: { font_family: 'Times New Roman', size: 24, bold: true, alignment: 'center' },
      page_numbers: { enabled: true, position: 'bottom-center' },
    },
  },
  {
    id: 'research', name: 'Research Paper',
    summary: 'Letter, double spaced, left aligned, indented paragraphs',
    patch: {
      page_size: 'Letter', alignment: 'left', line_spacing: 2, space_after: 0, first_line_indent: 0.5,
      heading1: { font_family: null, size: 14, bold: true }, heading2: { font_family: null, size: 12, bold: true },
      heading3: { font_family: null, size: 12, bold: true },
      title: { font_family: 'Times New Roman', size: 16, bold: true, alignment: 'center' },
      page_numbers: { enabled: true, position: 'top-right' },
    },
  },
  {
    id: 'professional', name: 'Professional Report',
    summary: 'Calibri 11 pt, left aligned, 1.15 spacing, wider headings',
    patch: {
      font_family: 'Calibri', font_size: 11, alignment: 'left', line_spacing: 1.15, space_after: 8,
      margin_preset: 'moderate',
      title: { font_family: 'Calibri', size: 24, bold: true, alignment: 'left' },
      heading1: { font_family: null, size: 18, bold: true }, heading2: { font_family: null, size: 14, bold: true },
      heading3: { font_family: null, size: 12, bold: true },
      page_numbers: { enabled: true, position: 'bottom-right' },
    },
  },
]

/** Template = defaults + patch. Keeps the user's header/footer text and preserve switches. */
export function applyTemplate(current: Settings, t: Template): Settings {
  const keep = {
    header: current.header, footer: current.footer, preserve_images: current.preserve_images,
    preserve_tables: current.preserve_tables, preserve_hyperlinks: current.preserve_hyperlinks,
  }
  return { ...DEFAULT_SETTINGS, ...t.patch, ...keep, template: t.id }
}

export function marginsOf(s: Settings) {
  const presets = { normal: [1, 1, 1, 1], narrow: [.5, .5, .5, .5], moderate: [1, 1, .75, .75], wide: [1, 1, 2, 2] } as const
  if (s.margin_preset === 'custom') return s.custom_margins
  const [top, bottom, left, right] = presets[s.margin_preset]
  return { top, bottom, left, right }
}
