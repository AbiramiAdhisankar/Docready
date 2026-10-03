"""Temporary storage for generated files, with real cleanup.

Uploaded originals are never written to disk: analysis and formatting read them from
memory, so the original cannot be overwritten. Only the generated result is stored,
and it is deleted after download, on "start over", and after a TTL.
"""
import os
import re
import tempfile
import threading
import time
import uuid

TTL_SECONDS = 15 * 60
_ID_RE = re.compile(r"^[0-9a-f]{32}$")
_lock = threading.Lock()


class FileManager:
    def __init__(self, root: str | None = None):
        self.root = root or tempfile.mkdtemp(prefix="docready_")
        os.makedirs(self.root, exist_ok=True)

    def _path(self, file_id: str) -> str:
        if not _ID_RE.match(file_id):
            raise KeyError(file_id)
        return os.path.join(self.root, f"{file_id}.docx")

    def new_id(self) -> str:
        return uuid.uuid4().hex

    def save(self, file_id: str, data: bytes) -> None:
        self.cleanup_expired()
        with _lock, open(self._path(file_id), "wb") as f:
            f.write(data)

    def exists(self, file_id: str) -> bool:
        try:
            return os.path.isfile(self._path(file_id))
        except KeyError:
            return False

    def path(self, file_id: str) -> str:
        p = self._path(file_id)
        if not os.path.isfile(p):
            raise KeyError(file_id)
        return p

    def delete(self, file_id: str) -> None:
        try:
            os.remove(self._path(file_id))
        except (KeyError, FileNotFoundError):
            pass

    def cleanup_expired(self) -> int:
        removed, now = 0, time.time()
        for name in os.listdir(self.root):
            p = os.path.join(self.root, name)
            try:
                if os.path.isfile(p) and now - os.path.getmtime(p) > TTL_SECONDS:
                    os.remove(p)
                    removed += 1
            except OSError:
                pass
        return removed

    def purge_all(self) -> None:
        for name in os.listdir(self.root):
            try:
                os.remove(os.path.join(self.root, name))
            except OSError:
                pass
