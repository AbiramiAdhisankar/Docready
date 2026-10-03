"""DocReady API. Run: uvicorn main:app --reload --port 8000"""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from api.routes import files, router
from utils.validation import ApiError

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    files.purge_all()  # nothing survives a shutdown


app = FastAPI(title="DocReady API", docs_url="/api/docs", openapi_url="/api/openapi.json", lifespan=lifespan)

origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST", "DELETE"],
                   allow_headers=["*"], expose_headers=["Content-Disposition"])


def _error(status: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"error": {"code": code, "message": message}})


@app.exception_handler(ApiError)
async def _api_error(_: Request, exc: ApiError):
    return _error(exc.status, exc.code, exc.message)


@app.exception_handler(RequestValidationError)
async def _validation(_: Request, __: RequestValidationError):
    return _error(400, "invalid_request", "Please upload a valid DOCX file.")


@app.exception_handler(Exception)
async def _unhandled(_: Request, __: Exception):
    logging.getLogger("docready").exception("unhandled error")
    return _error(500, "processing_failed", "Something went wrong while formatting your document. Please try again.")


app.include_router(router)

# Optional: serve the built frontend from the same process (single-service deployment).
DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST, "assets")), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def spa(path: str):
        if path == "api" or path.startswith("api/"):
            return _error(404, "not_found", "This endpoint does not exist.")
        root = os.path.realpath(DIST)
        candidate = os.path.realpath(os.path.join(root, path))
        if path and candidate.startswith(root + os.sep) and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(DIST, "index.html"))
