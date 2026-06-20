from fastapi import APIRouter, Depends, HTTPException
from ..dependencies import get_concept_service
from ..services.concept_service import ConceptService
from .secure import get_current_user

router = APIRouter()


@router.get("/workspace")
async def get_workspace_graph(
    user=Depends(get_current_user),
    concept_service: ConceptService = Depends(get_concept_service)
):
    return concept_service.get_graph(user=user, file_id="workspace")


@router.get("/file/{file_id}")
async def get_file_graph(
    file_id: str,
    user=Depends(get_current_user),
    concept_service: ConceptService = Depends(get_concept_service)
):
    if not file_id:
        raise HTTPException(status_code=400, detail="file_id is required")
    return concept_service.get_graph(user=user, file_id=file_id)
