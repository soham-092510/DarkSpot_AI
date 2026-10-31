from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user, get_optional_user, DEMO_PROJECT_ID, PUBLIC_PROJECT_IDS
from backend.app.models.all_models import User, Project, Task
from backend.app.schemas.all_schemas import TaskOut, TaskUpdate

router = APIRouter(tags=["Verification Tasks"])


@router.get("/projects/{project_id}/checklist", response_model=List[TaskOut])
def get_project_checklist(
    project_id: str,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    if project_id not in PUBLIC_PROJECT_IDS:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required.")
        project = db.query(Project).filter(Project.id == project_id, Project.user_id == user.id).first()
    else:
        project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    # Sort: CRITICAL -> HIGH -> MEDIUM -> LOW
    priority_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    tasks.sort(key=lambda t: priority_order.get(t.priority, 99))
    return tasks


@router.patch("/tasks/{task_id}", response_model=TaskOut)
def update_verification_task(
    task_id: str,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    project = db.query(Project).filter(
        Project.id == task.project_id,
        (Project.user_id == current_user.id) | (Project.id == DEMO_PROJECT_ID)
    ).first()
    if not project:
        raise HTTPException(status_code=403, detail="Access denied to this task.")

    if payload.status is not None:
        new_status = payload.status.upper()
        if new_status in ["PENDING", "IN_PROGRESS", "COMPLETED"]:
            task.status = new_status
            if new_status == "COMPLETED":
                task.completed_at = datetime.now(timezone.utc)
            else:
                task.completed_at = None

    if payload.notes is not None:
        task.notes = payload.notes

    db.commit()
    db.refresh(task)
    return task
