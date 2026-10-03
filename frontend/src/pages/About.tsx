import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  useEffect(() => { document.title = 'About · DocReady' }, [])
  return (
    <article className="page-enter mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-5xl font-semibold">About DocReady</h1>
      <p className="mt-5 text-lg text-muted">DocReady fixes the formatting of Word documents so you can spend your time on the content. Assignments, seminar reports and project reports usually have the same requirements: one font, one size, even spacing, set margins and numbered pages. DocReady applies them for you.</p>
      <h2 className="mt-10 text-3xl font-semibold">What it changes</h2>
      <p className="mt-2 text-muted">Fonts, sizes, alignment, line and paragraph spacing, first-line indents, page size, orientation, margins, Title and Heading styles, headers, footers and page numbers. You get a new .docx; your original is never touched.</p>
      <h2 className="mt-10 text-3xl font-semibold">What it deliberately leaves alone</h2>
      <p className="mt-2 text-muted">Your text, images, tables and hyperlinks. Paragraphs are never turned into headings, and table layout is kept as you built it.</p>
      <h2 className="mt-10 text-3xl font-semibold">Known limits</h2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted">
        <li>Only .docx files are supported. Convert .doc or PDF files to .docx in Word first.</li>
        <li>Text inside text boxes, shapes, footnotes and comments is not reformatted.</li>
        <li>Page counts before formatting are estimates unless Word saved them in the file.</li>
        <li>Automatic tables of contents keep their content. Update the field in Word after formatting.</li>
      </ul>
      <Link to="/formatter" className="btn-primary mt-10">Start Formatting</Link>
    </article>
  )
}
