from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from ..dependencies import get_rag_service
from ..schemas.rag import UploadResponse
from ..services.rag_service import RAGService
from .secure import get_current_user

router = APIRouter()


@router.get("/files")
async def list_files(user=Depends(get_current_user), rag_service: RAGService = Depends(get_rag_service)):
    return {"items": rag_service.list_uploads(user.get("uid"))}


@router.get("/file/{upload_id}")
async def get_file(upload_id: str, user=Depends(get_current_user), rag_service: RAGService = Depends(get_rag_service)):
    upload = rag_service.store.get_upload(upload_id, user.get("uid"))
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")

    stored_path = Path(upload["stored_path"])
    if not stored_path.exists():
        raise HTTPException(status_code=404, detail="Stored file not found")

    return FileResponse(path=str(stored_path), filename=upload.get("filename") or stored_path.name, media_type="application/pdf")


@router.post("/pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    category: str = Form("notes"),
    title: str = Form(...),
    user=Depends(get_current_user),
    rag_service: RAGService = Depends(get_rag_service),
):
    result = await rag_service.index_pdf(user=user, file=file, title=title, category=category)
    return UploadResponse(message="PDF uploaded and indexed", item=result["record"], chunk_count=result["chunk_count"])
