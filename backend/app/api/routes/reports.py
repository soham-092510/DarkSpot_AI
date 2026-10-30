from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.all_models import User, Project, Report
from backend.app.schemas.all_schemas import ReportOut

router = APIRouter(tags=["Reports"])


@router.get("/projects/{project_id}/report", response_model=ReportOut)
def get_project_report(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    report = db.query(Report).filter(Report.project_id == project_id).order_by(Report.created_at.desc()).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not yet generated for this project.")

    return report
