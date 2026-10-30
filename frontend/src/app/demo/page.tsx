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
import { CoverageGauge } from "@/components/dashboard/CoverageGauge";

export default function DemoShowcasePage() {
  const [demoProject, setDemoProject] = useState<any>(null);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "evidence" | "conflicts" | "gaps" | "checklist">("overview");
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
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch (err: any) {
      alert("Failed to update task: " + err.message);
    }
  };

  if (loading || !demoProject) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
          <span>Initializing Official Hackathon Demo Workspace...</span>
        </div>
      </div>
    );
  }

  const gaps = findings.filter((f) => f.finding_type === "GAP");
  const conflicts = findings.filter((f) => f.finding_type === "CONFLICT");
  const supportedDims = dimensions.filter((d) => d.coverage_status === "SUPPORTED");

  return (
    <div className="flex flex-col">
      {/* Demo Header */}
      <div className="border-b border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300 uppercase">
                  Official Hackathon Demonstration
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-semibold text-slate-500">Sample Dataset: ABC Scholarship 2026</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
                {demoProject.title}
              </h1>
              <p className="mt-1 text-xs text-slate-600 max-w-3xl">
                {demoProject.topic_question}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/research/${demoProject.id}/report`}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Inspect Report
              </Link>
              <Link
                href="/research/new"
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                <span>Run Custom Research</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Showcase Notice */}
      <div className="bg-amber-50/70 border-b border-amber-200 py-2.5 text-xs text-amber-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>Judges' Showcase Notice:</strong> This pre-seeded case study demonstrates all 10 stages of DarkSpot AI without requiring external API keys. Every button and toggle is fully interactive.
            </span>
          </div>
          <span className="text-[10px] font-bold text-amber-800 uppercase hidden sm:inline">
            Shinchan 2026
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-2 overflow-x-auto">
            {[
              { id: "overview", label: "Overview & Radar" },
              { id: "evidence", label: "Evidence Coverage Matrix" },
              { id: "conflicts", label: `Contradictions (${conflicts.length})` },
              { id: "gaps", label: `Information Gaps (${gaps.length})` },
              { id: "checklist", label: `Checklist (${tasks.filter(t => t.status === "COMPLETED").length}/${tasks.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CoverageGauge
                score={demoProject.coverage_score}
                totalDimensions={dimensions.length}
                supportedCount={supportedDims.length}
                gapsCount={gaps.length}
                conflictsCount={conflicts.length}
              />
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Research Blind-Spot Radar (ABC Scholarship 2026)
                </h3>
                <p className="text-xs text-slate-400 mb-2">Coverage distribution across key criteria</p>
                <BlindSpotRadar dimensions={dimensions} />
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
                <span className="text-[10px] font-bold uppercase text-rose-800">Key Contradiction</span>
                <p className="text-xs font-bold text-slate-900 mt-1">₹2 Lakh vs ₹3 Lakh Income Ceiling</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Central National Portal states ₹2,00,000 maximum, while State Circular states ₹3,00,000.
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                <span className="text-[10px] font-bold uppercase text-amber-800">Critical Gap</span>
                <p className="text-xs font-bold text-slate-900 mt-1">Renewal Policy Missing for 2026</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Reviewed 2026 documents defer renewal terms to future notice. Minimum CGPA required is unstated.
                </p>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                <span className="text-[10px] font-bold uppercase text-brand-800">Temporal Warning</span>
                <p className="text-xs font-bold text-slate-900 mt-1">2024 Archival Deadline Cited</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Source C mentions Sept 15 cutoff, but notice was published in 2024 (expired cycle).
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "evidence" && (
          <div className="space-y-4">
            {dimensions.map((dim) => (
              <div key={dim.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{dim.name}</span>
                    <span className="rounded bg-blue-50 px-1.5 py-0.2 text-[10px] font-semibold text-brand-700">
                      {dim.importance_weight}x Weight
                    </span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                    {dim.coverage_status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">{dim.explanation}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "conflicts" && (
          <div className="space-y-4">
            {conflicts.map((c) => (
              <div key={c.id} className="rounded-xl border border-rose-200 bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                  <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 uppercase">
                    {c.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{c.explanation}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="block text-slate-700 mb-1">Central Portal Claim:</strong>
                    <span className="italic text-slate-600">"{c.claim_a_excerpt}"</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="block text-slate-700 mb-1">State Directorate Claim:</strong>
                    <span className="italic text-slate-600">"{c.claim_b_excerpt}"</span>
                  </div>
                </div>
                <div className="text-xs text-brand-800 bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                  <strong>Resolution:</strong> {c.recommended_action}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "gaps" && (
          <div className="space-y-4">
            {gaps.map((g) => (
              <div key={g.id} className="rounded-xl border border-amber-200 bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{g.title}</h3>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                    {g.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{g.explanation}</p>
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg text-xs text-amber-900">
                  <strong>Why it matters:</strong> {g.why_it_matters}
                </div>
                <p className="text-xs text-brand-700">
                  <strong>Verification Action:</strong> {g.recommended_action}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "checklist" && (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.status === "COMPLETED"}
                    onChange={() => handleTaskToggle(task)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <div>
                    <h4 className={`text-xs font-bold ${task.status === "COMPLETED" ? "line-through text-slate-400" : "text-slate-900"}`}>
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">{task.action_required}</p>
                    <span className="text-[11px] text-brand-700 block mt-1">
                      Target: {task.recommended_source}
                    </span>
                  </div>
                </div>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap ${
                  task.priority === "CRITICAL" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
