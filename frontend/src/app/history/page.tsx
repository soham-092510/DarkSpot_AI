"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  History,
  Search,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  Trash2,
  HelpCircle,
  AlertTriangle,
  CheckSquare,
  FileText,
  Filter,
} from "lucide-react";
import { getProjects, deleteProject, Project } from "@/lib/api";

function HistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

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
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this research project?")) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Failed to delete project: " + err.message);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !query.trim() ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.topic_question.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || p.status.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, query, statusFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-brand-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Research History
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Browse, search, and manage all automated multi-source research investigations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadProjects}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            href="/research/new"
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Research</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by research title, question, or keywords..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs">
            {["ALL", "COMPLETED", "ANALYZING", "QUEUED"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  statusFilter === status
                    ? "bg-white text-brand-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
            <span>Loading research history...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {error}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <History className="h-10 w-10 text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-900">
            No Research Records Found
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {query || statusFilter !== "ALL"
              ? "No research projects match your search or filter criteria."
              : "You haven't launched any custom investigations yet."}
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href="/research/new"
              className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              Start New Research
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/research/${p.id}`)}
              className="group relative flex flex-col justify-between cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-brand-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      p.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : p.status === "analyzing" || p.status === "queued"
                        ? "bg-blue-50 text-brand-700 ring-1 ring-blue-200 animate-pulse"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p.status}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(p.id, e)}
                    className="rounded-lg p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {p.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {p.topic_question}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span>{p.coverage_score}%</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      Coverage
                    </span>
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

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[11px] text-slate-400">
                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                  <Link
                    href={`/research/${p.id}/report`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-brand-600 hover:text-brand-800 font-semibold"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Dossier</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
            <span>Loading Research History...</span>
          </div>
        </div>
      }
    >
      <HistoryContent />
    </Suspense>
  );
}
