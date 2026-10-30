"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  PlusCircle,
  HelpCircle,
  AlertTriangle,
  CheckSquare,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { getProjects, deleteProject, Project } from "@/lib/api";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this research project?")) return;
    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Failed to delete project: " + err.message);
    }
  };

  const totalGaps = projects.reduce((acc, p) => acc + (p.gaps_count || 0), 0);
  const totalConflicts = projects.reduce((acc, p) => acc + (p.conflicts_count || 0), 0);
  const totalTasks = projects.reduce((acc, p) => acc + (p.tasks_count || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Research Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor information completeness, contradictions, and pending verification tasks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadProjects}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
          <Link
            href="/research/new"
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Research</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Workspaces</span>
          <p className="mt-2 text-2xl font-bold text-slate-900">{projects.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-amber-600 uppercase">Information Gaps</span>
          <p className="mt-2 text-2xl font-bold text-amber-600">{totalGaps}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-rose-600 uppercase">Contradictions</span>
          <p className="mt-2 text-2xl font-bold text-rose-600">{totalConflicts}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-brand-600 uppercase">Verification Actions</span>
          <p className="mt-2 text-2xl font-bold text-brand-600">{totalTasks}</p>
        </div>
      </div>

      {/* Official Demo Banner for Hackathon Evaluation */}
      <div className="mt-8 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-white to-amber-50/40 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-brand-600 p-2 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Official Shinchan Online Hackathon 2026 Showcase
                </h3>
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  Curated Case Study
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                Inspect the complete ABC Scholarship 2026 case study: 3 sources evaluated, ₹2L vs ₹3L income contradiction detected, 2024 outdated cycle notice flagged, and 4 prioritized verification tasks.
              </p>
            </div>
          </div>
          <Link
            href="/demo"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            <span>Open Demo Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Projects List */}
      <div className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Your Research Workspaces
        </h2>

        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
              <span>Loading research workspaces...</span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
            Error loading research projects: {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Compass className="h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">No Custom Research Projects Yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Start by entering a research question and providing target URLs or document files to detect information gaps.
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                href="/research/new"
                className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                Create First Research Project
              </Link>
              <Link
                href="/demo"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Explore Sample Project
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/research/${p.id}`}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-brand-300 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        p.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : p.status === "analyzing" || p.status === "queued"
                          ? "bg-blue-50 text-brand-700 border border-blue-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {p.status}
                    </span>
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      title="Delete Project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-brand-600 transition">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                    {p.topic_question}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{p.coverage_score}%</span>
                    <span className="text-[10px] text-slate-400">Coverage</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span title="Gaps" className="flex items-center gap-1">
                      <HelpCircle className="h-3 w-3 text-amber-500" />
                      {p.gaps_count}
                    </span>
                    <span title="Conflicts" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-rose-500" />
                      {p.conflicts_count}
                    </span>
                    <span title="Tasks" className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3 text-brand-500" />
                      {p.tasks_count}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
