from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ..dependencies import get_rag_service
from ..schemas.rag import ChatResponse, HistoryResponse
from ..services.rag_service import RAGService
from .secure import get_current_user

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    context: str | None = None


@router.get("/history")
async def history(user=Depends(get_current_user), rag_service: RAGService = Depends(get_rag_service)):
    return HistoryResponse(items=rag_service.history(user.get("uid")))


@router.post("/chat")
async def chat(payload: ChatRequest, user=Depends(get_current_user), rag_service: RAGService = Depends(get_rag_service)):
    result = rag_service.ask(user=user, question=payload.message)
    return ChatResponse(answer=result["answer"], reply=result["reply"], sources=result["sources"], item=result["record"])
