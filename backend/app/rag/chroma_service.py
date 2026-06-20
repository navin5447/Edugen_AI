import hashlib
import os
from functools import lru_cache
from typing import List

import chromadb
from chromadb.api.models.Collection import Collection


class ChromaService:
    def __init__(self, persist_dir: str | None = None):
        self.persist_dir = persist_dir or os.getenv("CHROMA_PERSIST_DIR", "./chroma")
        self.client = chromadb.PersistentClient(path=self.persist_dir)
        self.collection_suffix = os.getenv("EMBEDDING_COLLECTION_SUFFIX", "local-minilm-l6-v2")

    @staticmethod
    def _collection_name(user_id: str) -> str:
        digest = hashlib.sha1(user_id.encode("utf-8")).hexdigest()[:32]
        return f"user_{digest}"

    def get_collection(self, user_id: str) -> Collection:
        return self.client.get_or_create_collection(
            name=f"{self._collection_name(user_id)}_{self.collection_suffix}",
            metadata={"user_id": user_id, "embedding_model": self.collection_suffix},
        )

    def add_documents(self, user_id: str, ids: List[str], documents: List[str], metadatas: List[dict], embeddings: List[List[float]]) -> None:
        collection = self.get_collection(user_id)
        collection.add(ids=ids, documents=documents, metadatas=metadatas, embeddings=embeddings)

    def query(self, user_id: str, query_embedding: List[float], top_k: int = 5, where: dict | None = None) -> dict:
        collection = self.get_collection(user_id)
        return collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where,
            include=["documents", "metadatas", "distances"],
        )


@lru_cache(maxsize=1)
def get_chroma_service() -> ChromaService:
    return ChromaService()
