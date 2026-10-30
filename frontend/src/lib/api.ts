const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  topic_question: string;
  depth: string;
  status: "draft" | "queued" | "analyzing" | "completed" | "failed";
  coverage_score: number;
  created_at: string;
  updated_at: string;
  sources_count: number;
  gaps_count: number;
  conflicts_count: number;
  tasks_count: number;
  completed_tasks_count: number;
}

export interface Source {
  id: string;
  project_id: string;
  url?: string;
  source_type: string;
  title: string;
  publisher_domain?: string;
  publication_date?: string;
  retrieval_date: string;
  status: string;
  error_message?: string;
  content_preview?: string;
}

export interface Dimension {
  id: string;
  project_id: string;
  name: string;
  category?: string;
  importance_weight: number;
  coverage_status: "SUPPORTED" | "PARTIALLY_SUPPORTED" | "NOT_FOUND" | "CONFLICTING" | "NEEDS_VERIFICATION";
  explanation?: string;
  order_index: number;
  claims_count?: number;
}

export interface Claim {
  id: string;
  project_id: string;
  source_id: string;
  dimension_id?: string;
  subject: string;
  predicate: string;
  value: string;
  conditions?: string;
  applicable_date_cycle?: string;
  exact_excerpt: string;
  confidence: number;
  source_title?: string;
  source_url?: string;
}

export interface Finding {
  id: string;
  project_id: string;
  dimension_id?: string;
  finding_type: "GAP" | "CONFLICT" | "OUTDATED" | "UNANSWERED_QUESTION";
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  why_it_matters: string;
  recommended_action: string;
  source_a_id?: string;
  source_b_id?: string;
  source_a_title?: string;
  source_b_title?: string;
  source_a_url?: string;
  source_b_url?: string;
  claim_a_excerpt?: string;
  claim_b_excerpt?: string;
  confidence: number;
  created_at: string;
}

export interface TaskItem {
  id: string;
  project_id: string;
  finding_id?: string;
  title: string;
  action_required: string;
  rationale: string;
  recommended_source?: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  notes?: string;
  created_at: string;
  completed_at?: string;
}

export interface ReportData {
  id: string;
  project_id: string;
  title: string;
  executive_summary: string;
  coverage_summary_json: string;
  full_markdown: string;
  created_at: string;
}

export interface JobStatus {
  id: string;
  project_id: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  stage: string;
  progress_pct: number;
  error_details?: string;
}

// API Functions
export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/api/projects`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load projects");
  return res.json();
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load project");
  return res.json();
}

export async function createProject(payload: { title: string; topic_question: string; depth: string; urls?: string[] }): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create research project");
  }
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete project");
}

export async function getSources(projectId: string): Promise<Source[]> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/sources`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load sources");
  return res.json();
}

export async function addSourceUrl(projectId: string, url: string, title?: string): Promise<Source> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/sources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, title }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to add URL");
  }
  return res.json();
}

export async function uploadDocument(projectId: string, file: File): Promise<Source> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/sources/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to upload document");
  }
  return res.json();
}

export async function getDimensions(projectId: string): Promise<Dimension[]> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/dimensions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load dimensions");
  return res.json();
}

export async function getClaims(projectId: string, dimensionId?: string): Promise<Claim[]> {
  const url = dimensionId
    ? `${API_BASE}/api/projects/${projectId}/claims?dimension_id=${dimensionId}`
    : `${API_BASE}/api/projects/${projectId}/claims`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load claims");
  return res.json();
}

export async function getFindings(projectId: string, type?: string): Promise<Finding[]> {
  const url = type
    ? `${API_BASE}/api/projects/${projectId}/findings?finding_type=${type}`
    : `${API_BASE}/api/projects/${projectId}/findings`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load findings");
  return res.json();
}

export async function getChecklist(projectId: string): Promise<TaskItem[]> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/checklist`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load checklist");
  return res.json();
}

export async function updateTask(taskId: string, payload: { status?: string; notes?: string }): Promise<TaskItem> {
  const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export async function getReport(projectId: string): Promise<ReportData> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/report`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load report");
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to poll job status");
  return res.json();
}

export async function getDemoProject(): Promise<{ id: string; title: string; topic_question: string; is_sample_demo: boolean }> {
  const res = await fetch(`${API_BASE}/api/demo`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to initialize demo workspace");
  return res.json();
}
