"""Embedding service wrapper supporting both local inference and Google Cloud API."""
import logging
import os
from functools import lru_cache
from typing import Any, List

logger = logging.getLogger(__name__)


class LocalEmbeddingService:
    """Embedding service using SentenceTransformer for local inference."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """Initialize the embedding service with a SentenceTransformer model.

        Args:
            model_name: Name of the SentenceTransformer model to use.
                        Defaults to all-MiniLM-L6-v2.
        """
        # Allow model override via environment variable
        self.model_name = os.getenv("EMBEDDING_MODEL", model_name)
        try:
            logger.info("Loading local embedding model: %s", self.model_name)
            # Defer importing sentence_transformers to avoid loading PyTorch/transformers into RAM
            # on cloud deployment containers where resources are constrained.
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(self.model_name)
            # Support both old and new sentence-transformers versions
            if hasattr(self.model, "get_embedding_dimension"):
                dim = self.model.get_embedding_dimension()
            else:
                dim = self.model.get_sentence_embedding_dimension()
            logger.info(
                "Local embedding model loaded successfully. Embedding dimension: %s",
                dim,
            )
        except Exception as exc:
            logger.exception("Failed to load local embedding model: %s", self.model_name)
            raise RuntimeError(f"Failed to load local embedding model '{self.model_name}': {exc}") from exc

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of document texts."""
        if not texts:
            return []

        try:
            embeddings = self.model.encode(texts, convert_to_tensor=False)
            return [embedding.tolist() for embedding in embeddings]
        except Exception as exc:
            logger.exception("Failed to embed %s documents with %s", len(texts), self.model_name)
            raise RuntimeError(f"Failed to embed documents using local model '{self.model_name}': {exc}") from exc

    def embed_query(self, text: str) -> List[float]:
        """Embed a single query text."""
        try:
            embedding = self.model.encode([text], convert_to_tensor=False)
            return embedding[0].tolist()
        except Exception as exc:
            logger.exception("Failed to embed query with %s", self.model_name)
            raise RuntimeError(f"Failed to embed query using local model '{self.model_name}': {exc}") from exc


class GoogleEmbeddingService:
    """Embedding service using Google Generative AI API (cloud)."""

    def __init__(self, api_key: str):
        # Defer import to save memory and dependencies when in local mode
        from langchain_google_genai import GoogleGenerativeAIEmbeddings

        logger.info("Initializing Google Generative AI Embeddings (Cloud)...")
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=api_key
        )

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed list of documents using Gemini API."""
        try:
            return self.embeddings.embed_documents(texts)
        except Exception as exc:
            logger.exception("Failed to embed documents with Google Generative AI")
            raise RuntimeError(f"Failed to embed documents using Google Cloud API: {exc}") from exc

    def embed_query(self, text: str) -> List[float]:
        """Embed query using Gemini API."""
        try:
            return self.embeddings.embed_query(text)
        except Exception as exc:
            logger.exception("Failed to embed query with Google Generative AI")
            raise RuntimeError(f"Failed to embed query using Google Cloud API: {exc}") from exc


@lru_cache(maxsize=1)
def get_embedding_service() -> Any:
    """Get or create a cached embedding service instance (Local or Google Cloud)."""
    # 1. Check if EMBEDDING_PROVIDER is explicitly set
    provider = os.getenv("EMBEDDING_PROVIDER")
    
    if not provider:
        # 2. If running on Render, force "gemini" (Google Cloud API) to stay within 512MB RAM limits
        if os.getenv("RENDER") == "true" or os.getenv("RENDER"):
            provider = "gemini"
        else:
            # 3. If running locally, default to "local" (SentenceTransformer)
            # so it works exactly like it did before deployment without consuming Gemini API quota
            provider = "local"
            
    provider = provider.lower()

    if provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is required for cloud embeddings")
        return GoogleEmbeddingService(api_key)
    else:
        return LocalEmbeddingService()
