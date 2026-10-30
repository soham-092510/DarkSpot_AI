from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.all_models import (
    User, Project, Dimension, Claim, Finding, Source
)
from backend.app.schemas.all_schemas import (
    DimensionOut, ClaimOut, FindingOut
)

router = APIRouter(prefix="/projects/{project_id}", tags=["Evidence & Findings"])


@router.get("/dimensions", response_model=List[DimensionOut])
def get_project_dimensions(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    dims = db.query(Dimension).filter(Dimension.project_id == project_id).order_by(Dimension.order_index.asc()).all()
    results = []
    for d in dims:
        claims_count = db.query(func.count(Claim.id)).filter(Claim.dimension_id == d.id).scalar() or 0
        results.append({
            "id": d.id,
            "project_id": d.project_id,
            "name": d.name,
            "category": d.category,
            "importance_weight": d.importance_weight,
            "coverage_status": d.coverage_status,
            "explanation": d.explanation,
            "order_index": d.order_index,
            "claims_count": claims_count,
        })
    return results


@router.get("/claims", response_model=List[ClaimOut])
def get_project_claims(
    project_id: str,
    dimension_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Claim, Source).join(Source, Claim.source_id == Source.id).filter(Claim.project_id == project_id)
    if dimension_id:
        query = query.filter(Claim.dimension_id == dimension_id)

    records = query.all()
    results = []
    for claim, source in records:
        results.append({
            "id": claim.id,
            "project_id": claim.project_id,
            "source_id": claim.source_id,
            "dimension_id": claim.dimension_id,
            "subject": claim.subject,
            "predicate": claim.predicate,
            "value": claim.value,
            "conditions": claim.conditions,
            "applicable_date_cycle": claim.applicable_date_cycle,
            "exact_excerpt": claim.exact_excerpt,
            "confidence": claim.confidence,
            "source_title": source.title,
            "source_url": source.url,
        })
    return results


@router.get("/findings", response_model=List[FindingOut])
def get_project_findings(
    project_id: str,
    finding_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Finding).filter(Finding.project_id == project_id)
    if finding_type:
        query = query.filter(Finding.finding_type == finding_type.upper())

    findings = query.order_by(Finding.created_at.desc()).all()
    results = []

    # Pre-fetch sources map for titles and URLs
    sources = db.query(Source).filter(Source.project_id == project_id).all()
    src_map = {s.id: s for s in sources}

    for f in findings:
        s_a = src_map.get(f.source_a_id) if f.source_a_id else None
        s_b = src_map.get(f.source_b_id) if f.source_b_id else None

        results.append({
            "id": f.id,
            "project_id": f.project_id,
            "dimension_id": f.dimension_id,
            "finding_type": f.finding_type,
            "title": f.title,
            "severity": f.severity,
            "explanation": f.explanation,
            "why_it_matters": f.why_it_matters,
            "recommended_action": f.recommended_action,
            "source_a_id": f.source_a_id,
            "source_b_id": f.source_b_id,
            "source_a_title": s_a.title if s_a else None,
            "source_b_title": s_b.title if s_b else None,
            "source_a_url": s_a.url if s_a else None,
            "source_b_url": s_b.url if s_b else None,
            "claim_a_excerpt": f.claim_a_excerpt,
            "claim_b_excerpt": f.claim_b_excerpt,
            "confidence": f.confidence,
            "created_at": f.created_at,
        })
    return results


@router.get("/conflicts", response_model=List[FindingOut])
def get_project_conflicts(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_project_findings(project_id, finding_type="CONFLICT", current_user=current_user, db=db)


@router.get("/gaps", response_model=List[FindingOut])
def get_project_gaps(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_project_findings(project_id, finding_type="GAP", current_user=current_user, db=db)
