/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#15202B', muted: '#5B6675', line: '#DCE1E8', paper: '#F4F6F9',
        accent: { DEFAULT: '#2450D6', dark: '#1B3FAE', soft: '#E7EDFD' },
        ok: { DEFAULT: '#0F7A43', bg: '#E8F5EE' },
        warn: { DEFAULT: '#A85A00', bg: '#FFF3E0' },
        err: { DEFAULT: '#B42318', bg: '#FDECEA' },
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['"Public Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: { page: '2px' },
      boxShadow: { sheet: '0 1px 2px rgba(21,32,43,.08), 0 10px 28px -12px rgba(21,32,43,.28)' },
    },
  },
  plugins: [],
}
