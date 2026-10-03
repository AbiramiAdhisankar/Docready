"""REST endpoints. Business logic lives in services/."""
import json
import logging

from fastapi import APIRouter, BackgroundTasks, File, Form, UploadFile
from fastapi.responses import FileResponse
from pydantic import ValidationError

from models.formatting_settings import FormattingSettings
from services.document_analyzer import DocumentAnalyzer
from services.document_formatter import DocumentFormatter
from services.file_manager import FileManager
from utils.validation import MAX_UPLOAD_BYTES, ApiError, safe_stem, validate_upload

log = logging.getLogger("docready")
router = APIRouter(prefix="/api")
files = FileManager()
DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
CORRUPT = ApiError(422, "corrupted_file", "We couldn't open this document. Please try another DOCX file.")


async def _read_upload(upload: UploadFile) -> bytes:
    data = await upload.read(MAX_UPLOAD_BYTES + 1)  # never buffer more than limit + 1 byte
    validate_upload(upload.filename or "", upload.content_type, data)
    return data


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    data = await _read_upload(file)
    try:
        return DocumentAnalyzer(data, file.filename).analyze()
    except Exception:
        log.exception("analysis failed")
        raise CORRUPT


@router.post("/format")
async def format_document(file: UploadFile = File(...), settings: str = Form("{}")):
    data = await _read_upload(file)
    try:
        parsed = FormattingSettings.model_validate(json.loads(settings or "{}"))
    except (ValidationError, json.JSONDecodeError):
        raise ApiError(400, "invalid_settings", "Some formatting settings are not valid. Please review them and try again.")
    try:
        before = DocumentAnalyzer(data, file.filename).analyze()["before"]
    except Exception:
        log.exception("could not open document")
        raise CORRUPT
    try:
        result, report = DocumentFormatter(data, parsed).run()
    except Exception:
        log.exception("formatting failed")
        raise ApiError(500, "processing_failed",
                       "Something went wrong while formatting your document. Please try again.")
    stem = safe_stem(file.filename or "document")
    file_id = files.new_id()
    files.save(file_id, result)
    return {"file_id": file_id, "original_name": f"{stem}.docx", "formatted_name": f"{stem}-formatted.docx",
            "before": before, **report}


@router.get("/download/{file_id}")
def download(file_id: str, background: BackgroundTasks, name: str = "document-formatted.docx"):
    if not files.exists(file_id):
        raise ApiError(404, "not_found", "This file is no longer available. Please format the document again.")
    filename = safe_stem(name.removesuffix(".docx")) + ".docx"
    background.add_task(files.delete, file_id)  # deleted once the response is sent
    return FileResponse(files.path(file_id), media_type=DOCX_MIME, filename=filename,
                        headers={"Cache-Control": "no-store"})


@router.delete("/files/{file_id}", status_code=204)
def discard(file_id: str):
    files.delete(file_id)
