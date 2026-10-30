from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user, get_optional_user, DEMO_PROJECT_ID
from backend.app.models.all_models import User, Project, Report
from backend.app.schemas.all_schemas import ReportOut

router = APIRouter(tags=["Reports"])


@router.get("/projects/{project_id}/report", response_model=ReportOut)
def get_project_report(
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
        raise HTTPException(status_code=404, detail="Project not found.")

    report = db.query(Report).filter(Report.project_id == project_id).order_by(Report.created_at.desc()).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not yet generated for this project.")

    return report
