import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from langchain_core.documents import Document

from ..rag.chunker import TextChunker
from ..rag.chroma_service import ChromaService, get_chroma_service
from ..rag.local_embeddings import LocalEmbeddingService, get_embedding_service
from ..rag.generator import GeminiAnswerGenerator, get_generator
from ..rag.pdf_loader import extract_pages
from ..rag.retriever import RAGRetriever, RetrievedChunk
from .storage import JsonStore


logger = logging.getLogger(__name__)


class RAGService:
    def __init__(
        self,
        store: JsonStore,
        chroma_service: ChromaService | None = None,
        embedding_service: LocalEmbeddingService | None = None,
        generator: GeminiAnswerGenerator | None = None,
    ):
        self.store = store
        self.chroma_service = chroma_service or get_chroma_service()
        self._embedding_service = embedding_service
        self._generator = generator
        self.chunker = TextChunker(chunk_size=1000, chunk_overlap=200)
        self.retriever = None

    @property
    def embedding_service(self) -> LocalEmbeddingService:
        if self._embedding_service is None:
            self._embedding_service = get_embedding_service()
            self.retriever = RAGRetriever(self._embedding_service, self.chroma_service)
        return self._embedding_service

    @property
    def generator(self) -> GeminiAnswerGenerator:
        if self._generator is None:
            self._generator = get_generator()
        return self._generator

    @property
    def retriever_service(self) -> RAGRetriever:
        if self.retriever is None:
            self.retriever = RAGRetriever(self.embedding_service, self.chroma_service)
        return self.retriever

    async def index_pdf(self, user: Dict[str, Any], file: UploadFile, title: str, category: str) -> Dict[str, Any]:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF uploads are supported")

        pdf_bytes = await file.read()
        if not pdf_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        upload_id = str(uuid4())
        uploads_dir = Path(__file__).resolve().parents[2] / "uploads" / user.get("uid", "unknown")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        stored_path = uploads_dir / f"{upload_id}-{file.filename}"
        stored_path.write_bytes(pdf_bytes)

        pages = extract_pages(pdf_bytes)
        page_count = len(pages)
        base_metadata = {
            "file_id": upload_id,
            "user_id": user.get("uid"),
            "title": title,
            "category": category,
            "file_name": file.filename,
        }
        documents: List[Document] = self.chunker.chunk_pages(pages, base_metadata=base_metadata)
        if not documents:
            raise HTTPException(status_code=400, detail="No extractable text found in PDF")

        texts = [document.page_content for document in documents]
        try:
            embeddings = self.embedding_service.embed_documents(texts)
        except RuntimeError as exc:
            logger.exception("PDF embedding failed for user %s and file %s", user.get("uid"), file.filename)
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        metadatas = []
        for index, document in enumerate(documents):
            metadata = dict(document.metadata)
            chunk_id = metadata.get("chunk_id") or f"{upload_id}_chunk_{index + 1}"
            metadata.update(
                {
                    "chunk_id": chunk_id,
                    "chunk_index": index + 1,
                    "page_number": metadata.get("page_number"),
                    "file_id": upload_id,
                    "user_id": user.get("uid"),
                    "file_name": file.filename,
                    "title": title,
                    "category": category,
                }
            )
            metadatas.append(metadata)

        self.chroma_service.add_documents(
            user_id=user.get("uid"),
            ids=[metadata["chunk_id"] for metadata in metadatas],
            documents=texts,
            metadatas=metadatas,
            embeddings=embeddings,
        )

        record = {
            "id": upload_id,
            "uid": user.get("uid"),
            "title": title,
            "category": category,
            "filename": file.filename,
            "stored_path": str(stored_path),
            "size_bytes": len(pdf_bytes),
            "page_count": page_count,
            "chunk_count": len(documents),
            "created_at": datetime.utcnow().isoformat(),
        }
        self.store.add_upload(record)
        return {"record": record, "chunk_count": len(documents)}

    def list_uploads(self, user_id: str) -> List[Dict[str, Any]]:
        return self.store.list_uploads(user_id)

    def ask(self, user: Dict[str, Any], question: str) -> Dict[str, Any]:
        try:
            retrieved_chunks = self.retriever_service.retrieve(user.get("uid"), question, top_k=5)
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        sources = [self._chunk_to_source(chunk) for chunk in retrieved_chunks]

        if retrieved_chunks:
            context_text = self._build_context(retrieved_chunks)
            try:
                answer = self.generator.generate(question=question, retrieved_chunks=context_text)
            except RuntimeError as exc:
                raise HTTPException(status_code=503, detail=str(exc)) from exc
        else:
            answer = "No relevant context was found in your uploaded documents."

        source_summary = self._source_summary(sources)

        record = {
            "id": str(uuid4()),
            "uid": user.get("uid"),
            "question": question,
            "answer": answer,
            "sources_summary": source_summary,
            "sources": sources,
            "created_at": datetime.utcnow().isoformat(),
        }
        self.store.add_message(record)
        return {"reply": answer, "answer": answer, "sources": sources, "record": record}

    def history(self, user_id: str) -> List[Dict[str, Any]]:
        return self.store.list_messages(user_id)

    @staticmethod
    def _build_context(chunks: List[RetrievedChunk]) -> str:
        parts: List[str] = []
        for chunk in chunks:
            parts.append(
                f"[File: {chunk.file_name} | Chunk: {chunk.chunk_id} | Page: {chunk.page_number}]\n{chunk.text.strip()}"
            )
        return "\n\n---\n\n".join(parts)

    @staticmethod
    def _chunk_to_source(chunk: RetrievedChunk):
        confidence = max(0.0, min(1.0, 1.0 / (1.0 + float(chunk.score))))
        return {
            "chunk_id": chunk.chunk_id,
            "file_id": chunk.file_id,
            "file_name": chunk.file_name,
            "page_number": chunk.page_number,
            "score": chunk.score,
            "confidence": confidence,
            "source_url": f"http://localhost:8000/uploads/file/{chunk.file_id}",
            "text": chunk.text,
        }

    @staticmethod
    def _source_summary(sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen: set[tuple[str, int | None]] = set()
        summary: List[Dict[str, Any]] = []
        for source in sources:
            key = (source["file_name"], source.get("page_number"))
            if key in seen:
                continue
            seen.add(key)
            summary.append(
                {
                    "file_name": source["file_name"],
                    "page": source.get("page_number"),
                    "chunk_id": source.get("chunk_id"),
                    "confidence": source.get("confidence", 0.0),
                    "source_url": source.get("source_url"),
                }
            )
        return summary
