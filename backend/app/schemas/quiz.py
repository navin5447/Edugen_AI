from datetime import datetime
from typing import List, Literal

from pydantic import BaseModel, Field


DifficultyLevel = Literal["easy", "medium", "hard"]


class QuizGenerationRequest(BaseModel):
    difficulty: DifficultyLevel = "medium"
    question_count: int = Field(default=10, ge=1, le=20)
    concept: str | None = None
    file_id: str | None = None


class QuizQuestion(BaseModel):
    question: str
    options: List[str] = Field(min_length=4, max_length=4)
    correct_answer: str
    explanation: str


class GeneratedQuiz(BaseModel):
    id: str
    uid: str
    difficulty: DifficultyLevel
    question_count: int
    title: str
    source_file_ids: List[str]
    questions: List[QuizQuestion]
    created_at: datetime


class QuizAttemptSubmission(BaseModel):
    score: int = Field(ge=0)
    total_questions: int = Field(ge=1)
    answers: List[str] = Field(default_factory=list)
    completed_in_seconds: int | None = Field(default=None, ge=0)


class QuizAttemptRecord(BaseModel):
    id: str
    quiz_id: str
    uid: str
    score: int
    total_questions: int
    percentage: float
    answers: List[str]
    completed_in_seconds: int | None = None
    created_at: datetime


class QuizHistoryResponse(BaseModel):
    items: List[GeneratedQuiz]


class QuizDetailResponse(GeneratedQuiz):
    attempts: List[QuizAttemptRecord] = Field(default_factory=list)


class QuizGenerationResponse(BaseModel):
    quiz: GeneratedQuiz


class QuizAttemptResponse(BaseModel):
    attempt: QuizAttemptRecord


class QuizStatsResponse(BaseModel):
    total_quizzes_completed: int
    average_score: float
    total_attempts: int
