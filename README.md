# DocReady

**Make every Word document look ready.**

DocReady is a web app where you upload a `.docx`, choose how it should look (fonts, spacing, margins, headings, page numbers and more), and download a **new, formatted `.docx`**. Your original is never modified.

## Features

- Drag-and-drop `.docx` upload (20 MB limit; `.doc`, PDF, images and text files are rejected with a clear message)
- Instant analysis: paragraphs, headings, tables, images, hyperlinks, fonts, sizes, alignments, line spacing, blank paragraphs, and a formatting check (green / orange / red)
- Font family, size and style; alignment; line spacing; paragraph spacing; first-line indent
- Page size (A4, Letter, Legal), orientation, margin presets and custom margins
- Title and Heading 1-3 settings (only paragraphs that already use Word heading styles are changed)
- Header, footer and **real Word `PAGE` fields** for page numbers (six positions)
- **Describe it in plain English**: type e.g. `Times New Roman 12, justified, 1.5 spacing, A4, 1 inch margins, page numbers bottom center, footer "Dept. of MCA"` and the settings are filled in. It is a keyword parser that runs in the browser (no AI service, no API key); it lists what it understood and you can edit every setting afterwards. It understands templates, font, size, heading/title sizes, alignment, line spacing, spacing before/after, first-line indent, margins (preset, all sides, per side), page size, orientation, header/footer text, page numbers and their position, blank-line removal, and chapter-name alignment.
- **Chapter and unit names**: lines such as `1`, `2`, `I`, `II`, `UNIT I`, `CHAPTER 2: Basics` are detected and aligned (centered by default) instead of being justified like body text. Short centered lines (e.g. a chapter title) also stay centered. Both are switchable.
- Five templates: College Assignment, Seminar Report, Project Report, Research Paper, Professional Report
- Switches: normalize fonts / sizes / alignment / line spacing / paragraph spacing, remove blank paragraphs, preserve images / tables / hyperlinks
- Before/after summary and a real `.docx` download named `original-name-formatted.docx`
- Temporary storage only, with real cleanup (see Privacy below)

## Tech stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS, React Router
- Backend: Python 3.10+, FastAPI, python-docx
- Tests: pytest (HTTP-level tests with real DOCX files, plus a LibreOffice open check)

## Folder structure

```text
docready/
├── backend/
│   ├── main.py                     # app, CORS, error handlers, optional static hosting
│   ├── requirements.txt
│   ├── api/routes.py               # /api/health, /analyze, /format, /download, /files
│   ├── services/
│   │   ├── document_analyzer.py    # read-only analysis
│   │   ├── document_formatter.py   # applies settings to a copy
│   │   ├── docx_helpers.py         # shared DOCX helpers
│   │   └── file_manager.py         # temp storage + cleanup
│   ├── models/formatting_settings.py
│   ├── utils/validation.py
│   ├── scripts/make_sample.py      # builds a messy sample DOCX for testing
│   └── tests/test_workflow.py
└── frontend/
    └── src/
        ├── components/             # FileUploader, FontSettings, ParagraphSettings, PageSettings,
        │                           # HeadingSettings, HeaderFooterSettings, OptionsSettings,
        │                           # TemplateSelector, DocumentAnalysis, ProcessingState, ResultPanel
        ├── pages/                  # Home, Formatter, About, Privacy
        ├── services/api.ts
        ├── templates.ts            # defaults + template presets
        └── App.tsx
```

## Requirements

- Python 3.10 or newer
- Node.js 18 or newer
- Optional: LibreOffice (only used by one test that checks the output opens)

## Installation

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Frontend:

```bash
cd frontend
npm install
```

## Running locally

Terminal 1 (API on port 8000):

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Terminal 2 (website on port 5173; `/api` is proxied to the backend):

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 and click **Start Formatting**. To try it quickly, create a messy sample file:

```bash
cd backend
python scripts/make_sample.py sample.docx
```

Run the tests:

```bash
cd backend
python -m pytest -q
```

## API information

Errors always look like `{"error": {"code": "...", "message": "..."}}`; stack traces and server paths are never returned.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/analyze` | Multipart `file`. Returns structure, fonts, issues. Nothing is stored. |
| POST | `/api/format` | Multipart `file` + `settings` (JSON string). Returns `file_id`, names, summary, before/after. |
| GET | `/api/download/{file_id}?name=...` | Returns the real `.docx`; the server copy is deleted right after. |
| DELETE | `/api/files/{file_id}` | Discards a result early (used by Start Over). |

Status codes: 400 invalid file or settings, 413 over 20 MB, 422 corrupted document, 404 file gone, 500 processing failure. Interactive docs are at `/api/docs`.

## Privacy and cleanup

- Uploads are read in memory only. The original is never written to disk or changed.
- Only the formatted result is stored, in a temp folder under a random 32-hex name.
- It is deleted after download, on Start Over, after 15 minutes (checked on each save), and when the server shuts down.
- Validation: extension, MIME type, size limit, ZIP structure (`word/document.xml`), decompressed-size (zip bomb) guard, safe output filenames, ID format check on downloads.

## DOCX formatting limitations

- Fonts, sizes and styles are written to every run, including runs inside hyperlinks, and to the Normal, Title and Heading styles. Text inside text boxes, shapes, footnotes and comments is not reformatted.
- **Normal** font style leaves existing bold/italic alone; Bold/Italic/Underline apply to body text (not tables).
- Table text gets the font family and size, but table layout, alignment and spacing are left alone. Very wide fixed-width tables can still overflow a narrower page.
- Chapter/unit detection looks at the line's text: digits or UPPER-CASE roman numerals alone (`1`, `2.`, `II`), or a keyword (chapter, unit, part, module, section, appendix, lesson) followed by a number/numeral/capital letter, optionally with a short title. Lower-case roman numerals alone (`ii`) are not treated as labels, to avoid matching ordinary words.
- Alignment, spacing and indent are not applied to image-only paragraphs, captions, table-of-contents entries, or (for indent) list items and already-indented paragraphs.
- Heading settings only affect paragraphs using Word's Title / Heading 1-3 styles. Fake headings (bold body text) are not detected or converted.
- Blank-paragraph removal keeps page breaks, section breaks, images, and the blank line that separates two tables or ends the document after a table.
- Inline images wider than the new text area are scaled down; floating images are untouched.
- Page numbers: if a header/footer already contains a bare page number it is replaced; text such as "Page 3 of 9" is kept, so you may see two numbers.
- Turning off Preserve images / tables / hyperlinks really removes them from the copy (links keep their text). The UI warns when you do this.
- Page counts before formatting are estimates unless Word saved them in the file.
- Automatic tables of contents keep their content; update the field in Word afterwards.
- The result was verified by re-reading the XML with python-docx and converting it with LibreOffice. It has not been opened in Microsoft Word on every platform; the downloaded file is the source of truth.

## Deployment

**Single service (simplest).** Build the frontend and let FastAPI serve it:

```bash
cd frontend && npm install && npm run build
cd ../backend && pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port $PORT
```

`main.py` serves `frontend/dist` automatically when it exists (including client-side routes like `/formatter`). This works on Render, Railway, Fly.io or any VPS behind HTTPS.

**Separate frontend and backend.**

1. Backend: deploy `backend/` as a Python web service with start command `uvicorn main:app --host 0.0.0.0 --port $PORT`. Set `ALLOWED_ORIGINS=https://your-frontend-domain` (comma-separated for several).
2. Frontend: set `VITE_API_URL=https://your-api-domain`, run `npm run build`, and host `frontend/dist` on Netlify, Vercel, Cloudflare Pages or any static host. Add a rewrite of all paths to `/index.html` so `/formatter` works on refresh.

Notes: run a single backend process (or use shared storage) because results are held in the server's temp folder; put the service behind HTTPS; most hosts also cap request body size, so keep it at 20 MB or above.
