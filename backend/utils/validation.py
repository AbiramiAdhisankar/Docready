"""Upload validation helpers. Everything here raises ApiError with a safe message."""
import io
import os
import re
import zipfile

MAX_UPLOAD_BYTES = 20 * 1024 * 1024
MAX_UNCOMPRESSED_BYTES = 200 * 1024 * 1024  # zip-bomb guard
DOCX_MIMES = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",  # some browsers/OSes send this for .docx
    "application/zip",
    "",
}


class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str):
        self.status, self.code, self.message = status, code, message


def safe_stem(filename: str) -> str:
    """Return a filesystem- and header-safe base name (no extension)."""
    base = os.path.basename((filename or "document").replace("\\", "/"))
    stem = os.path.splitext(base)[0]
    stem = re.sub(r"[^A-Za-z0-9._ -]", "_", stem).strip(" ._") or "document"
    return stem[:80]


def validate_upload(filename: str, content_type: str | None, data: bytes) -> None:
    if not filename or not filename.lower().endswith(".docx"):
        raise ApiError(400, "invalid_file", "Only Microsoft Word .docx files are supported.")
    if (content_type or "").split(";")[0].strip().lower() not in DOCX_MIMES:
        raise ApiError(400, "invalid_file", "Only Microsoft Word .docx files are supported.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise ApiError(413, "file_too_large", "Your file is larger than the 20 MB limit.")
    if len(data) == 0 or not data.startswith(b"PK"):
        raise ApiError(400, "invalid_file", "Please upload a valid DOCX file.")
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            names = set(z.namelist())
            if "word/document.xml" not in names or "[Content_Types].xml" not in names:
                raise ApiError(400, "invalid_file", "Please upload a valid DOCX file.")
            if sum(i.file_size for i in z.infolist()) > MAX_UNCOMPRESSED_BYTES:
                raise ApiError(400, "invalid_file", "Please upload a valid DOCX file.")
    except zipfile.BadZipFile:
        raise ApiError(422, "corrupted_file",
                       "We couldn't open this document. Please try another DOCX file.")
