from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, Field


class SourceChunk(BaseModel):
    chunk_id: str
    file_id: str
    file_name: str
    page_number: Optional[int] = None
    score: float
    confidence: float
    source_url: Optional[str] = None
    text: str


class UploadedFileRecord(BaseModel):
    id: str
    uid: str
    title: str
    category: str
    filename: str
    stored_path: str
    size_bytes: int
    page_count: int
    chunk_count: int
    created_at: datetime


class ChatMessageRecord(BaseModel):
    id: str
    uid: str
    question: str
    answer: str
    sources: List[SourceChunk] = Field(default_factory=list)
    created_at: datetime


class UploadResponse(BaseModel):
    message: str
    item: UploadedFileRecord
    chunk_count: int


class ChatResponse(BaseModel):
    answer: str
    reply: str
    sources: List[SourceChunk]
    item: ChatMessageRecord


class HistoryResponse(BaseModel):
    items: List[ChatMessageRecord]
