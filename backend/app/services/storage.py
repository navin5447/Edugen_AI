import json
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List


class JsonStore:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()
        if not self.file_path.exists():
            self._write({"uploads": [], "messages": [], "quizzes": [], "quiz_attempts": []})

    def _read(self) -> Dict[str, List[Dict[str, Any]]]:
        if not self.file_path.exists():
            return {"uploads": [], "messages": [], "quizzes": [], "quiz_attempts": []}
        return json.loads(self.file_path.read_text(encoding="utf-8"))

    def _write(self, data: Dict[str, List[Dict[str, Any]]]) -> None:
        temp_path = self.file_path.with_suffix(".tmp")
        temp_path.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")
        temp_path.replace(self.file_path)

    def add_upload(self, record: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            data = self._read()
            data["uploads"].append(record)
            self._write(data)
        return record

    def list_uploads(self, user_id: str) -> List[Dict[str, Any]]:
        data = self._read()
        return [item for item in data.get("uploads", []) if item.get("uid") == user_id]

    def get_upload(self, upload_id: str, user_id: str) -> Dict[str, Any] | None:
        data = self._read()
        for item in data.get("uploads", []):
            if item.get("id") == upload_id and item.get("uid") == user_id:
                return item
        return None

    def add_message(self, record: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            data = self._read()
            data["messages"].append(record)
            self._write(data)
        return record

    def list_messages(self, user_id: str) -> List[Dict[str, Any]]:
        data = self._read()
        return [item for item in data.get("messages", []) if item.get("uid") == user_id]

    def add_quiz(self, record: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            data = self._read()
            data["quizzes"].append(record)
            self._write(data)
        return record

    def list_quizzes(self, user_id: str) -> List[Dict[str, Any]]:
        data = self._read()
        return [item for item in data.get("quizzes", []) if item.get("uid") == user_id]

    def get_quiz(self, quiz_id: str, user_id: str) -> Dict[str, Any] | None:
        data = self._read()
        for item in data.get("quizzes", []):
            if item.get("id") == quiz_id and item.get("uid") == user_id:
                return item
        return None

    def add_quiz_attempt(self, record: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            data = self._read()
            data["quiz_attempts"].append(record)
            self._write(data)
        return record

    def list_quiz_attempts(self, user_id: str) -> List[Dict[str, Any]]:
        data = self._read()
        return [item for item in data.get("quiz_attempts", []) if item.get("uid") == user_id]

    def add_graph(self, record: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            data = self._read()
            if "graphs" not in data:
                data["graphs"] = []
            data["graphs"] = [g for g in data["graphs"] if not (g.get("file_id") == record.get("file_id") and g.get("uid") == record.get("uid"))]
            data["graphs"].append(record)
            self._write(data)
        return record

    def get_graph(self, file_id: str, user_id: str) -> Dict[str, Any] | None:
        data = self._read()
        for item in data.get("graphs", []):
            if item.get("file_id") == file_id and item.get("uid") == user_id:
                return item
        return None


def make_store(base_dir: Path | None = None) -> JsonStore:
    store_path = (base_dir or Path(__file__).resolve().parents[2] / "data") / "rag_store.json"
    return JsonStore(store_path)
