import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.all_models import (
    User, Project, Source, Dimension, Claim, Finding, Task, Report
)
from backend.app.api.deps import DEFAULT_DEMO_USER_ID, get_current_user
from backend.app.services.ai.demo_data import (
    DEMO_PROJECT, DEMO_SOURCES, DEMO_DIMENSIONS, DEMO_CLAIMS, DEMO_FINDINGS, DEMO_TASKS
)
from backend.app.services.ai.report_generator import generate_research_dossier_report

router = APIRouter(prefix="/demo", tags=["Demonstration Showcase"])

DEMO_PROJECT_ID = "00000000-0000-0000-0000-000000000099"


@router.get("")
def get_or_initialize_demo_project(db: Session = Depends(get_db)):
    """
    Returns the pre-seeded sample research project:
    ABC Scholarship 2026.
    Ensures pre-seeded, high-fidelity sample data is available for instant product demonstration.
    """
    # Ensure demo user exists
    user = db.query(User).filter(User.id == DEFAULT_DEMO_USER_ID).first()
    if not user:
        user = User(
            id=DEFAULT_DEMO_USER_ID,
            email="researcher@darkspot.ai",
            full_name="Lead Intelligence Researcher",
            hashed_password="demo_hashed_secret",
            is_active=True
        )
        db.add(user)
        db.commit()

    project = db.query(Project).filter(Project.id == DEMO_PROJECT_ID).first()
    if not project:
        # Seed demo project
        project = Project(
            id=DEMO_PROJECT_ID,
            user_id=DEFAULT_DEMO_USER_ID,
            title=DEMO_PROJECT["title"],
            topic_question=DEMO_PROJECT["topic_question"],
            depth=DEMO_PROJECT["depth"],
            status="completed",
            coverage_score=DEMO_PROJECT["coverage_score"],
        )
        db.add(project)
        db.commit()

        # Seed sources
        source_objs = []
        for s_data in DEMO_SOURCES:
            src = Source(
                project_id=DEMO_PROJECT_ID,
                url=s_data["url"],
                source_type=s_data["source_type"],
                title=s_data["title"],
                publisher_domain=s_data["publisher_domain"],
                publication_date=s_data["publication_date"],
                clean_text=s_data["clean_text"],
                status=s_data["status"],
            )
            db.add(src)
            source_objs.append(src)
        db.commit()

        # Seed dimensions
        dim_objs = {}
        for d_data in DEMO_DIMENSIONS:
            dim = Dimension(
                project_id=DEMO_PROJECT_ID,
                name=d_data["name"],
                category=d_data["category"],
                importance_weight=d_data["importance_weight"],
                coverage_status=d_data["coverage_status"],
                explanation=d_data["explanation"],
                order_index=d_data["order_index"],
            )
            db.add(dim)
            db.commit()
            db.refresh(dim)
            dim_objs[d_data["name"]] = dim

        # Seed claims
        for c_data in DEMO_CLAIMS:
            src_idx = c_data["source_index"]
            source_id = source_objs[src_idx].id if src_idx < len(source_objs) else source_objs[0].id
            dim_id = dim_objs.get(c_data["dimension_name"]).id if c_data["dimension_name"] in dim_objs else None

            claim = Claim(
                project_id=DEMO_PROJECT_ID,
                source_id=source_id,
                dimension_id=dim_id,
                subject=c_data["subject"],
                predicate=c_data["predicate"],
                value=c_data["value"],
                conditions=c_data.get("conditions"),
                applicable_date_cycle=c_data.get("applicable_date_cycle"),
                exact_excerpt=c_data["exact_excerpt"],
                confidence=c_data["confidence"],
            )
            db.add(claim)
        db.commit()

        # Seed findings
        for f_data in DEMO_FINDINGS:
            dim_id = dim_objs.get(f_data.get("dimension_name")).id if f_data.get("dimension_name") in dim_objs else None
            s_a_idx = f_data.get("source_a_index")
            s_b_idx = f_data.get("source_b_index")
            s_a_id = source_objs[s_a_idx].id if s_a_idx is not None and s_a_idx < len(source_objs) else None
            s_b_id = source_objs[s_b_idx].id if s_b_idx is not None and s_b_idx < len(source_objs) else None

            finding = Finding(
                project_id=DEMO_PROJECT_ID,
                dimension_id=dim_id,
                finding_type=f_data["finding_type"],
                title=f_data["title"],
                severity=f_data["severity"],
                explanation=f_data["explanation"],
                why_it_matters=f_data["why_it_matters"],
                recommended_action=f_data["recommended_action"],
                source_a_id=s_a_id,
                source_b_id=s_b_id,
                claim_a_excerpt=f_data.get("claim_a_excerpt"),
                claim_b_excerpt=f_data.get("claim_b_excerpt"),
                confidence=f_data["confidence"],
            )
            db.add(finding)
        db.commit()

        # Seed tasks
        for t_data in DEMO_TASKS:
            task = Task(
                project_id=DEMO_PROJECT_ID,
                title=t_data["title"],
                action_required=t_data["action_required"],
                rationale=t_data["rationale"],
                recommended_source=t_data["recommended_source"],
                priority=t_data["priority"],
                status=t_data["status"],
            )
            db.add(task)
        db.commit()

        # Seed report
        report_data = generate_research_dossier_report(
            project={"title": project.title, "topic_question": project.topic_question},
            sources=[{"title": s["title"], "publisher_domain": s["publisher_domain"], "publication_date": s["publication_date"], "url": s["url"]} for s in DEMO_SOURCES],
            dimensions=DEMO_DIMENSIONS,
            claims=DEMO_CLAIMS,
            findings=DEMO_FINDINGS,
            tasks=DEMO_TASKS,
            coverage_score=DEMO_PROJECT["coverage_score"],
        )
        report = Report(
            project_id=DEMO_PROJECT_ID,
            title=report_data["title"],
            executive_summary=report_data["executive_summary"],
            coverage_summary_json=report_data["coverage_summary_json"],
            full_markdown=report_data["full_markdown"],
        )
        db.add(report)
        db.commit()

    return {
        "id": project.id,
        "title": project.title,
        "topic_question": project.topic_question,
        "depth": project.depth,
        "status": project.status,
        "coverage_score": project.coverage_score,
        "is_sample_demo": True,
        "notice": "DarkSpot AI Interactive Sample Dataset (ABC Scholarship 2026). Clearly labeled illustrative demonstration data."
    }
