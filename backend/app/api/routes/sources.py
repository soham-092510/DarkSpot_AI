from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.core.security import is_safe_url
from backend.app.api.deps import get_current_user
from backend.app.models.all_models import User, Project, Source
from backend.app.schemas.all_schemas import SourceCreate, SourceOut
from backend.app.services.ingestion.doc_parser import parse_document

router = APIRouter(prefix="/projects/{project_id}/sources", tags=["Sources"])


@router.get("", response_model=List[SourceOut])
def list_project_sources(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    sources = db.query(Source).filter(Source.project_id == project_id).order_by(Source.created_at.desc()).all()
    results = []
    for s in sources:
        results.append({
            "id": s.id,
            "project_id": s.project_id,
            "url": s.url,
            "source_type": s.source_type,
            "title": s.title,
            "publisher_domain": s.publisher_domain,
            "publication_date": s.publication_date,
            "retrieval_date": s.retrieval_date,
            "status": s.status,
            "error_message": s.error_message,
            "content_preview": (s.clean_text[:250] + "...") if s.clean_text else None,
        })
    return results


@router.post("", response_model=SourceOut, status_code=status.HTTP_201_CREATED)
def add_url_source(
    project_id: str,
    payload: SourceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    if not payload.url:
        raise HTTPException(status_code=400, detail="URL must be provided.")

    is_safe, error_msg = is_safe_url(payload.url)
    if not is_safe:
        raise HTTPException(status_code=400, detail=f"SSRF Protection: {error_msg}")

    source = Source(
        project_id=project.id,
        url=payload.url.strip(),
        source_type="webpage",
        title=payload.title or payload.url.strip(),
        status="pending"
    )
    db.add(source)
    db.commit()
    db.refresh(source)

    return {
        "id": source.id,
        "project_id": source.project_id,
        "url": source.url,
        "source_type": source.source_type,
        "title": source.title,
        "publisher_domain": source.publisher_domain,
        "publication_date": source.publication_date,
        "retrieval_date": source.retrieval_date,
        "status": source.status,
        "error_message": source.error_message,
        "content_preview": None,
    }


@router.post("/upload", response_model=SourceOut, status_code=status.HTTP_201_CREATED)
async def upload_document_source(
    project_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    # Read bytes and check size limit (10MB)
    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Determine type
    filename = file.filename or "uploaded_document.txt"
    ext = filename.split(".")[-1].lower() if "." in filename else "txt"
    source_type = ext if ext in ["pdf", "docx", "txt"] else "txt"

    # Parse document
    parsed = parse_document(contents, filename)

    source = Source(
        project_id=project.id,
        url=None,
        source_type=source_type,
        title=filename,
        publisher_domain="Uploaded Document",
        clean_text=parsed.get("clean_text"),
        raw_text=None,
        status=parsed.get("status", "failed"),
        error_message=parsed.get("error"),
        content_hash=parsed.get("content_hash"),
    )
    db.add(source)
    db.commit()
    db.refresh(source)

    return {
        "id": source.id,
        "project_id": source.project_id,
        "url": source.url,
        "source_type": source.source_type,
        "title": source.title,
        "publisher_domain": source.publisher_domain,
        "publication_date": source.publication_date,
        "retrieval_date": source.retrieval_date,
        "status": source.status,
        "error_message": source.error_message,
        "content_preview": (source.clean_text[:250] + "...") if source.clean_text else None,
    }
