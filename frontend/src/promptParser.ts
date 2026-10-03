/**
 * Turns a plain-English request into formatting settings.
 * This is a keyword/pattern parser that runs in the browser (no AI service, no network),
 * so it only understands the phrases below. Anything it understands is listed back to the
 * user, and every setting can still be changed by hand afterwards.
 */
import { applyTemplate, marginsOf, TEMPLATES } from './templates'
import { FONT_SIZES, type Align, type PagePosition, type Settings } from './types'

export interface ParseResult { settings: Settings; understood: string[]; notes: string[] }

const FONTS: [string, string][] = [
  ['times new roman|times|tnr', 'Times New Roman'], ['arial', 'Arial'], ['calibri', 'Calibri'],
  ['georgia', 'Georgia'], ['garamond', 'Garamond'], ['verdana', 'Verdana'],
]
const TEMPLATE_WORDS: [RegExp, string][] = [
  [/college assignment|\bassignment\b/, 'assignment'], [/\bseminar\b/, 'seminar'], [/project report/, 'project'],
  [/research (?:paper|document)/, 'research'], [/professional report|business report/, 'professional'],
]
const SIZES = FONT_SIZES as readonly number[]
const alignOf = (w: string): Align => (/^cent/.test(w) ? 'center' : w.startsWith('right') ? 'right' : 'left')
const escapeRe = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const cap = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

export function parsePrompt(prompt: string, current: Settings): ParseResult {
  const raw = ` ${prompt.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")} `
  let t = raw.toLowerCase()
  let s: Settings = JSON.parse(JSON.stringify(current))
  const ok: string[] = []
  const notes: string[] = []
  const strip = (re: RegExp) => { t = t.replace(re, ' ') }

  // 2. Header / footer text (quoted, or after "header:").
  for (const kind of ['header', 'footer'] as const) {
    const quoted = new RegExp(`${kind}\\s*(?:text\\s*)?(?:(?:as|is|to|saying|reading|with)\\s*)?(?:"([^"]+)"|'([^']+)')`, 'i')
    const colon = new RegExp(`${kind}\\s*(?:text\\s*)?(?::|=|saying|reading)\\s*([^,;.\\n]+)`, 'i')
    const m = raw.match(quoted) ?? raw.match(colon)
    if (m) {
      const text = (m[1] ?? m[2] ?? m[3] ?? '').trim()
      if (text) { s[kind] = { ...s[kind], enabled: true, text: text.slice(0, 200) }; ok.push(`${kind[0].toUpperCase()}${kind.slice(1)}: “${text}”`) }
      strip(quoted); strip(colon)
    }
  }
  strip(/"[^"]*"/g)

  // Template next (after header/footer text is removed), so later instructions can override it.
  for (const [re, id] of TEMPLATE_WORDS) {
    const tpl = TEMPLATES.find((x) => x.id === id)
    if (tpl && re.test(t)) { s = applyTemplate(s, tpl); ok.push(`Template: ${tpl.name}`); break }
  }


  // 3. Chapter / unit label alignment.
  const ch = t.match(/(?:chapter|unit|module)s?[^.,;\n]{0,30}?\b(cent(?:er|re)(?:d|ed)?|left|right)\b/)
  if (ch) {
    const a = alignOf(ch[1])
    s.chapter_labels = { enabled: true, alignment: a }
    ok.push(`Chapter and unit names: ${a}`)
    strip(new RegExp(escapeRe(ch[0])))
  }

  // 4. Heading and title sizes / fonts.
  const sizeFor = (n: number, label: string): number | null => {
    if (SIZES.includes(n)) return n
    notes.push(`${label} size ${n} pt is not available. Choose from ${SIZES.join(', ')}.`)
    return null
  }
  const headRe = /\b(?:heading|h)\s*([123])\s*(?:to be|as|is|at|=|:|-|,)?\s*(?:size\s*)?(\d{2})(?!\d)/g
  for (const m of [...t.matchAll(headRe)]) {
    const key = `heading${m[1]}` as 'heading1' | 'heading2' | 'heading3'
    const size = sizeFor(Number(m[2]), `Heading ${m[1]}`)
    if (size) { s[key] = { ...s[key], size }; ok.push(`Heading ${m[1]}: ${size} pt`) }
  }
  strip(headRe)
  const titleRe = /\btitle\s*(?:to be|as|is|at|=|:|-|,)?\s*(?:size\s*)?(\d{2})(?!\d)/
  const tm = t.match(titleRe)
  if (tm) {
    const size = sizeFor(Number(tm[1]), 'Title')
    if (size) { s.title = { ...s.title, size }; ok.push(`Title: ${size} pt`) }
    strip(titleRe)
  }
  for (const [pattern, name] of FONTS) {
    const re = new RegExp(`headings?\\s+(?:in|font|using|with|use)\\s+(?:the\\s+)?(?:font\\s+)?(?:${pattern})\\b`)
    if (re.test(t)) {
      s.heading1 = { ...s.heading1, font_family: name }; s.heading2 = { ...s.heading2, font_family: name }
      s.heading3 = { ...s.heading3, font_family: name }; s.title = { ...s.title, font_family: name }
      ok.push(`Headings and title font: ${name}`); strip(re)
    }
  }

  // 5. Paragraph spacing before / after.
  for (const re of [/(?:space|spacing)\s*(before|after)\s*(?:of|:|=|to)?\s*(\d{1,2})\s*(?:pt|points?)?/g,
                    /(\d{1,2})\s*(?:pt|points?)\s*(?:of\s*)?(?:space|spacing)?\s*(before|after)/g]) {
    for (const m of [...t.matchAll(re)]) {
      const [kind, num] = isNaN(Number(m[1])) ? [m[1], m[2]] : [m[2], m[1]]
      const v = cap(Number(num), 0, 24)
      if (kind === 'before') s.space_before = v; else s.space_after = v
      ok.push(`Space ${kind} paragraphs: ${v} pt`)
    }
    strip(re)
  }

  // 6. Line spacing.
  let ls: number | null = null
  if (/\bdouble[\s-]*(?:line[\s-]*)?(?:spaced|spacing)\b/.test(t)) ls = 2
  else if (/\bsingle[\s-]*(?:line[\s-]*)?(?:spaced|spacing)\b/.test(t)) ls = 1
  else {
    const m = t.match(/\b(1\.15|1\.5|2(?:\.0)?)\s*(?:line\s*)?(?:spacing|spaced|line)\b/) ??
              t.match(/line\s*spacing\s*(?:of|to|:|=|is)?\s*(1\.15|1\.5|2(?:\.0)?|1)\b/)
    if (m) ls = Number(m[1])
  }
  if (ls !== null) {
    s.line_spacing = ls; ok.push(`Line spacing: ${ls === 1 ? 'single' : ls === 2 ? 'double' : ls}`)
    strip(/\b(?:double|single)[\s-]*(?:line[\s-]*)?(?:spaced|spacing)\b/g)
    strip(/\b(?:1\.15|1\.5|2(?:\.0)?)\s*(?:line\s*)?(?:spacing|spaced|line)\b/g)
    strip(/line\s*spacing\s*(?:of|to|:|=|is)?\s*(?:1\.15|1\.5|2(?:\.0)?|1)\b/g)
  }

  // 7. First-line indent.
  const ind = t.match(/(?:first[\s-]*line\s*)?indent(?:ation)?\s*(?:of|:|=|to)?\s*(0?\.25|0?\.5|none|0)\b/) ??
              t.match(/(0?\.25|0?\.5|half an?)\s*(?:inch|in|")\s*(?:first[\s-]*line\s*)?indent/)
  if (/\bno\s+(?:first[\s-]*line\s*)?indent/.test(t)) { s.first_line_indent = 0; ok.push('First-line indent: none') }
  else if (ind) {
    const v = /25/.test(ind[1]) ? 0.25 : /5|half/.test(ind[1]) ? 0.5 : 0
    s.first_line_indent = v; ok.push(`First-line indent: ${v || 'none'}${v ? ' inch' : ''}`)
  }
  strip(/(?:first[\s-]*line\s*)?indent(?:ation)?\s*(?:of|:|=|to)?\s*(?:0?\.25|0?\.5|none|0)\b/g)
  strip(/(?:0?\.25|0?\.5|half an?)\s*(?:inch|in|")\s*(?:first[\s-]*line\s*)?indent/g)

  // 8. Margins: per side, then preset, then "N inch margins".
  const base = { ...marginsOf(s) }
  let touched = false
  const sideRes = [/\b(top|bottom|left|right)\s*margin\s*(?:of|:|=|to)?\s*(\d(?:\.\d+)?)/g, /(\d(?:\.\d+)?)\s*(?:inch|inches|in|")?\s*(top|bottom|left|right)\s*margin/g]
  for (const re of sideRes) {
    for (const m of [...t.matchAll(re)]) {
      const [side, num] = isNaN(Number(m[1])) ? [m[1], m[2]] : [m[2], m[1]]
      base[side as keyof typeof base] = cap(Number(num), 0, 4); touched = true
      ok.push(`${side[0].toUpperCase()}${side.slice(1)} margin: ${base[side as keyof typeof base]} in`)
    }
    strip(re)
  }
  const pm = t.match(/\b(narrow|moderate|wide|normal|standard)\s*margins?/)
  if (pm && !touched) {
    s.margin_preset = (pm[1] === 'standard' ? 'normal' : pm[1]) as Settings['margin_preset']; ok.push(`Margins: ${s.margin_preset}`)
  }
  if (pm) strip(/\b(?:narrow|moderate|wide|normal|standard)\s*margins?/g)
  const all = t.match(/(\d(?:\.\d+)?)\s*(?:inch|inches|in|")\s*margins?/) ?? t.match(/margins?\s*(?:of|:|=|to|are)?\s*(\d(?:\.\d+)?)\s*(?:inch|inches|in|")?/)
  if (all && !pm) {
    const v = cap(Number(all[1]), 0, 4)
    base.top = base.bottom = base.left = base.right = v; touched = true
    ok.push(`Margins: ${v} inch on all sides`)
  }
  if (touched) {
    const eq = (n: number) => base.top === n && base.bottom === n && base.left === n && base.right === n
    if (eq(1)) s.margin_preset = 'normal'
    else if (eq(0.5)) s.margin_preset = 'narrow'
    else { s.margin_preset = 'custom'; s.custom_margins = base }
  }

  // 9. Page size and orientation.
  const ps = t.match(/\b(a4|legal|(?:us\s*)?letter)\b/)
  if (ps) { s.page_size = ps[1] === 'a4' ? 'A4' : ps[1] === 'legal' ? 'Legal' : 'Letter'; ok.push(`Page size: ${s.page_size}`) }
  if (/\blandscape\b/.test(t)) { s.orientation = 'landscape'; ok.push('Orientation: landscape') }
  else if (/\bportrait\b/.test(t)) { s.orientation = 'portrait'; ok.push('Orientation: portrait') }

  // 10. Page numbers.
  if (/(?:no|without|remove|disable)\s+page[\s-]*numbers?/.test(t)) {
    s.page_numbers = { ...s.page_numbers, enabled: false }; ok.push('Page numbers: off')
  } else if (/page[\s-]*numbers?|numbered pages|number the pages/.test(t)) {
    const pos = t.match(/\b(top|bottom)[\s-]*(left|cent(?:er|re)|right|middle)\b/)
    const side = t.match(/\b(top|bottom)\b/)
    let position: PagePosition = s.page_numbers.enabled ? s.page_numbers.position : 'bottom-center'
    if (pos) position = `${pos[1]}-${/left|right/.test(pos[2]) ? pos[2] : 'center'}` as PagePosition
    else if (side) position = `${side[1]}-center` as PagePosition
    s.page_numbers = { enabled: true, position }
    ok.push(`Page numbers: ${position.replace('-', ' ')}`)
  }

  // 11. Blank paragraphs, body style, alignment.
  if (/(?:remove|delete|strip|clean(?:\s*up)?)\s*(?:the\s*)?(?:extra\s*|unnecessary\s*)?(?:blank|empty)\s*(?:lines?|paragraphs?|spaces?)/.test(t)) {
    s.remove_blank_paragraphs = true; ok.push('Remove extra blank paragraphs')
  } else if (/(?:keep|preserve)\s*(?:the\s*)?(?:blank|empty)/.test(t)) {
    s.remove_blank_paragraphs = false; ok.push('Keep blank paragraphs')
  }
  const fs = t.match(/\b(?:all\s*)?(?:body\s*)?text\s*(?:in|to be|as)?\s*(bold|italic|underlined?)\b/) ?? t.match(/\b(bold|italic|underline)\s*(?:body\s*)?text\b/)
  if (fs) { s.font_style = (fs[1].startsWith('under') ? 'underline' : fs[1]) as Settings['font_style']; ok.push(`Body style: ${s.font_style}`) }

  const al = /\bjustif(?:y|ied)\b/.test(t) ? 'justify'
    : (t.match(/\b(left|right|cent(?:er|re))[\s-]*(?:aligned?|alignment)\b/) ?? t.match(/\balign(?:ed|ment)?\s*(?:to\s*(?:the\s*)?)?(left|right|cent(?:er|re))\b/))
  if (al) {
    s.alignment = al === 'justify' ? 'justify' : alignOf(al[1]); ok.push(`Alignment: ${s.alignment === 'justify' ? 'justified' : s.alignment}`)
  }

  // 12. Body size and font, from what is left.
  const sz = t.match(/(\d{2})\s*(?:pt|point|points|px)\b/) ?? t.match(/\b(?:font\s*)?size\s*(?:of|:|=|to|is)?\s*(\d{2})(?!\d)/) ??
             t.match(/\bfont\s*(?:of\s*)?(\d{2})(?!\d)/) ?? t.match(/\b(\d{2})\s*font\b/) ??
             t.match(/\b(?:times new roman|times|tnr|arial|calibri|georgia|garamond|verdana)\s*,?\s*(\d{2})(?!\d)/)
  if (sz) {
    const size = sizeFor(Number(sz[1]), 'Font')
    if (size) { s.font_size = size; ok.push(`Font size: ${size} pt`) }
  }
  for (const [pattern, name] of FONTS) {
    if (new RegExp(`\\b(?:${pattern})\\b`).test(t)) { s.font_family = name; ok.push(`Font: ${name}`); break }
  }

  return { settings: s, understood: ok, notes }
}

export const PROMPT_EXAMPLES = [
  'College assignment, Times New Roman 12, justified, 1.5 spacing, A4, 1 inch margins, page numbers bottom center',
  'Seminar report with heading 1 16pt, heading 2 14pt, chapter names centered, footer "Dept. of MCA"',
  'Research paper, double spaced, 0.5 inch first line indent, header "Running title", page numbers top right',
]
