import json
from datetime import datetime
from typing import Any, Dict, List
from uuid import uuid4

from fastapi import HTTPException
from langchain_core.prompts import ChatPromptTemplate
from ..utils.llm_factory import get_llm

from ..rag.generator import GeminiAnswerGenerator, get_generator
from ..schemas.quiz import QuizGenerationRequest, QuizQuestion, QuizAttemptSubmission
from .rag_service import RAGService
from .storage import JsonStore


class QuizService:
    def __init__(self, store: JsonStore, rag_service: RAGService):
        self.store = store
        self.rag_service = rag_service
        self.generator: GeminiAnswerGenerator | None = None
        self.quiz_model: Any | None = None

    @property
    def quiz_generator(self) -> GeminiAnswerGenerator:
        if self.generator is None:
            self.generator = get_generator()
        return self.generator

    @property
    def quiz_llm(self) -> Any:
        if self.quiz_model is None:
            self.quiz_model = get_llm(temperature=0.3)
        return self.quiz_model

    def generate_quiz(self, user: Dict[str, Any], payload: QuizGenerationRequest) -> Dict[str, Any]:
        uploads = self.rag_service.list_uploads(user.get("uid"))
        if not uploads:
            raise HTTPException(status_code=400, detail="Upload at least one PDF before generating a quiz")

        where_clause = None
        if payload.file_id:
            where_clause = {"file_id": payload.file_id}

        query_text = f"Generate questions about: {payload.concept}" if payload.concept else f"Generate a {payload.difficulty} quiz with {payload.question_count} questions"

        retrieved_chunks = self.rag_service.retriever_service.retrieve(
            user.get("uid"),
            question=query_text,
            top_k=8,
            where=where_clause,
        )
        if not retrieved_chunks:
            raise HTTPException(status_code=400, detail="No relevant content found to generate a quiz")

        context_text = self.rag_service._build_context(retrieved_chunks)
        
        system_instruction = "You are EduGenie AI. Generate MCQ quizzes only from the provided context. "
        if payload.concept:
            system_instruction += f"The quiz questions MUST focus specifically on the concept: '{payload.concept}'. "
        system_instruction += (
            "Return valid JSON only and do not include code fences or commentary. "
            "The JSON shape must be: {{\"questions\":[{{\"question\":\"\",\"options\":[\"\",\"\",\"\",\"\"],\"correct_answer\":\"\",\"explanation\":\"\"}}]}}"
        )

        human_instruction = "Difficulty: {difficulty}\nQuestion count: {question_count}\nContext:\n{context}"
        if payload.concept:
            human_instruction = f"Focus Topic/Concept: {payload.concept}\n" + human_instruction

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    system_instruction,
                ),
                (
                    "human",
                    human_instruction,
                ),
            ]
        )
        try:
            messages = prompt.format_messages(difficulty=payload.difficulty, question_count=payload.question_count, context=context_text)
            raw_response = self.quiz_llm.invoke(messages)
            raw_text = raw_response.content if hasattr(raw_response, "content") else str(raw_response)
            parsed = self._parse_quiz_json(raw_text)
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        except HTTPException:
            raise

        questions = self._normalize_questions(parsed.get("questions", []), payload.question_count)
        quiz_id = str(uuid4())
        quiz_record = {
            "id": quiz_id,
            "uid": user.get("uid"),
            "difficulty": payload.difficulty,
            "question_count": len(questions),
            "title": f"{payload.difficulty.title()} Quiz",
            "source_file_ids": self._source_file_ids(retrieved_chunks),
            "questions": questions,
            "created_at": datetime.utcnow().isoformat(),
        }
        self.store.add_quiz(quiz_record)
        return {"quiz": quiz_record}

    def list_quizzes(self, user_id: str) -> List[Dict[str, Any]]:
        return self.store.list_quizzes(user_id)

    def get_quiz(self, quiz_id: str, user_id: str) -> Dict[str, Any] | None:
        quiz = self.store.get_quiz(quiz_id, user_id)
        if not quiz:
            return None
        attempts = [attempt for attempt in self.store.list_quiz_attempts(user_id) if attempt.get("quiz_id") == quiz_id]
        quiz = dict(quiz)
        quiz["attempts"] = attempts
        return quiz

    def save_attempt(self, quiz_id: str, user: Dict[str, Any], submission: QuizAttemptSubmission) -> Dict[str, Any]:
        quiz = self.store.get_quiz(quiz_id, user.get("uid"))
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        percentage = round((submission.score / submission.total_questions) * 100, 2) if submission.total_questions else 0.0
        record = {
            "id": str(uuid4()),
            "quiz_id": quiz_id,
            "uid": user.get("uid"),
            "score": submission.score,
            "total_questions": submission.total_questions,
            "percentage": percentage,
            "answers": submission.answers,
            "completed_in_seconds": submission.completed_in_seconds,
            "created_at": datetime.utcnow().isoformat(),
        }
        self.store.add_quiz_attempt(record)
        return {"attempt": record}

    def stats(self, user_id: str) -> Dict[str, Any]:
        attempts = self.store.list_quiz_attempts(user_id)
        completed = len({attempt["quiz_id"] for attempt in attempts})
        avg_score = round(sum(attempt["percentage"] for attempt in attempts) / len(attempts), 2) if attempts else 0.0
        return {
            "total_quizzes_completed": completed,
            "average_score": avg_score,
            "total_attempts": len(attempts),
        }

    @staticmethod
    def _parse_quiz_json(raw_response: str) -> Dict[str, Any]:
        try:
            cleaned = raw_response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.strip("`")
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=502, detail="Gemini returned invalid quiz JSON") from exc

    @staticmethod
    def _normalize_questions(questions: List[Dict[str, Any]], expected_count: int) -> List[Dict[str, Any]]:
        normalized: List[Dict[str, Any]] = []
        for question in questions[:expected_count]:
            item = QuizQuestion(**question)
            normalized.append(item.model_dump())

        if len(normalized) < expected_count:
            raise HTTPException(status_code=502, detail="Gemini returned fewer quiz questions than requested")
        return normalized

    @staticmethod
    def _source_file_ids(chunks: List[Any]) -> List[str]:
        file_ids = []
        seen = set()
        for chunk in chunks:
            file_id = getattr(chunk, "file_id", None)
            if file_id and file_id not in seen:
                file_ids.append(file_id)
                seen.add(file_id)
        return file_ids
