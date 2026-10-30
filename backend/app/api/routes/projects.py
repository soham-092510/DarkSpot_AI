import threading
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user, get_optional_user, DEMO_PROJECT_ID
from backend.app.models.all_models import (
    User, Project, Source, Dimension, Claim, Finding, Task, Job, Report
)
from backend.app.schemas.all_schemas import ProjectCreate, ProjectOut
from backend.app.workers.analysis_worker import process_analysis_job

router = APIRouter(prefix="/projects", tags=["Research Projects"])


def _format_project_out(p: Project, db: Session) -> dict:
    sources_count = db.query(func.count(Source.id)).filter(Source.project_id == p.id).scalar() or 0
    gaps_count = db.query(func.count(Finding.id)).filter(Finding.project_id == p.id, Finding.finding_type == "GAP").scalar() or 0
    conflicts_count = db.query(func.count(Finding.id)).filter(Finding.project_id == p.id, Finding.finding_type == "CONFLICT").scalar() or 0
    tasks_count = db.query(func.count(Task.id)).filter(Task.project_id == p.id).scalar() or 0
    completed_tasks_count = db.query(func.count(Task.id)).filter(Task.project_id == p.id, Task.status == "COMPLETED").scalar() or 0

    return {
        "id": p.id,
        "user_id": p.user_id,
        "title": p.title,
        "topic_question": p.topic_question,
        "depth": p.depth,
        "status": p.status,
        "coverage_score": p.coverage_score,
        "created_at": p.created_at,
        "updated_at": p.updated_at,
        "sources_count": sources_count,
        "gaps_count": gaps_count,
        "conflicts_count": conflicts_count,
        "tasks_count": tasks_count,
        "completed_tasks_count": completed_tasks_count,
    }


@router.get("", response_model=List[ProjectOut])
def list_user_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).all()
    return [_format_project_out(p, db) for p in projects]


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_research_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = Project(
        user_id=current_user.id,
        title=payload.title,
        topic_question=payload.topic_question,
        depth=payload.depth,
        status="queued",
        coverage_score=0.0
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Ingest any URLs provided at creation time
    if payload.urls:
        for u in payload.urls:
            u_clean = u.strip()
            if u_clean:
                source = Source(
                    project_id=project.id,
                    url=u_clean,
                    source_type="webpage",
                    title=u_clean,
                    status="pending"
                )
                db.add(source)
        db.commit()

    # Create background analysis job
    job = Job(
        project_id=project.id,
        status="QUEUED",
        stage="QUEUED",
        progress_pct=0
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Launch asynchronous processing in thread (ensures local dev without separate worker process works out-of-the-box!)
    thread = threading.Thread(target=process_analysis_job, args=(job.id,), daemon=True)
    thread.start()

    return _format_project_out(project, db)


@router.get("/{project_id}", response_model=ProjectOut)
def get_project_details(
    project_id: str,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    if project_id != DEMO_PROJECT_ID:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required.")
        project = db.query(Project).filter(Project.id == project_id, Project.user_id == user.id).first()
    else:
        project = db.query(Project).filter(Project.id == DEMO_PROJECT_ID).first()

    if not project:
        raise HTTPException(status_code=404, detail="Research project not found.")
    return _format_project_out(project, db)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_research_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Research project not found.")
    db.delete(project)
    db.commit()
    return None
