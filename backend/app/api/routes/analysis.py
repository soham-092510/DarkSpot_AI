import threading
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user, get_optional_user, DEMO_PROJECT_ID, PUBLIC_PROJECT_IDS
from backend.app.models.all_models import User, Project, Job
from backend.app.schemas.all_schemas import JobOut
from backend.app.workers.analysis_worker import process_analysis_job

router = APIRouter(tags=["Analysis & Jobs"])


@router.post("/projects/{project_id}/analyze", response_model=JobOut)
def trigger_project_analysis(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    # Create job in QUEUED state
    job = Job(
        project_id=project.id,
        status="QUEUED",
        stage="QUEUED",
        progress_pct=0
    )
    project.status = "queued"
    db.add(job)
    db.commit()
    db.refresh(job)

    # Launch worker in background thread
    t = threading.Thread(target=process_analysis_job, args=(job.id,), daemon=True)
    t.start()

    return job


@router.get("/jobs/{job_id}", response_model=JobOut)
def get_job_status(
    job_id: str,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    if job.project_id not in PUBLIC_PROJECT_IDS:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required.")
        project = db.query(Project).filter(Project.id == job.project_id, Project.user_id == user.id).first()
    else:
        project = db.query(Project).filter(Project.id == job.project_id).first()

    if not project:
        raise HTTPException(status_code=403, detail="Access denied to this job.")

    return job


@router.post("/jobs/{job_id}/cancel", response_model=JobOut)
def cancel_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    project = db.query(Project).filter(Project.id == job.project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=403, detail="Access denied to this job.")

    job.status = "CANCELLED"
    job.stage = "CANCELLED"
    db.commit()
    db.refresh(job)
    return job
