from dataclasses import dataclass
from typing import List

from .chroma_service import ChromaService
from .local_embeddings import LocalEmbeddingService


@dataclass
class RetrievedChunk:
    chunk_id: str
    file_id: str
    file_name: str
    page_number: int | None
    score: float
    text: str


class RAGRetriever:
    def __init__(self, embeddings: LocalEmbeddingService, chroma_service: ChromaService):
        self.embeddings = embeddings
        self.chroma_service = chroma_service

    def retrieve(self, user_id: str, question: str, top_k: int = 5, where: dict | None = None) -> List[RetrievedChunk]:
        query_embedding = self.embeddings.embed_query(question)
        result = self.chroma_service.query(user_id, query_embedding, top_k=top_k, where=where)

        documents = result.get("documents", [[]])[0]
        metadatas = result.get("metadatas", [[]])[0]
        distances = result.get("distances", [[]])[0]

        chunks: List[RetrievedChunk] = []
        for index, document in enumerate(documents):
            metadata = metadatas[index] if index < len(metadatas) else {}
            distance = float(distances[index]) if index < len(distances) and distances[index] is not None else 0.0
            chunks.append(
                RetrievedChunk(
                    chunk_id=metadata.get("chunk_id", ""),
                    file_id=metadata.get("file_id", ""),
                    file_name=metadata.get("file_name", ""),
                    page_number=metadata.get("page_number"),
                    score=distance,
                    text=document,
                )
            )
        return chunks
