from fastapi import APIRouter, Depends, HTTPException

from ..dependencies import get_quiz_service
from ..schemas.quiz import (
    GeneratedQuiz,
    QuizAttemptResponse,
    QuizAttemptSubmission,
    QuizDetailResponse,
    QuizGenerationRequest,
    QuizGenerationResponse,
    QuizHistoryResponse,
    QuizStatsResponse,
)
from ..services.quiz_service import QuizService
from .secure import get_current_user

router = APIRouter()


@router.post("/generate", response_model=QuizGenerationResponse)
async def generate_quiz(payload: QuizGenerationRequest, user=Depends(get_current_user), quiz_service: QuizService = Depends(get_quiz_service)):
    return QuizGenerationResponse(**quiz_service.generate_quiz(user=user, payload=payload))


@router.get("/history", response_model=QuizHistoryResponse)
async def history(user=Depends(get_current_user), quiz_service: QuizService = Depends(get_quiz_service)):
    return QuizHistoryResponse(items=quiz_service.list_quizzes(user.get("uid")))


@router.get("/stats", response_model=QuizStatsResponse)
async def stats(user=Depends(get_current_user), quiz_service: QuizService = Depends(get_quiz_service)):
    return QuizStatsResponse(**quiz_service.stats(user.get("uid")))


@router.get("/{quiz_id}", response_model=QuizDetailResponse)
async def get_quiz(quiz_id: str, user=Depends(get_current_user), quiz_service: QuizService = Depends(get_quiz_service)):
    quiz = quiz_service.get_quiz(quiz_id, user.get("uid"))
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return QuizDetailResponse(**quiz)


@router.post("/{quiz_id}/attempt", response_model=QuizAttemptResponse)
async def save_attempt(quiz_id: str, submission: QuizAttemptSubmission, user=Depends(get_current_user), quiz_service: QuizService = Depends(get_quiz_service)):
    return QuizAttemptResponse(**quiz_service.save_attempt(quiz_id, user=user, submission=submission))
