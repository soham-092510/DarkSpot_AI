"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  HelpCircle,
  CheckSquare,
  ArrowRight,
  ShieldAlert,
  Info,
  BookOpen,
  Layers,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import {
  getDemoProject,
  getDimensions,
  getFindings,
  getChecklist,
  getSources,
  updateTask,
  Dimension,
  Finding,
  TaskItem,
  Source,
} from "@/lib/api";
import { BlindSpotRadar } from "@/components/dashboard/BlindSpotRadar";

export default function DemoShowcasePage() {
  const [demoProject, setDemoProject] = useState<any>(null);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "evidence" | "conflicts" | "gaps" | "checklist"
  >("overview");
  const [loading, setLoading] = useState(true);

  const loadDemo = async () => {
    try {
      setLoading(true);
      const demo = await getDemoProject();
      setDemoProject(demo);

      const [dims, finds, tsks, srcs] = await Promise.all([
        getDimensions(demo.id),
        getFindings(demo.id),
        getChecklist(demo.id),
        getSources(demo.id),
      ]);
      setDimensions(dims);
      setFindings(finds);
      setTasks(tsks);
      setSources(srcs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemo();
  }, []);

  const handleTaskToggle = async (task: TaskItem) => {
    const nextStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      const updated = await updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err: any) {
      alert("Failed to update task: " + err.message);
    }
  };

  if (loading || !demoProject) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
          <span>Initializing Sample Demonstration Workspace...</span>
        </div>
      </div>
    );
  }

  const gaps = findings.filter((f) => f.finding_type === "GAP");
  const conflicts = findings.filter((f) => f.finding_type === "CONFLICT");
  const supportedDims = dimensions.filter((d) => d.coverage_status === "SUPPORTED");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  const blindSpotIndex = Math.max(0, 100 - Math.round(demoProject.coverage_score));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-bold text-amber-300 ring-1 ring-amber-400/40 uppercase tracking-wider">
                Interactive Sample Casebook
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-200">
                Pre-Loaded Investigation
              </span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              {demoProject.title}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-blue-100 leading-relaxed">
              {demoProject.topic_question}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/research/${demoProject.id}/report`}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <FileText className="h-4 w-4" />
              <span>Full Dossier</span>
            </Link>
            <Link
              href="/research/new"
              className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-brand-400 active:scale-[0.98]"
            >
              <span>Run Custom Research</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5 KPI Counter Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Sources Analyzed
          </span>
          <p className="mt-2 text-2xl font-extrabold text-brand-600">
            {sources.length || 3}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Cross-referenced
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Key Dimensions
          </span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">
            {dimensions.length || 5}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Extracted bounds
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Contradictions
          </span>
          <p className="mt-2 text-2xl font-extrabold text-rose-600">
            {conflicts.length}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Critical conflicts
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Information Gaps
          </span>
          <p className="mt-2 text-2xl font-extrabold text-amber-600">
            {gaps.length}
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Missing criteria
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Blind Spot Index
          </span>
          <p className="mt-2 text-2xl font-extrabold text-purple-600">
            {blindSpotIndex}%
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Unverified area
          </span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs">
        <nav className="flex space-x-1 overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Radar" },
            { id: "evidence", label: `Evidence Matrix (${dimensions.length})` },
            { id: "conflicts", label: `Contradictions (${conflicts.length})` },
            { id: "gaps", label: `Information Gaps (${gaps.length})` },
            {
              id: "checklist",
              label: `Checklist (${completedTasks.length}/${tasks.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Key Findings & Contradiction Alerts (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Critical Contradiction Alerts
                </h3>
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200">
                  {conflicts.length} Identified
                </span>
              </div>

              {conflicts.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-rose-200 bg-rose-50/30 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {c.title}
                    </span>
                    <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 uppercase">
                      {c.severity} Severity
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{c.explanation}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        Source A · Central Portal
                      </span>
                      <p className="italic text-slate-700">
                        "{c.claim_a_excerpt || "Family annual income cannot exceed ₹2,00,000."}"
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        Source B · State Circular
                      </span>
                      <p className="italic text-slate-700">
                        "{c.claim_b_excerpt || "Income ceiling is set at ₹3,00,000 for state domicile candidates."}"
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-brand-900">
                    <strong>Recommended Resolution:</strong> {c.recommended_action}
                  </div>
                </div>
              ))}
            </div>

            {/* Critical Omissions & Gaps */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Synthesized Information Gaps
                </h3>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
                  {gaps.length} Missing
                </span>
              </div>

              {gaps.map((g) => (
                <div
                  key={g.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50/30 p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{g.title}</h4>
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                      {g.severity}
                    </span>
                  </div>
                  <p className="text-slate-600">{g.explanation}</p>
                  <div className="rounded-lg bg-white/80 p-2.5 border border-amber-100 text-[11px] text-amber-900">
                    <strong>Why it matters:</strong> {g.why_it_matters}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Blind-Spot Radar & Dimensions (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Research Blind-Spot Radar
                </h3>
                <p className="text-[11px] text-slate-500">
                  Criterion breakdown for ABC Scholarship 2026
                </p>
              </div>

              <BlindSpotRadar
                dimensions={dimensions}
                coverageScore={demoProject.coverage_score}
              />
            </div>

            {/* Dimension Breakdown Progress Bars */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Criteria Health Breakdown
              </h4>
              <div className="space-y-3">
                {dimensions.map((dim) => {
                  const score =
                    dim.coverage_status === "SUPPORTED"
                      ? 100
                      : dim.coverage_status === "PARTIALLY_SUPPORTED"
                      ? 50
                      : dim.coverage_status === "CONFLICTING"
                      ? 25
                      : 0;

                  const colorClass =
                    dim.coverage_status === "SUPPORTED"
                      ? "bg-emerald-500"
                      : dim.coverage_status === "PARTIALLY_SUPPORTED"
                      ? "bg-blue-500"
                      : dim.coverage_status === "CONFLICTING"
                      ? "bg-rose-500"
                      : "bg-amber-500";

                  return (
                    <div key={dim.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">
                          {dim.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {dim.coverage_status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colorClass}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Matrix Tab */}
      {activeTab === "evidence" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Cross-Source Evidence Coverage Matrix
            </h2>
            <span className="text-xs text-slate-500">
              {dimensions.length} Key Evaluation Dimensions
            </span>
          </div>

          <div className="space-y-3">
            {dimensions.map((dim) => (
              <div
                key={dim.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {dim.name}
                    </h3>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                      {dim.importance_weight}x Priority
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      dim.coverage_status === "SUPPORTED"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : dim.coverage_status === "CONFLICTING"
                        ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                        : dim.coverage_status === "PARTIALLY_SUPPORTED"
                        ? "bg-blue-50 text-brand-700 ring-1 ring-blue-200"
                        : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                    }`}
                  >
                    {dim.coverage_status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {dim.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contradictions Tab */}
      {activeTab === "conflicts" && (
        <div className="space-y-4">
          {conflicts.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-rose-200 bg-white p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 uppercase">
                  {c.severity} Severity
                </span>
              </div>
              <p className="text-xs text-slate-600">{c.explanation}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Source A
                  </span>
                  <p className="italic text-slate-800">"{c.claim_a_excerpt}"</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Source B
                  </span>
                  <p className="italic text-slate-800">"{c.claim_b_excerpt}"</p>
                </div>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-brand-900">
                <strong>Recommended Resolution:</strong> {c.recommended_action}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Information Gaps Tab */}
      {activeTab === "gaps" && (
        <div className="space-y-4">
          {gaps.map((g) => (
            <div
              key={g.id}
              className="rounded-2xl border border-amber-200 bg-white p-6 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">{g.title}</h3>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                  {g.severity}
                </span>
              </div>
              <p className="text-xs text-slate-600">{g.explanation}</p>
              <div className="rounded-xl bg-amber-50/70 p-3 text-xs text-amber-900">
                <strong>Why it matters:</strong> {g.why_it_matters}
              </div>
              <div className="text-xs text-brand-700">
                <strong>Verification Action:</strong> {g.recommended_action}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checklist Tab */}
      {activeTab === "checklist" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Interactive Verification Checklist
            </h3>
            <span className="text-xs font-semibold text-emerald-600">
              {completedTasks.length} of {tasks.length} Completed
            </span>
          </div>

          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-slate-300"
            >
              <div className="flex items-start gap-3.5">
                <input
                  type="checkbox"
                  checked={task.status === "COMPLETED"}
                  onChange={() => handleTaskToggle(task)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <div>
                  <h4
                    className={`text-xs font-bold ${
                      task.status === "COMPLETED"
                        ? "line-through text-slate-400"
                        : "text-slate-900"
                    }`}
                  >
                    {task.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {task.action_required}
                  </p>
                  <span className="text-[11px] text-brand-700 block mt-1">
                    Target Authority: {task.recommended_source}
                  </span>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap ${
                  task.priority === "CRITICAL"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
