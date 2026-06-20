"""Local embedding service using SentenceTransformers."""
import logging
import os
from functools import lru_cache
from typing import List

from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)


class LocalEmbeddingService:
    """Embedding service using SentenceTransformer for local inference."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """Initialize the embedding service with a SentenceTransformer model.

        Args:
            model_name: Name of the SentenceTransformer model to use.
                        Defaults to all-MiniLM-L6-v2 (fast, lightweight, good quality).
        """
        # Allow model override via environment variable
        self.model_name = os.getenv("EMBEDDING_MODEL", model_name)
        try:
            logger.info("Loading local embedding model: %s", self.model_name)
            self.model = SentenceTransformer(self.model_name)
            logger.info(
                "Local embedding model loaded successfully. Embedding dimension: %s",
                self.model.get_sentence_embedding_dimension(),
            )
        except Exception as exc:
            logger.exception("Failed to load local embedding model: %s", self.model_name)
            raise RuntimeError(f"Failed to load local embedding model '{self.model_name}': {exc}") from exc

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of document texts.

        Args:
            texts: List of text strings to embed.

        Returns:
            List of embedding vectors (each is a list of floats).

        Raises:
            RuntimeError: If embedding fails.
        """
        if not texts:
            return []

        try:
            # encode() returns a numpy array; convert to list of lists
            embeddings = self.model.encode(texts, convert_to_tensor=False)
            return [embedding.tolist() for embedding in embeddings]
        except Exception as exc:
            logger.exception("Failed to embed %s documents with %s", len(texts), self.model_name)
            raise RuntimeError(f"Failed to embed documents using local model '{self.model_name}': {exc}") from exc

    def embed_query(self, text: str) -> List[float]:
        """Embed a single query text.

        Args:
            text: Query text to embed.

        Returns:
            Embedding vector as a list of floats.

        Raises:
            RuntimeError: If embedding fails.
        """
        try:
            embedding = self.model.encode([text], convert_to_tensor=False)
            return embedding[0].tolist()
        except Exception as exc:
            logger.exception("Failed to embed query with %s", self.model_name)
            raise RuntimeError(f"Failed to embed query using local model '{self.model_name}': {exc}") from exc


@lru_cache(maxsize=1)
def get_embedding_service() -> LocalEmbeddingService:
    """Get or create a cached embedding service instance."""
    return LocalEmbeddingService()
