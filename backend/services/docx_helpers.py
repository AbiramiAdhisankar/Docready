"""Small helpers shared by the analyzer and the formatter."""
import re
from typing import Iterator, Optional

from docx.oxml.ns import qn
from docx.text.run import Run

# Elements that make a paragraph "not blank" even when it has no text.
_KEEP_TAGS = {
    "drawing", "pict", "object", "br", "sectPr", "fldChar", "fldSimple", "bookmarkStart",
    "footnoteReference", "endnoteReference", "commentReference", "sym", "oMath", "oMathPara",
}
_SKIP_STYLE_PREFIXES = ("toc", "caption", "header", "footer", "table of figures", "index")


def local(el) -> str:
    tag = el.tag
    return tag.rsplit("}", 1)[-1] if isinstance(tag, str) else ""


def is_blank(p_elm) -> bool:
    """True for a paragraph with no visible text and nothing structural inside it."""
    for el in p_elm.iter():
        name = local(el)
        if name in _KEEP_TAGS:
            return False
        if name == "t" and el.text and el.text.strip():
            return False
    return True


def has_drawing(p_elm) -> bool:
    return any(local(el) in ("drawing", "pict", "object") for el in p_elm.iter())


def is_list_paragraph(p_elm) -> bool:
    return p_elm.find(qn("w:pPr") + "/" + qn("w:numPr")) is not None


def style_name(paragraph) -> str:
    try:
        return (paragraph.style.name or "").strip()
    except Exception:
        return ""


def heading_level(paragraph) -> Optional[int]:
    """1-9 for 'Heading N' styles, 0 for Title, None otherwise."""
    name = style_name(paragraph).lower()
    if name == "title":
        return 0
    m = re.fullmatch(r"heading\s*(\d)", name)
    return int(m.group(1)) if m else None


def is_special_style(paragraph) -> bool:
    return style_name(paragraph).lower().startswith(_SKIP_STYLE_PREFIXES)


def runs_of(paragraph) -> Iterator[Run]:
    """All runs, including those inside hyperlinks (python-docx's .runs skips them)."""
    for r in paragraph._p.iter(qn("w:r")):
        yield Run(r, paragraph)


def run_text(run: Run) -> str:
    return "".join(t.text or "" for t in run._r.iter(qn("w:t")))


def style_chain(style) -> Iterator:
    seen = 0
    while style is not None and seen < 20:
        yield style
        style = style.base_style
        seen += 1


def theme_fonts(document) -> dict:
    out = {"major": None, "minor": None}
    try:
        for rel in document.part.rels.values():
            if rel.reltype.endswith("/theme"):
                xml = rel.target_part.blob.decode("utf8", "ignore")
                for key in ("major", "minor"):
                    m = re.search(rf"<a:{key}Font>\s*<a:latin typeface=\"([^\"]*)\"", xml)
                    if m:
                        out[key] = m.group(1) or None
    except Exception:
        pass
    return out


def rfonts_name(rfonts, themes) -> Optional[str]:
    if rfonts is None:
        return None
    for attr in ("w:ascii", "w:hAnsi"):
        v = rfonts.get(qn(attr))
        if v:
            return v
    theme = rfonts.get(qn("w:asciiTheme")) or rfonts.get(qn("w:hAnsiTheme"))
    if theme:
        return themes.get("major" if theme.startswith("major") else "minor")
    return None


# ---- chapter / unit labels ("1", "II", "UNIT I", "CHAPTER 2: Basics") ----------------------
_ROMAN = r"M{0,3}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})"
_BARE = re.compile(rf"^(?:\d{{1,3}}|{_ROMAN})\s*[.:)\-\u2013]?$")  # roman numerals: upper case only
_KEYWORD_TOKEN = re.compile(
    r"^(?:chapter|unit|part|module|section|appendix|lesson)\s*[-\u2013.:]?\s*"
    r"(?:\d{1,3}|[ivxlcdm]{1,6}|(?-i:[A-Z]))(?=$|[\s\-\u2013.:)])", re.I)


def is_chapter_label(text: str) -> bool:
    t = " ".join((text or "").split())
    if not t or len(t) > 80:
        return False
    if _BARE.match(t):
        return True
    m = _KEYWORD_TOKEN.match(t)
    if not m:
        return False
    if not t[m.end():].strip(" -\u2013.:)"):
        return True
    return len(t.split()) <= 10 and not t.endswith((".", ";", ","))


def is_short_line(text: str) -> bool:
    t = " ".join((text or "").split())
    return 0 < len(t) <= 100 and len(t.split()) <= 14 and not t.endswith((".", ",", ";"))


def is_centered(paragraph) -> bool:
    """Original (pre-formatting) alignment is centered, directly or via its style."""
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    if paragraph.alignment is not None:
        return paragraph.alignment == WD_ALIGN_PARAGRAPH.CENTER
    for st in style_chain(paragraph.style):
        if st.paragraph_format.alignment is not None:
            return st.paragraph_format.alignment == WD_ALIGN_PARAGRAPH.CENTER
    return False
