function getApiBase(): string {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (!envUrl) return "";
  if (envUrl.startsWith("http://") || envUrl.startsWith("https://")) {
    return envUrl.replace(/\/+$/, "");
  }
  return `https://${envUrl}`.replace(/\/+$/, "");
}

const API_BASE = getApiBase();

// ==============================================================================
// Token & Session Storage
// ==============================================================================

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("darkspot_token");
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("darkspot_token", token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("darkspot_token");
    localStorage.removeItem("darkspot_user");
  }
}

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ==============================================================================
// Domain Interfaces
// ==============================================================================

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiCredential {
  id: string;
  provider: "gemini" | "tavily";
  key_mask: string;
  status: "valid" | "invalid" | "untested";
  last_validated_at?: string;
  last_used_at?: string;
  created_at: string;
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
  completed_at?: string;
}

export interface ReportData {
  id: string;
  project_id: string;
  title: string;
  executive_summary: string;
  coverage_summary_json?: string;
  full_markdown?: string;
  evidence_coverage_matrix?: any[];
  identified_gaps?: any[];
  contradiction_log?: any[];
  temporal_freshness_log?: any[];
  verification_plan?: any[];
  markdown_dossier?: string;
  created_at: string;
}

export interface JobStatus {
  id: string;
  project_id: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  stage: string;
  progress_pct: number;
  started_at?: string;
  completed_at?: string;
  error_details?: string;
}

// ==============================================================================
// Authentication API Functions
// ==============================================================================

export async function registerUser(payload: { email: string; password: string; full_name?: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed. Please check your credentials.");
  }
  const data: AuthResponse = await res.json();
  setAuthToken(data.access_token);
  if (typeof window !== "undefined") {
    localStorage.setItem("darkspot_user", JSON.stringify(data.user));
  }
  return data;
}

export async function loginUser(payload: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid email or password combination.");
  }
  const data: AuthResponse = await res.json();
  setAuthToken(data.access_token);
  if (typeof window !== "undefined") {
    localStorage.setItem("darkspot_user", JSON.stringify(data.user));
  }
  return data;
}

export async function getCurrentUser(): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load user profile");
  return res.json();
}

export async function updateProfile(payload: { full_name?: string }): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: "PATCH",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  const updated: User = await res.json();
  if (typeof window !== "undefined") {
    localStorage.setItem("darkspot_user", JSON.stringify(updated));
  }
  return updated;
}

export async function changePassword(payload: { current_password: string; new_password: string }): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/change-password`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update password");
  }
}

export async function forgotPassword(payload: { email: string }): Promise<{ message: string; dev_reset_token?: string }> {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to request password reset");
  }
  return res.json();
}

export async function resetPassword(payload: { token: string; new_password: string }): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to reset password");
  }
  return res.json();
}

export async function verifyEmail(payload: { token: string }): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to verify email");
  }
  return res.json();
}

export async function deleteAccount(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/account`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete account");
  removeAuthToken();
}

export function logoutUser(): void {
  removeAuthToken();
}

// ==============================================================================
// BYOK (Bring Your Own Key) API Functions
// ==============================================================================

export async function getCredentials(): Promise<ApiCredential[]> {
  const res = await fetch(`${API_BASE}/api/credentials`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Failed to load configured credentials");
  }
  return res.json();
}

export async function testCredential(provider: "gemini" | "tavily", apiKey: string): Promise<{ valid: boolean; provider: string; message: string }> {
  const res = await fetch(`${API_BASE}/api/credentials/test`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ provider, api_key: apiKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Key connectivity test failed");
  }
  return res.json();
}

export async function saveCredential(provider: "gemini" | "tavily", apiKey: string): Promise<ApiCredential> {
  const res = await fetch(`${API_BASE}/api/credentials`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ provider, api_key: apiKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to save API key");
  }
  return res.json();
}

export async function deleteCredential(provider: "gemini" | "tavily"): Promise<void> {
  const res = await fetch(`${API_BASE}/api/credentials/${provider}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to remove ${provider} key`);
}

// ==============================================================================
// Research Projects API Functions
// ==============================================================================

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/api/projects`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Failed to load projects");
  }
  return res.json();
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load project details");
  return res.json();
}

export async function createProject(payload: {
  title: string;
  topic_question: string;
  depth?: string;
  urls?: string[];
}): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create research project");
  }
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete project");
}

export async function getSources(projectId: string): Promise<Source[]> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/sources`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load sources");
  return res.json();
}

export async function addSourceUrl(projectId: string, url: string, title?: string): Promise<Source> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/sources`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to upload document");
  }
  return res.json();
}

export async function getDimensions(projectId: string): Promise<Dimension[]> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/dimensions`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load dimensions");
  return res.json();
}

export async function getClaims(projectId: string, dimensionId?: string): Promise<Claim[]> {
  const url = dimensionId
    ? `${API_BASE}/api/projects/${projectId}/claims?dimension_id=${dimensionId}`
    : `${API_BASE}/api/projects/${projectId}/claims`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load claims");
  return res.json();
}

export async function getFindings(projectId: string, type?: string): Promise<Finding[]> {
  const url = type
    ? `${API_BASE}/api/projects/${projectId}/findings?finding_type=${type}`
    : `${API_BASE}/api/projects/${projectId}/findings`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load findings");
  return res.json();
}

export async function getChecklist(projectId: string): Promise<TaskItem[]> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/checklist`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load checklist");
  return res.json();
}

export async function updateTask(taskId: string, payload: { status?: string; notes?: string }): Promise<TaskItem> {
  const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export async function getReport(projectId: string): Promise<ReportData> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/report`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load report");
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to poll job status");
  return res.json();
}

export async function getDemoProject(): Promise<{ id: string; title: string; topic_question: string; is_sample_demo: boolean }> {
  const res = await fetch(`${API_BASE}/api/demo`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to initialize demo workspace");
  return res.json();
}
