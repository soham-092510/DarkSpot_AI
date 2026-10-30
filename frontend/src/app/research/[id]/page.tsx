"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  RefreshCw,
  AlertTriangle,
  HelpCircle,
  CheckSquare,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  getProject,
  getDimensions,
  getFindings,
  getChecklist,
  getSources,
  updateTask,
  Project,
  Dimension,
  Finding,
  TaskItem,
  Source,
} from "@/lib/api";
import { ResearchTabs } from "@/components/dashboard/ResearchTabs";
import { BlindSpotRadar } from "@/components/dashboard/BlindSpotRadar";
import { CoverageGauge } from "@/components/dashboard/CoverageGauge";

export default function ProjectWorkspaceOverview() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [projData, dimsData, findsData, tasksData, srcsData] = await Promise.all([
        getProject(projectId),
        getDimensions(projectId),
        getFindings(projectId),
        getChecklist(projectId),
        getSources(projectId),
      ]);
      setProject(projData);
      setDimensions(dimsData);
      setFindings(findsData);
      setTasks(tasksData);
      setSources(srcsData);
    } catch (err: any) {
      setError(err.message || "Failed to load research data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // If project is analyzing or queued, poll every 2.5s
    const interval = setInterval(() => {
      if (project?.status === "analyzing" || project?.status === "queued") {
        loadData();
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [projectId, project?.status]);

  const handleTaskToggle = async (task: TaskItem) => {
    const nextStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      const updated = await updateTask(task.id, { status: nextStatus });
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch (err: any) {
      alert("Failed to update task: " + err.message);
    }
  };

  if (loading && !project) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
          <span>Loading Research Workspace...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700">
          {error || "Project not found"}
        </div>
      </div>
    );
  }

  const gaps = findings.filter((f) => f.finding_type === "GAP");
  const conflicts = findings.filter((f) => f.finding_type === "CONFLICT");
  const outdated = findings.filter((f) => f.finding_type === "OUTDATED");
  const supportedDims = dimensions.filter((d) => d.coverage_status === "SUPPORTED");

  return (
    <div className="flex flex-col">
      {/* Workspace Header */}
      <div className="border-b border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    project.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-blue-50 text-brand-700 border border-blue-200"
                  }`}
                >
                  {project.status === "completed" ? "Audit Complete" : project.status}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 capitalize">{project.depth} Depth</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                {project.title}
              </h1>
              <p className="mt-1 text-xs text-slate-600 max-w-3xl">
                {project.topic_question}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                <span>Re-sync</span>
              </button>
              <Link
                href={`/research/${project.id}/report`}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                <span>Export Dossier</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <ResearchTabs
        projectId={project.id}
        counts={{
          sources: sources.length,
          gaps: gaps.length,
          conflicts: conflicts.length,
          tasks: tasks.length,
        }}
      />

      {/* Processing State Banner */}
      {(project.status === "queued" || project.status === "analyzing") && (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">
              Intelligence Pipeline Currently Executing
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
              DarkSpot AI is decomposing research dimensions, crawling verified sources, extracting atomic claims, and calculating cross-source contradictions.
            </p>
          </div>
        </div>
      )}

      {/* Completed Workspace Body */}
      {project.status === "completed" && (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
          {/* Top Row: Gauge & Radar */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CoverageGauge
              score={project.coverage_score}
              totalDimensions={dimensions.length}
              supportedCount={supportedDims.length}
              gapsCount={gaps.length}
              conflictsCount={conflicts.length}
            />

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Research Blind-Spot Radar
                  </h3>
                  <p className="text-xs text-slate-400">
                    Coverage vs gap visualization per dimension
                  </p>
                </div>
                <Link
                  href={`/research/${project.id}/evidence`}
                  className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
                >
                  <span>Open Full Matrix</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <BlindSpotRadar dimensions={dimensions} />
            </div>
          </div>

          {/* High Priority Critical Findings Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Contradictions Preview */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-rose-50 border border-rose-200 text-rose-600">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Contradiction Intelligence
                      </h3>
                      <p className="text-xs text-slate-400">
                        {conflicts.length} cross-source discrepancy detected
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/research/${project.id}/conflicts`}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="mt-4 space-y-3">
                  {conflicts.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">
                      No direct contradictions identified across reviewed sources.
                    </p>
                  ) : (
                    conflicts.slice(0, 2).map((c) => (
                      <div
                        key={c.id}
                        className="rounded-lg border border-rose-100 bg-rose-50/30 p-3.5 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{c.title}</span>
                          <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-800">
                            {c.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{c.explanation}</p>
                        {c.claim_a_excerpt && (
                          <div className="rounded border border-slate-200 bg-white p-2 text-[11px] text-slate-700 italic">
                            "{c.claim_a_excerpt}"
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-right">
                <Link
                  href={`/research/${project.id}/conflicts`}
                  className="text-xs font-semibold text-brand-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Inspect side-by-side evidence</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Information Gaps Preview */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-600">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Information Gaps & Blind Spots
                      </h3>
                      <p className="text-xs text-slate-400">
                        {gaps.length} critical omissions identified
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/research/${project.id}/gaps`}
                    className="text-xs font-semibold text-amber-600 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="mt-4 space-y-3">
                  {gaps.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">
                      All research dimensions sufficiently addressed in reviewed sources.
                    </p>
                  ) : (
                    gaps.slice(0, 2).map((g) => (
                      <div
                        key={g.id}
                        className="rounded-lg border border-amber-100 bg-amber-50/30 p-3.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{g.title}</span>
                          <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                            {g.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{g.explanation}</p>
                        <p className="text-[11px] text-amber-900 font-medium">
                          <strong>Why it matters:</strong> {g.why_it_matters}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-right">
                <Link
                  href={`/research/${project.id}/gaps`}
                  className="text-xs font-semibold text-brand-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Review all unanswered questions</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Prioritized Verification Checklist Preview */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-brand-50 border border-brand-200 text-brand-600">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Prioritized Verification Checklist
                  </h3>
                  <p className="text-xs text-slate-400">
                    Targeted actions recommended before making a decision
                  </p>
                </div>
              </div>
              <Link
                href={`/research/${project.id}/checklist`}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Manage Checklist ({tasks.filter((t) => t.status === "COMPLETED").length}/{tasks.length} Done)
              </Link>
            </div>

            <div className="mt-4 space-y-2">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No verification actions generated yet.
                </p>
              ) : (
                tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/40 p-3 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === "COMPLETED"}
                        onChange={() => handleTaskToggle(task)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <div>
                        <span
                          className={`text-xs font-bold ${
                            task.status === "COMPLETED"
                              ? "text-slate-400 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </span>
                        <p className="text-xs text-slate-600 mt-0.5">{task.action_required}</p>
                        {task.recommended_source && (
                          <span className="text-[11px] text-brand-700 font-medium mt-1 block">
                            Target Authority: {task.recommended_source}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap ${
                        task.priority === "CRITICAL"
                          ? "bg-rose-100 text-rose-800"
                          : task.priority === "HIGH"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
