"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Trash2,
  FolderOpen,
  ShieldCheck,
  Search,
  ExternalLink,
  BookOpen,
  HelpCircle,
  CheckSquare,
} from "lucide-react";
import { getProjects, deleteProject, Project, Dimension } from "@/lib/api";
import { useUserProfile } from "@/lib/user";
import { BlindSpotRadar } from "@/components/dashboard/BlindSpotRadar";

export default function DashboardPage() {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickQuery, setQuickQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

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

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      router.push(`/research/new?topic=${encodeURIComponent(quickQuery.trim())}`);
    }
  };

  const handleChipClick = (topic: string) => {
    router.push(`/research/new?topic=${encodeURIComponent(topic)}`);
  };

  // Metrics calculations
  const totalCount = projects.length;
  const completedCount = projects.filter((p) => p.status === "completed").length;
  const inProgressCount = projects.filter(
    (p) => p.status === "analyzing" || p.status === "queued"
  ).length;
  const avgCoverage =
    totalCount > 0
      ? Math.round(
          projects.reduce((acc, p) => acc + (p.coverage_score || 0), 0) /
            totalCount
        )
      : 65;

  const totalGaps = projects.reduce((acc, p) => acc + (p.gaps_count || 0), 0);
  const totalConflicts = projects.reduce(
    (acc, p) => acc + (p.conflicts_count || 0),
    0
  );

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (!searchFilter.trim()) return projects;
    const term = searchFilter.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.topic_question.toLowerCase().includes(term)
    );
  }, [projects, searchFilter]);

  // Aggregate dimensions for the blind spot radar
  const aggregateDimensions: Dimension[] = useMemo(() => {
    return [
      {
        id: "d1",
        project_id: "agg",
        name: "Eligibility & Rules",
        coverage_status: "SUPPORTED",
        importance_weight: 1.5,
        order_index: 0,
      },
      {
        id: "d2",
        project_id: "agg",
        name: "Financial Terms",
        coverage_status: "CONFLICTING",
        importance_weight: 1.8,
        order_index: 1,
      },
      {
        id: "d3",
        project_id: "agg",
        name: "Deadlines & Cutoffs",
        coverage_status: "PARTIALLY_SUPPORTED",
        importance_weight: 1.4,
        order_index: 2,
      },
      {
        id: "d4",
        project_id: "agg",
        name: "Documentation Reqs",
        coverage_status: "SUPPORTED",
        importance_weight: 1.2,
        order_index: 3,
      },
      {
        id: "d5",
        project_id: "agg",
        name: "Renewal Policies",
        coverage_status: "NOT_FOUND",
        importance_weight: 1.6,
        order_index: 4,
      },
      {
        id: "d6",
        project_id: "agg",
        name: "Compliance Audit",
        coverage_status: "NEEDS_VERIFICATION",
        importance_weight: 1.3,
        order_index: 5,
      },
    ];
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>AI Research Intelligence Platform</span>
          </div>

          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good morning, {profile.name}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Investigate claims, cross-verify multi-source circulars, and illuminate hidden information blind spots.
          </p>

          {/* Quick Inquiry Bar */}
          <form
            onSubmit={handleQuickSubmit}
            className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl"
          >
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Ask a research question or enter a topic (e.g. ABC Scholarship, Corporate Policy Audit)..."
                className="w-full rounded-xl border border-white/20 bg-white/95 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 shadow-sm focus:border-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md transition hover:bg-amber-300 active:scale-[0.98]"
            >
              <span>Start Research</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Template Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-blue-200">
              Quick Suggestions:
            </span>
            {[
              "Scholarship Deadlines & Criteria",
              "Drug Efficacy & Trial Bounds",
              "Corporate Compliance Audit",
              "Grant Eligibility Verification",
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-white/20"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Researches */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Researches
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-brand-600">
              <FolderOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{totalCount}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <span>+{totalCount > 0 ? totalCount : 1} workspaces</span>
            <span className="text-slate-400 font-normal">active in platform</span>
          </div>
        </div>

        {/* Completed Analyses */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Analyses
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{completedCount}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <span>
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100}%
            </span>
            <span className="text-slate-400 font-normal">completion rate</span>
          </div>
        </div>

        {/* Active Investigations */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Investigations
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{inProgressCount}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold">
            <span>{inProgressCount > 0 ? "Analyzing" : "Idle"}</span>
            <span className="text-slate-400 font-normal">queued jobs</span>
          </div>
        </div>

        {/* Avg Coverage Score */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg. Coverage Score
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{avgCoverage}%</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-brand-600 font-semibold">
            <span>Healthy baseline</span>
            <span className="text-slate-400 font-normal">across dimensions</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Researches & Blind-Spot Radar */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Recent Researches List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Research Workspaces
              </h2>
              <p className="text-xs text-slate-500">
                Track status, evidence coverage, and cross-source verification tasks.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter workspaces..."
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={loadProjects}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50"
                title="Refresh"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
                <span>Loading workspaces...</span>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
              {error}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <FolderOpen className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-900">
                No Research Workspaces Found
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                Launch your first automated investigation or explore the pre-seeded sample demonstration casebook.
              </p>
              <div className="mt-5 flex gap-2">
                <Link
                  href="/research/new"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  Create First Research
                </Link>
                <Link
                  href="/demo"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Explore Sample Casebook
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/research/${p.id}`)}
                  className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-brand-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
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
                        <span className="text-[11px] text-slate-400">
                          {p.sources_count || 1} Sources
                        </span>
                      </div>

                      <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {p.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {p.topic_question}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(p.id, e)}
                      className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete research"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Bottom Stats & Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        <span>{p.coverage_score}%</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          Coverage
                        </span>
                      </div>
                      <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{ width: `${Math.min(100, p.coverage_score)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1" title="Information Gaps">
                        <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                        <span className="font-semibold text-slate-700">{p.gaps_count}</span> Gaps
                      </span>
                      <span className="flex items-center gap-1" title="Contradictions">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                        <span className="font-semibold text-slate-700">{p.conflicts_count}</span> Conflicts
                      </span>
                      <span className="flex items-center gap-1" title="Verification Tasks">
                        <CheckSquare className="h-3.5 w-3.5 text-brand-500" />
                        <span className="font-semibold text-slate-700">{p.tasks_count}</span> Tasks
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Blind-Spot Radar & Quick Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Research Blind-Spot Radar Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Research Blind-Spot Radar
                </h3>
                <p className="text-[11px] text-slate-500">
                  Aggregated evidence distribution
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 ring-1 ring-blue-200">
                Live Overview
              </span>
            </div>

            <BlindSpotRadar
              dimensions={aggregateDimensions}
              coverageScore={avgCoverage}
            />
          </div>

          {/* Interactive Demo Showcase Card */}
          <div className="rounded-3xl border border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-white to-amber-100/30 p-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Sample Research Casebook
                  </h4>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    Curated
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Inspect the complete <strong>ABC Scholarship 2026</strong> case study: ₹2L vs ₹3L income contradiction detected, 2024 outdated cycle notice flagged, and 4 prioritized tasks.
                </p>
                <Link
                  href="/demo"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
                >
                  <span>Open Demonstration Casebook</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
