import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import HeroPreview from '../components/HeroPreview'

const FEATURES = [
  ['🎨', 'Custom Formatting', 'Choose fonts, sizes, spacing, alignment, and page settings.'],
  ['📄', 'Academic Templates', 'Quickly format assignments, seminar reports, project reports, and research documents.'],
  ['🔍', 'Document Checker', 'Detect common formatting inconsistencies.'],
  ['⚡', 'Fast Processing', 'Format your document without manually editing every page.'],
  ['🔒', 'Privacy First', 'Uploaded documents are processed temporarily and are not permanently stored.'],
]

const STEPS = [
  ['01', 'Upload', 'Upload your .docx file.'],
  ['02', 'Customize', 'Choose exactly how the document should look.'],
  ['03', 'Download', 'Download the newly formatted Word document.'],
]

export default function Home() {
  useEffect(() => { document.title = 'DocReady: Make every Word document look ready' }, [])
  return (
    <div className="page-enter">
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-20">
        <div>
          <h1 className="text-5xl font-semibold leading-[1.05] sm:text-6xl">Make Every Word Document Look Ready.</h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Upload your DOCX, choose your formatting requirements, and download a clean, professionally formatted document in seconds.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/formatter" className="btn-primary !px-7 !py-3 text-base">Start Formatting</Link>
            <button type="button" className="btn-secondary !px-7 !py-3 text-base"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How It Works</button>
          </div>
        </div>
        <HeroPreview />
      </section>

      <section className="border-y border-line bg-white" aria-labelledby="features">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="features" className="max-w-xl text-4xl font-semibold">Everything a submission needs, without the manual editing</h2>
          <ul className="mt-10 grid gap-x-12 sm:grid-cols-2">
            {FEATURES.map(([icon, title, text]) => (
              <li key={title} className="flex gap-4 border-t border-line py-6">
                <span className="text-2xl" aria-hidden>{icon}</span>
                <div><h3 className="text-xl font-semibold">{title}</h3><p className="mt-1 text-muted">{text}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-16 sm:px-6" aria-labelledby="how">
        <h2 id="how" className="text-4xl font-semibold">How it works</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map(([n, t, d]) => (
            <li key={n} className="border-t-2 border-ink pt-4">
              <span className="font-display text-3xl font-semibold text-accent">{n}</span>
              <h3 className="mt-1 text-2xl font-semibold">{t}</h3>
              <p className="mt-1 text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-ink px-8 py-10 text-white md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-semibold">Your documents stay private.</h2>
            <p className="mt-1 max-w-lg text-white/75">Files are processed temporarily and are not permanently stored.</p>
          </div>
          <Link to="/formatter" className="btn bg-white text-ink hover:bg-accent-soft">Start Formatting</Link>
        </div>
      </section>
    </div>
  )
}
