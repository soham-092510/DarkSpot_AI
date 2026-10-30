from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ==============================================================================
# Authentication Schemas
# ==============================================================================

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128, description="Password must be at least 12 characters long")
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    is_active: bool
    is_verified: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=12, max_length=128, description="Password must be at least 12 characters long")


class EmailVerificationRequest(BaseModel):
    token: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=12, max_length=128, description="Password must be at least 12 characters long")


class UserUpdateProfile(BaseModel):
    full_name: Optional[str] = None


# ==============================================================================
# BYOK (Bring Your Own Key) Schemas
# ==============================================================================

class ApiCredentialCreate(BaseModel):
    provider: str = Field(pattern="^(gemini|tavily)$")
    api_key: str = Field(min_length=8, max_length=256)


class ApiCredentialOut(BaseModel):
    id: str
    provider: str
    key_mask: str
    status: str
    last_validated_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApiCredentialTestRequest(BaseModel):
    provider: str = Field(pattern="^(gemini|tavily)$")
    api_key: str = Field(min_length=8, max_length=256)


class ApiCredentialTestResponse(BaseModel):
    valid: bool
    provider: str
    message: str


# ==============================================================================
# Source Schemas
# ==============================================================================

class SourceCreate(BaseModel):
    url: Optional[str] = None
    title: Optional[str] = None
    source_type: str = "webpage"  # webpage, pdf, docx, txt
    raw_text: Optional[str] = None


class SourceOut(BaseModel):
    id: str
    project_id: str
    url: Optional[str]
    source_type: str
    title: str
    publisher_domain: Optional[str]
    publication_date: Optional[str]
    retrieval_date: datetime
    status: str
    error_message: Optional[str]
    content_preview: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# Dimension & Claim Schemas
# ==============================================================================

class DimensionOut(BaseModel):
    id: str
    project_id: str
    name: str
    category: Optional[str]
    importance_weight: float
    coverage_status: str  # SUPPORTED, PARTIALLY_SUPPORTED, NOT_FOUND, CONFLICTING, NEEDS_VERIFICATION
    explanation: Optional[str]
    order_index: int
    claims_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class ClaimOut(BaseModel):
    id: str
    project_id: str
    source_id: str
    dimension_id: Optional[str]
    subject: str
    predicate: str
    value: str
    conditions: Optional[str]
    applicable_date_cycle: Optional[str]
    exact_excerpt: str
    confidence: float
    source_title: Optional[str] = None
    source_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# Finding Schemas (Gaps, Conflicts, Freshness)
# ==============================================================================

class FindingOut(BaseModel):
    id: str
    project_id: str
    dimension_id: Optional[str]
    finding_type: str  # GAP, CONFLICT, OUTDATED, UNANSWERED_QUESTION
    title: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    explanation: str
    why_it_matters: str
    recommended_action: str
    source_a_id: Optional[str] = None
    source_b_id: Optional[str] = None
    source_a_title: Optional[str] = None
    source_b_title: Optional[str] = None
    source_a_url: Optional[str] = None
    source_b_url: Optional[str] = None
    claim_a_excerpt: Optional[str] = None
    claim_b_excerpt: Optional[str] = None
    confidence: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# Task / Checklist Schemas
# ==============================================================================

class TaskCreate(BaseModel):
    title: str
    action_required: str
    rationale: str
    recommended_source: Optional[str] = None
    priority: str = "MEDIUM"  # CRITICAL, HIGH, MEDIUM, LOW


class TaskUpdate(BaseModel):
    status: Optional[str] = None  # PENDING, IN_PROGRESS, COMPLETED
    notes: Optional[str] = None


class TaskOut(BaseModel):
    id: str
    project_id: str
    finding_id: Optional[str]
    title: str
    action_required: str
    rationale: str
    recommended_source: Optional[str]
    priority: str
    status: str
    notes: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# Job & Project Schemas
# ==============================================================================

class JobOut(BaseModel):
    id: str
    project_id: str
    status: str  # QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED
    stage: str
    progress_pct: int
    error_details: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class ProjectCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    topic_question: str = Field(min_length=5)
    depth: str = "standard"  # standard, deep
    urls: Optional[List[str]] = []


class ProjectOut(BaseModel):
    id: str
    user_id: str
    title: str
    topic_question: str
    depth: str
    status: str
    coverage_score: float
    created_at: datetime
    updated_at: datetime
    sources_count: Optional[int] = 0
    gaps_count: Optional[int] = 0
    conflicts_count: Optional[int] = 0
    tasks_count: Optional[int] = 0
    completed_tasks_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class ReportOut(BaseModel):
    id: str
    project_id: str
    title: str
    executive_summary: str
    coverage_summary_json: str
    full_markdown: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# Structured AI Output Models
# ==============================================================================

class DimensionItem(BaseModel):
    name: str
    category: str
    importance_weight: float = 1.0
    description: str


class DecomposedDimensionsResponse(BaseModel):
    dimensions: List[DimensionItem]
    search_queries: List[str]


class ExtractedClaimItem(BaseModel):
    dimension_name: str
    subject: str
    predicate: str
    value: str
    conditions: Optional[str] = None
    applicable_date_cycle: Optional[str] = None
    exact_excerpt: str
    confidence: float = 1.0


class ExtractedClaimsResponse(BaseModel):
    claims: List[ExtractedClaimItem]


class GapItem(BaseModel):
    dimension_name: str
    title: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    explanation: str
    why_it_matters: str
    unanswered_questions: List[str]
    recommended_action: str


class GapsResponse(BaseModel):
    gaps: List[GapItem]


class ConflictItem(BaseModel):
    dimension_name: str
    title: str
    severity: str
    is_genuine_conflict: bool
    context_difference_reason: Optional[str] = None
    explanation: str
    claim_a_excerpt: str
    claim_b_excerpt: str
    why_it_matters: str
    recommended_action: str


class ConflictsResponse(BaseModel):
    conflicts: List[ConflictItem]


class FreshnessItem(BaseModel):
    source_title: str
    publication_date_detected: Optional[str] = None
    is_outdated_or_expired: bool
    is_undated: bool
    severity: str
    explanation: str
    recommended_action: str


class FreshnessResponse(BaseModel):
    freshness_warnings: List[FreshnessItem]


class ActionItem(BaseModel):
    title: str
    action_required: str
    rationale: str
    recommended_source: str
    priority: str  # CRITICAL, HIGH, MEDIUM, LOW


class VerificationPlanResponse(BaseModel):
    actions: List[ActionItem]
