export type Align = 'left' | 'center' | 'right' | 'justify'
export type FontStyle = 'normal' | 'bold' | 'italic' | 'underline'
export type MarginPreset = 'normal' | 'narrow' | 'moderate' | 'wide' | 'custom'
export type PagePosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

export const FONT_FAMILIES = ['Times New Roman', 'Arial', 'Calibri', 'Georgia', 'Garamond', 'Verdana'] as const
export const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24] as const

export interface TitleCfg { font_family: string; size: number; bold: boolean; alignment: Align }
export interface HeadingCfg { font_family: string | null; size: number; bold: boolean }
export interface HeaderFooterCfg { enabled: boolean; text: string; alignment: 'left' | 'center' | 'right' }
export interface Margins { top: number; bottom: number; left: number; right: number }

export interface Settings {
  template: string | null
  font_family: string
  font_size: number
  font_style: FontStyle
  alignment: Align
  line_spacing: number
  space_before: number
  space_after: number
  first_line_indent: number
  page_size: 'A4' | 'Letter' | 'Legal'
  orientation: 'portrait' | 'landscape'
  margin_preset: MarginPreset
  custom_margins: Margins
  chapter_labels: { enabled: boolean; alignment: Align }
  keep_centered_lines: boolean
  title: TitleCfg
  heading1: HeadingCfg
  heading2: HeadingCfg
  heading3: HeadingCfg
  normalize_fonts: boolean
  normalize_font_size: boolean
  normalize_alignment: boolean
  normalize_line_spacing: boolean
  normalize_paragraph_spacing: boolean
  remove_blank_paragraphs: boolean
  preserve_images: boolean
  preserve_tables: boolean
  preserve_hyperlinks: boolean
  header: HeaderFooterCfg
  footer: HeaderFooterCfg
  page_numbers: { enabled: boolean; position: PagePosition }
}

export interface Issue { level: 'ok' | 'warn' | 'error'; text: string }
export interface Analysis {
  file_name: string
  file_size: number
  overview: {
    paragraphs: number; headings: number; tables: number; images: number; hyperlinks: number
    blank_paragraphs: number; chapter_labels?: number; words: number; sections: number; has_title: boolean
    pages: { value: number; source: string }
    heading_levels: Record<string, number>
  }
  fonts: { name: string; chars: number; percent: number }[]
  font_sizes: { size: number; chars: number }[]
  alignments: { name: string; count: number }[]
  line_spacing: { label: string; count: number }[]
  page: { size: string; orientation: string; margins: Margins }
  issues: Issue[]
  before: { fonts: number; font_sizes: number; alignments: number; line_spacing: string }
}

export interface FormatResult {
  file_id: string
  original_name: string
  formatted_name: string
  summary: string[]
  before: Analysis['before']
  after: { font: string; size: string; alignment: string; line_spacing: string; page: string; margins: string }
  stats: Record<string, number>
}
