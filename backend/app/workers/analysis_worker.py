import time
import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal
from backend.app.models.all_models import (
    Project, Source, Dimension, Claim, Finding, Task, Job, Report
)
from backend.app.services.ai.decomposer import decompose_question
from backend.app.services.ingestion.url_extractor import extract_content_from_url
from backend.app.services.ingestion.tavily_search import search_web_sources
from backend.app.services.ai.claim_extractor import extract_claims_from_source
from backend.app.services.ai.gap_detector import calculate_evidence_coverage, detect_gaps_and_blindspots
from backend.app.services.ai.conflict_detector import detect_cross_source_conflicts
from backend.app.services.ai.freshness_analyzer import analyze_temporal_freshness
from backend.app.services.ai.verification_planner import generate_verification_checklist
from backend.app.services.ai.report_generator import generate_research_dossier_report

logger = logging.getLogger(__name__)


def process_analysis_job(job_id: str):
    """
    Executes the 10-stage end-to-end evidence analysis pipeline for a specific job.
    Updates progress percentages and handles failures cleanly without losing state.
    """
    db: Session = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job or job.status != "QUEUED":
            return

        project = db.query(Project).filter(Project.id == job.project_id).first()
        if not project:
            job.status = "FAILED"
            job.error_details = "Associated research project not found"
            db.commit()
            return

        # 1. Start Job
        job.status = "RUNNING"
        job.stage = "DECOMPOSING_RESEARCH_QUESTION"
        job.progress_pct = 10
        job.started_at = datetime.now(timezone.utc)
        job.heartbeat_at = datetime.now(timezone.utc)
        project.status = "analyzing"
        db.commit()

        # 2. Decompose Question into Research Dimensions
        decomposition = decompose_question(project.topic_question)
        raw_dims = decomposition.get("dimensions", [])
        search_queries = decomposition.get("search_queries", [])

        # Persist Dimensions
        dimensions_list = []
        for idx, d_data in enumerate(raw_dims, 1):
            dim = Dimension(
                project_id=project.id,
                name=d_data.get("name", f"Dimension {idx}"),
                category=d_data.get("category", "General"),
                importance_weight=float(d_data.get("importance_weight", 1.0)),
                coverage_status="NOT_FOUND",
                explanation=d_data.get("description", ""),
                order_index=idx
            )
            db.add(dim)
            dimensions_list.append(dim)
        db.commit()
        for dim in dimensions_list:
            db.refresh(dim)

        job.stage = "COLLECTING_AND_EXTRACTING_SOURCES"
        job.progress_pct = 25
        job.heartbeat_at = datetime.now(timezone.utc)
        db.commit()

        # 3. Source Discovery & Ingestion
        # If no sources currently attached, run web discovery via Tavily queries
        existing_sources = db.query(Source).filter(Source.project_id == project.id).all()
        if not existing_sources and search_queries:
            for query in search_queries[:2]:
                web_hits = search_web_sources(query, max_results=3)
                for hit in web_hits:
                    # Avoid duplicate URLs
                    url = hit.get("url")
                    if url and not any(s.url == url for s in existing_sources):
                        new_source = Source(
                            project_id=project.id,
                            url=url,
                            source_type="webpage",
                            title=hit.get("title", "Discovered Webpage"),
                            status="pending"
                        )
                        db.add(new_source)
                        existing_sources.append(new_source)
            db.commit()

        # Extract content for pending sources
        sources_map = {}
        for src in existing_sources:
            if src.status == "pending" and src.url:
                ext_res = extract_content_from_url(src.url)
                src.title = ext_res.get("title") or src.title
                src.clean_text = ext_res.get("clean_text")
                src.raw_text = ext_res.get("raw_text")
                src.publisher_domain = ext_res.get("publisher_domain")
                src.publication_date = ext_res.get("publication_date")
                src.status = ext_res.get("status", "failed")
                src.error_message = ext_res.get("error")
                src.content_hash = ext_res.get("content_hash")
                db.commit()

            sources_map[src.id] = {
                "id": src.id,
                "title": src.title,
                "url": src.url,
                "clean_text": src.clean_text or "",
                "publisher_domain": src.publisher_domain,
                "publication_date": src.publication_date,
            }

        job.stage = "EXTRACTING_ATOMIC_CLAIMS"
        job.progress_pct = 50
        job.heartbeat_at = datetime.now(timezone.utc)
        db.commit()

        # 4. Atomic Claim Extraction
        dim_dicts = [{"id": d.id, "name": d.name, "category": d.category, "description": d.explanation} for d in dimensions_list]
        dim_lookup = {d.name.lower(): d.id for d in dimensions_list}

        all_claims = []
        for src in existing_sources:
            if src.status == "extracted" and src.clean_text:
                extracted = extract_claims_from_source(src.title, src.clean_text, dim_dicts)
                for c_data in extracted:
                    # Match to dimension ID
                    d_name = c_data.get("dimension_name", "")
                    matching_d_id = dim_lookup.get(d_name.lower())

                    claim_obj = Claim(
                        project_id=project.id,
                        source_id=src.id,
                        dimension_id=matching_d_id,
                        subject=c_data.get("subject", "Claim"),
                        predicate=c_data.get("predicate", "states"),
                        value=c_data.get("value", ""),
                        conditions=c_data.get("conditions"),
                        applicable_date_cycle=c_data.get("applicable_date_cycle"),
                        exact_excerpt=c_data.get("exact_excerpt", ""),
                        confidence=float(c_data.get("confidence", 1.0))
                    )
                    db.add(claim_obj)
                    all_claims.append({
                        **c_data,
                        "source_id": src.id,
                        "dimension_id": matching_d_id
                    })
        db.commit()

        job.stage = "DETECTING_GAPS_AND_CALCULATING_COVERAGE"
        job.progress_pct = 70
        job.heartbeat_at = datetime.now(timezone.utc)
        db.commit()

        # 5. Gap Detection & Coverage Calculation
        updated_dims, gap_findings = detect_gaps_and_blindspots(
            project.topic_question,
            [{"name": d.name, "category": d.category, "importance_weight": d.importance_weight} for d in dimensions_list],
            all_claims
        )

        # Update dimension status in DB
        dim_status_map = {d["name"]: d for d in updated_dims}
        for d in dimensions_list:
            if d.name in dim_status_map:
                u_info = dim_status_map[d.name]
                d.coverage_status = u_info.get("coverage_status", "NOT_FOUND")
                d.explanation = u_info.get("explanation", "")
        db.commit()

        # 6. Contradiction Intelligence & Freshness Warnings
        job.stage = "ANALYZING_CONTRADICTIONS_AND_FRESHNESS"
        job.progress_pct = 85
        job.heartbeat_at = datetime.now(timezone.utc)
        db.commit()

        # Check cross-source conflicts
        conflict_dims, conflict_findings = detect_cross_source_conflicts(
            [{"name": d.name, "coverage_status": d.coverage_status, "importance_weight": d.importance_weight} for d in dimensions_list],
            all_claims,
            sources_map
        )
        # Apply any newly conflicting dimension statuses
        for cd in conflict_dims:
            if cd.get("coverage_status") == "CONFLICTING":
                for d in dimensions_list:
                    if d.name == cd["name"]:
                        d.coverage_status = "CONFLICTING"
        db.commit()

        # Analyze freshness
        freshness_findings = analyze_temporal_freshness(list(sources_map.values()), current_year=2026)

        # Calculate final evidence coverage score
        dim_eval_list = [{"coverage_status": d.coverage_status, "importance_weight": d.importance_weight} for d in dimensions_list]
        final_coverage_score = calculate_evidence_coverage(dim_eval_list)
        project.coverage_score = final_coverage_score
        db.commit()

        # Persist all findings (Gaps, Conflicts, Outdated)
        all_findings_to_persist = gap_findings + conflict_findings + freshness_findings
        persisted_findings = []
        for f in all_findings_to_persist:
            dim_id = dim_lookup.get(f.get("dimension_name", "").lower())
            finding_obj = Finding(
                project_id=project.id,
                dimension_id=dim_id,
                finding_type=f.get("finding_type", "GAP"),
                title=f.get("title", "Finding"),
                severity=f.get("severity", "MEDIUM"),
                explanation=f.get("explanation", ""),
                why_it_matters=f.get("why_it_matters", ""),
                recommended_action=f.get("recommended_action", ""),
                source_a_id=f.get("source_a_id"),
                source_b_id=f.get("source_b_id"),
                claim_a_excerpt=f.get("claim_a_excerpt"),
                claim_b_excerpt=f.get("claim_b_excerpt"),
                confidence=float(f.get("confidence", 0.9))
            )
            db.add(finding_obj)
            persisted_findings.append(finding_obj)
        db.commit()

        # 7. Verification Checklist & Audit Report Generation
        job.stage = "GENERATING_VERIFICATION_CHECKLIST_AND_DOSSIER"
        job.progress_pct = 95
        job.heartbeat_at = datetime.now(timezone.utc)
        db.commit()

        findings_dicts = [{
            "id": f.id,
            "finding_type": f.finding_type,
            "title": f.title,
            "severity": f.severity,
            "explanation": f.explanation,
            "why_it_matters": f.why_it_matters,
            "recommended_action": f.recommended_action,
            "dimension_name": next((d.name for d in dimensions_list if d.id == f.dimension_id), None)
        } for f in persisted_findings]

        tasks_data = generate_verification_checklist(findings_dicts)
        persisted_tasks = []
        for t in tasks_data:
            task_obj = Task(
                project_id=project.id,
                finding_id=t.get("finding_id"),
                title=t.get("title", "Verification Action"),
                action_required=t.get("action_required", ""),
                rationale=t.get("rationale", ""),
                recommended_source=t.get("recommended_source"),
                priority=t.get("priority", "MEDIUM"),
                status="PENDING"
            )
            db.add(task_obj)
            persisted_tasks.append(task_obj)
        db.commit()

        # Generate Comprehensive Report
        report_data = generate_research_dossier_report(
            project={"title": project.title, "topic_question": project.topic_question},
            sources=list(sources_map.values()),
            dimensions=[{"name": d.name, "category": d.category, "importance_weight": d.importance_weight, "coverage_status": d.coverage_status, "explanation": d.explanation} for d in dimensions_list],
            claims=all_claims,
            findings=findings_dicts,
            tasks=tasks_data,
            coverage_score=final_coverage_score
        )

        report_obj = Report(
            project_id=project.id,
            title=report_data["title"],
            executive_summary=report_data["executive_summary"],
            coverage_summary_json=report_data["coverage_summary_json"],
            full_markdown=report_data["full_markdown"]
        )
        db.add(report_obj)

        # 8. Mark Job and Project Completed
        job.status = "COMPLETED"
        job.stage = "COMPLETED"
        job.progress_pct = 100
        job.completed_at = datetime.now(timezone.utc)
        project.status = "completed"
        db.commit()
        logger.info(f"Analysis job {job_id} successfully completed for project {project.id}")

    except Exception as e:
        logger.exception(f"Fatal error while processing analysis job {job_id}: {str(e)}")
        db.rollback()
        try:
            job = db.query(Job).filter(Job.id == job_id).first()
            if job:
                job.status = "FAILED"
                job.stage = "ERROR"
                job.error_details = str(e)
                job.completed_at = datetime.now(timezone.utc)

            project = db.query(Project).filter(Project.id == job.project_id).first() if job else None
            if project:
                project.status = "failed"
            db.commit()
        except Exception:
            pass
    finally:
        db.close()


def run_worker_loop():
    """
    Continuous background worker loop for standalone execution (e.g. Render background worker).
    Polls the database for QUEUED jobs and executes them.
    Recovers stale jobs if interrupted.
    """
    logger.info("DarkSpot AI Background Analysis Worker started. Polling for queued jobs...")
    while True:
        try:
            db = SessionLocal()
            # Find next queued job
            job = db.query(Job).filter(Job.status == "QUEUED").order_by(Job.started_at.asc()).first()
            job_id = job.id if job else None
            db.close()

            if job_id:
                logger.info(f"Claimed queued job: {job_id}. Processing...")
                process_analysis_job(job_id)
            else:
                time.sleep(2.0)
        except KeyboardInterrupt:
            logger.info("Worker stopped by user.")
            break
        except Exception as e:
            logger.error(f"Worker polling loop error: {str(e)}")
            time.sleep(3.0)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_worker_loop()
