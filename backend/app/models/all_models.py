import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Float, Integer, Boolean, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    topic_question = Column(Text, nullable=False)
    depth = Column(String(32), default="standard")  # standard, deep
    status = Column(String(32), default="draft")  # draft, queued, analyzing, completed, failed
    coverage_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="projects")
    sources = relationship("Source", back_populates="project", cascade="all, delete-orphan")
    dimensions = relationship("Dimension", back_populates="project", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="project", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="project", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="project", cascade="all, delete-orphan")


class Source(Base):
    __tablename__ = "sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(Text, nullable=True)
    source_type = Column(String(32), default="webpage")  # webpage, pdf, docx, txt
    title = Column(String(500), nullable=False)
    publisher_domain = Column(String(255), nullable=True)
    publication_date = Column(String(100), nullable=True)  # extracted or null
    retrieval_date = Column(DateTime, default=utc_now)
    raw_text = Column(Text, nullable=True)
    clean_text = Column(Text, nullable=True)
    status = Column(String(32), default="pending")  # pending, extracted, failed
    error_message = Column(Text, nullable=True)
    content_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    project = relationship("Project", back_populates="sources")
    claims = relationship("Claim", back_populates="source", cascade="all, delete-orphan")


class Dimension(Base):
    __tablename__ = "dimensions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    importance_weight = Column(Float, default=1.0)
    coverage_status = Column(String(64), default="NOT_FOUND")  # SUPPORTED, PARTIALLY_SUPPORTED, NOT_FOUND, CONFLICTING, NEEDS_VERIFICATION
    explanation = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)

    project = relationship("Project", back_populates="dimensions")
    claims = relationship("Claim", back_populates="dimension")
    findings = relationship("Finding", back_populates="dimension")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id = Column(String(36), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True)
    dimension_id = Column(String(36), ForeignKey("dimensions.id", ondelete="SET NULL"), nullable=True, index=True)
    subject = Column(String(255), nullable=False)
    predicate = Column(String(255), nullable=False)
    value = Column(Text, nullable=False)
    conditions = Column(Text, nullable=True)
    applicable_date_cycle = Column(String(100), nullable=True)
    exact_excerpt = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=utc_now)

    project = relationship("Project", back_populates="claims")
    source = relationship("Source", back_populates="claims")
    dimension = relationship("Dimension", back_populates="claims")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    dimension_id = Column(String(36), ForeignKey("dimensions.id", ondelete="SET NULL"), nullable=True, index=True)
    finding_type = Column(String(64), nullable=False)  # GAP, CONFLICT, OUTDATED, UNANSWERED_QUESTION
    title = Column(String(255), nullable=False)
    severity = Column(String(32), default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW
    explanation = Column(Text, nullable=False)
    why_it_matters = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)

    source_a_id = Column(String(36), ForeignKey("sources.id", ondelete="SET NULL"), nullable=True)
    source_b_id = Column(String(36), ForeignKey("sources.id", ondelete="SET NULL"), nullable=True)
    claim_a_id = Column(String(36), ForeignKey("claims.id", ondelete="SET NULL"), nullable=True)
    claim_b_id = Column(String(36), ForeignKey("claims.id", ondelete="SET NULL"), nullable=True)
    claim_a_excerpt = Column(Text, nullable=True)
    claim_b_excerpt = Column(Text, nullable=True)

    confidence = Column(Float, default=0.9)
    created_at = Column(DateTime, default=utc_now)

    project = relationship("Project", back_populates="findings")
    dimension = relationship("Dimension", back_populates="findings")
    tasks = relationship("Task", back_populates="finding")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    finding_id = Column(String(36), ForeignKey("findings.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    action_required = Column(Text, nullable=False)
    rationale = Column(Text, nullable=False)
    recommended_source = Column(String(255), nullable=True)
    priority = Column(String(32), default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(32), default="PENDING")  # PENDING, IN_PROGRESS, COMPLETED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="tasks")
    finding = relationship("Finding", back_populates="tasks")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(32), default="QUEUED")  # QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED
    stage = Column(String(100), default="QUEUED")
    progress_pct = Column(Integer, default=0)
    error_details = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    heartbeat_at = Column(DateTime, default=utc_now)

    project = relationship("Project", back_populates="jobs")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    executive_summary = Column(Text, nullable=False)
    coverage_summary_json = Column(Text, nullable=False)
    full_markdown = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    project = relationship("Project", back_populates="reports")
