from functools import lru_cache
from pathlib import Path

from .services.quiz_service import QuizService
from .services.rag_service import RAGService
from .services.concept_service import ConceptService
from .services.storage import make_store


@lru_cache(maxsize=1)
def get_rag_service() -> RAGService:
    return RAGService(store=make_store(Path(__file__).resolve().parents[1] / "data"))


@lru_cache(maxsize=1)
def get_quiz_service() -> QuizService:
    rag_service = get_rag_service()
    return QuizService(store=rag_service.store, rag_service=rag_service)


@lru_cache(maxsize=1)
def get_concept_service() -> ConceptService:
    rag_service = get_rag_service()
    return ConceptService(store=rag_service.store, rag_service=rag_service)

