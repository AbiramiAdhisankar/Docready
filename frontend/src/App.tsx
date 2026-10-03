import { useEffect } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import About from './pages/About'
import Formatter from './pages/Formatter'
import Home from './pages/Home'
import Privacy from './pages/Privacy'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="DocReady home">
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden><rect x="6" y="3" width="20" height="26" rx="1.5" fill="#fff" stroke="#2450D6" strokeWidth="2" /><path d="M10 10h12M10 15h12M10 20h8" stroke="#2450D6" strokeWidth="2" strokeLinecap="round" /></svg>
      <span className="font-display text-2xl font-semibold">DocReady</span>
    </Link>
  )
}

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors hover:text-accent ${isActive ? 'text-accent' : 'text-muted'}`

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <header className="border-b border-line bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6" aria-label="Main">
          <Logo />
          <div className="flex items-center gap-0.5 sm:gap-2">
            <NavLink to="/about" className={(s) => `${link(s)} max-sm:hidden`}>About</NavLink>
            <NavLink to="/privacy" className={(s) => `${link(s)} max-sm:hidden`}>Privacy</NavLink>
            <Link to="/formatter" className="btn-primary ml-1 !px-3.5 !py-2">Formatter</Link>
          </div>
        </nav>
      </header>
      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/formatter" element={<Formatter />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="text-5xl font-semibold">Page not found</h1><Link to="/" className="btn-primary mt-6">Back to home</Link></div>} />
        </Routes>
      </main>
      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:px-6">
          <p>DocReady · Make every Word document look ready.</p>
          <nav aria-label="Footer" className="flex gap-4"><Link to="/about" className="hover:text-accent">About</Link><Link to="/privacy" className="hover:text-accent">Privacy</Link></nav>
          <p className="w-full">Files are processed temporarily and are not permanently stored.</p>
        </div>
      </footer>
    </div>
  )
}
