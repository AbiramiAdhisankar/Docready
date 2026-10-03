"""End-to-end tests through the real HTTP API with real DOCX files."""
import hashlib
import io
import json
import os
import shutil
import subprocess
import sys
import zipfile

import pytest
from docx import Document
from docx.oxml.ns import qn
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from main import app  # noqa: E402
from scripts.make_sample import build  # noqa: E402

client = TestClient(app, raise_server_exceptions=False)
DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


@pytest.fixture(scope="module")
def sample(tmp_path_factory):
    path = tmp_path_factory.mktemp("sample") / "report.docx"
    build(str(path))
    return path.read_bytes()


def fmt(data, settings=None, name="report.docx"):
    r = client.post("/api/format", files={"file": (name, data, DOCX)}, data={"settings": json.dumps(settings or {})})
    assert r.status_code == 200, r.text
    meta = r.json()
    d = client.get(f"/api/download/{meta['file_id']}", params={"name": meta["formatted_name"]})
    assert d.status_code == 200
    return meta, d


def texts(doc):
    return [p.text for p in doc.paragraphs if p.text.strip()]


def test_analyze_reports_real_structure(sample):
    r = client.post("/api/analyze", files={"file": ("report.docx", sample, DOCX)})
    assert r.status_code == 200
    a = r.json()
    assert a["overview"]["tables"] == 1 and a["overview"]["images"] == 1
    assert a["overview"]["headings"] == 4 and a["overview"]["hyperlinks"] == 1
    assert a["overview"]["blank_paragraphs"] >= 5
    assert a["before"]["fonts"] >= 4 and a["before"]["alignments"] >= 3


def test_formatting_is_really_applied_and_original_untouched(sample):
    digest = hashlib.sha256(sample).hexdigest()
    meta, d = fmt(sample, {"font_family": "Times New Roman", "font_size": 12, "alignment": "justify", "line_spacing": 1.5})
    assert hashlib.sha256(sample).hexdigest() == digest
    assert 'filename="report-formatted.docx"' in d.headers["content-disposition"]
    doc = Document(io.BytesIO(d.content))
    body = [p for p in doc.paragraphs if p.text.strip() and p.style.name == "Normal"
            and p.text not in ("UNIT I", "INTRODUCTION")]
    assert body
    for p in body:
        assert p.alignment == 3  # JUSTIFY
        assert p.paragraph_format.line_spacing == 1.5
        for r in p.runs:
            rf = r._r.rPr.rFonts
            assert rf.get(qn("w:ascii")) == "Times New Roman"
            assert r.font.size.pt == 12
    # fonts must also hold inside hyperlinks
    link_runs = doc._element.body.xpath(".//w:hyperlink/w:r")
    assert link_runs and link_runs[0].rPr.rFonts.get(qn("w:ascii")) == "Times New Roman"
    assert "Formatted" not in meta["original_name"]
    # no text lost
    assert texts(doc) == texts(Document(io.BytesIO(sample)))


def test_headings_images_tables_preserved(sample):
    _, d = fmt(sample, {"heading1": {"size": 18, "bold": True}})
    src, out = Document(io.BytesIO(sample)), Document(io.BytesIO(d.content))
    heads = lambda doc: [(p.style.name, p.text) for p in doc.paragraphs if p.style.name.startswith(("Heading", "Title"))]
    assert heads(src) == heads(out)
    h1 = next(p for p in out.paragraphs if p.style.name == "Heading 1")
    assert h1.runs[0].font.size.pt == 18 and h1.runs[0].font.bold
    assert len(out.tables) == 1 and out.tables[0].cell(1, 0).text == "Value iteration"
    assert len(out.inline_shapes) == 1
    assert any(n.startswith("word/media/") for n in zipfile.ZipFile(io.BytesIO(d.content)).namelist())
    assert out.element.body.xpath(".//w:hyperlink")


def test_blank_removal_keeps_table_separator(sample):
    _, d = fmt(sample, {"remove_blank_paragraphs": True})
    out = Document(io.BytesIO(d.content))
    body = out.element.body
    tbl = body.find(qn("w:tbl"))
    assert tbl.getnext().tag == qn("w:p")  # paragraph after table survived
    blanks = [p for p in out.paragraphs if not p.text.strip() and not p._p.xpath(".//w:drawing")]
    assert len(blanks) <= 1


def test_page_setup_header_footer_and_page_field(sample):
    _, d = fmt(sample, {
        "page_size": "Letter", "orientation": "landscape", "margin_preset": "custom",
        "custom_margins": {"top": 1.25, "bottom": 0.8, "left": 1.5, "right": 0.9},
        "header": {"enabled": True, "text": "Seminar Report", "alignment": "right"},
        "footer": {"enabled": True, "text": "Confidential", "alignment": "left"},
        "page_numbers": {"enabled": True, "position": "bottom-center"}})
    out = Document(io.BytesIO(d.content))
    s = out.sections[0]
    assert round(s.page_width.inches, 2) == 11.0 and round(s.page_height.inches, 2) == 8.5
    assert round(s.top_margin.inches, 2) == 1.25 and round(s.left_margin.inches, 2) == 1.5
    assert s.header.paragraphs[0].text == "Seminar Report" and s.header.paragraphs[0].alignment == 2
    assert s.footer.paragraphs[0].text == "Confidential"
    footer_xml = s.footer._element.xml
    assert "PAGE" in footer_xml and 'w:fldCharType="begin"' in footer_xml
    last = s.footer.paragraphs[-1]
    assert last.alignment == 1
    # 6-inch image must have been scaled to fit the narrower text area
    assert out.inline_shapes[0].width.inches <= 11.0 - 1.5 - 0.9 + 0.01


def test_preserve_switches_really_remove_when_off(sample):
    _, d = fmt(sample, {"preserve_images": False, "preserve_tables": False, "preserve_hyperlinks": False})
    out = Document(io.BytesIO(d.content))
    assert len(out.tables) == 0 and len(out.inline_shapes) == 0
    assert not out.element.body.xpath(".//w:hyperlink")
    assert any("the project page" in t for t in texts(out))  # link text kept


def test_font_style_and_indent(sample):
    _, d = fmt(sample, {"font_style": "bold", "first_line_indent": 0.5})
    out = Document(io.BytesIO(d.content))
    p = next(p for p in out.paragraphs if p.text.startswith("Short closing"))
    assert p.runs[0].font.bold and round(p.paragraph_format.first_line_indent.inches, 2) == 0.5


@pytest.mark.parametrize("name,payload,ctype,status", [
    ("notes.txt", b"hello", "text/plain", 400),
    ("old.doc", b"\xd0\xcf\x11\xe0junk", "application/msword", 400),
    ("scan.pdf", b"%PDF-1.4", "application/pdf", 400),
    ("pic.png", b"\x89PNG", "image/png", 400),
    ("fake.docx", b"this is not a zip", DOCX, 400),
    ("broken.docx", b"PK\x03\x04" + b"\x00" * 50, DOCX, 422),
])
def test_invalid_files_rejected_with_clean_errors(name, payload, ctype, status):
    r = client.post("/api/analyze", files={"file": (name, payload, ctype)})
    assert r.status_code == status
    body = r.json()["error"]
    assert body["message"] and "Traceback" not in r.text and "/home" not in r.text


def test_zip_without_word_document_is_rejected():
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr("hello.txt", "x")
    r = client.post("/api/analyze", files={"file": ("x.docx", buf.getvalue(), DOCX)})
    assert r.status_code == 400


def test_large_file_rejected():
    big = b"PK" + b"0" * (21 * 1024 * 1024)
    r = client.post("/api/analyze", files={"file": ("big.docx", big, DOCX)})
    assert r.status_code == 413
    assert r.json()["error"]["message"] == "Your file is larger than the 20 MB limit."


def test_invalid_settings_rejected(sample):
    r = client.post("/api/format", files={"file": ("a.docx", sample, DOCX)}, data={"settings": '{"font_size": 99}'})
    assert r.status_code == 400 and r.json()["error"]["code"] == "invalid_settings"


def test_download_deletes_file_and_blocks_path_tricks(sample):
    meta, _ = fmt(sample)
    assert client.get(f"/api/download/{meta['file_id']}").status_code == 404  # already deleted after download
    assert client.get("/api/download/..%2f..%2fetc%2fpasswd").status_code == 404
    from api.routes import files
    meta2 = client.post("/api/format", files={"file": ("a.docx", sample, DOCX)}).json()
    assert files.exists(meta2["file_id"])
    assert client.delete(f"/api/files/{meta2['file_id']}").status_code == 204
    assert not files.exists(meta2["file_id"])


@pytest.mark.skipif(shutil.which("soffice") is None, reason="LibreOffice not installed")
def test_output_opens_in_libreoffice(sample, tmp_path):
    _, d = fmt(sample, {"page_numbers": {"enabled": True}, "header": {"enabled": True, "text": "Hdr"}})
    out = tmp_path / "out.docx"
    out.write_bytes(d.content)
    r = subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(tmp_path), str(out)],
                       capture_output=True, timeout=120)
    assert (tmp_path / "out.pdf").exists() and (tmp_path / "out.pdf").stat().st_size > 1000, r.stderr


def _chapter_doc():
    from docx.enum.text import WD_ALIGN_PARAGRAPH as A
    d = Document()
    long = "Reinforcement learning studies how an agent improves its decisions over time. " * 4
    items = [("CHAPTER 1", A.LEFT), ("UNIT II", A.CENTER), ("2", A.LEFT), ("I", A.JUSTIFY),
             ("Chapter 3: Basics of Learning", A.LEFT), ("Introduction to Learning", A.CENTER),
             (long, A.LEFT), ("mix", A.LEFT),
             ("Unit testing is a method used to verify that code works correctly.", A.LEFT)]
    for text, al in items:
        d.add_paragraph(text).alignment = al
    buf = io.BytesIO(); d.save(buf)
    return buf.getvalue()


def _by_text(doc):
    return {p.text: p for p in doc.paragraphs if p.text}


def test_chapter_and_unit_labels_are_centered_not_justified():
    _, d = fmt(_chapter_doc(), {"alignment": "justify", "first_line_indent": 0.5})
    p = _by_text(Document(io.BytesIO(d.content)))
    for label in ("CHAPTER 1", "UNIT II", "2", "I", "Chapter 3: Basics of Learning"):
        assert p[label].alignment == 1, label            # CENTER
        assert p[label].paragraph_format.first_line_indent.inches == 0, label
    assert p["Introduction to Learning"].alignment == 1  # short centered line kept
    long = next(v for k, v in p.items() if k.startswith("Reinforcement"))
    assert long.alignment == 3 and round(long.paragraph_format.first_line_indent.inches, 2) == 0.5
    assert p["mix"].alignment == 3                       # ordinary word, not a label
    assert p["Unit testing is a method used to verify that code works correctly."].alignment == 3


def test_chapter_label_alignment_and_switches_are_respected():
    _, d = fmt(_chapter_doc(), {"chapter_labels": {"enabled": True, "alignment": "left"}, "keep_centered_lines": False})
    p = _by_text(Document(io.BytesIO(d.content)))
    assert p["CHAPTER 1"].alignment == 0 and p["UNIT II"].alignment == 0
    assert p["Introduction to Learning"].alignment == 3
    _, d = fmt(_chapter_doc(), {"chapter_labels": {"enabled": False}, "keep_centered_lines": False})
    p = _by_text(Document(io.BytesIO(d.content)))
    assert p["CHAPTER 1"].alignment == 3 and p["UNIT II"].alignment == 3


def test_analyzer_reports_chapter_labels():
    r = client.post("/api/analyze", files={"file": ("c.docx", _chapter_doc(), DOCX)})
    assert r.json()["overview"]["chapter_labels"] == 5
