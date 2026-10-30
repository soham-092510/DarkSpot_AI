"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  RefreshCw,
  Printer,
  Copy,
  Check,
  FileText,
  ShieldAlert,
  Info,
} from "lucide-react";
import { getProject, getReport, Project, ReportData } from "@/lib/api";
import { ResearchTabs } from "@/components/dashboard/ResearchTabs";

export default function ResearchReportPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [proj, rep] = await Promise.all([
          getProject(projectId),
          getReport(projectId).catch(() => null),
        ]);
        setProject(proj);
        setReport(rep);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [projectId]);

  const handleCopyMarkdown = () => {
    if (!report?.full_markdown) return;
    navigator.clipboard.writeText(report.full_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !project) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
          <span>Loading Research Dossier...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white py-6 print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-600 uppercase">
                  Audit Export
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">Official Dossier</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Research Intelligence Dossier
              </h1>
              <p className="mt-1 text-xs text-slate-600">
                Complete structured findings, verbatim excerpts, and verification roadmap.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Markdown"}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Dossier</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <ResearchTabs projectId={project.id} />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        {!report ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
            Dossier report is still compiling for this research project. Please refresh shortly.
          </div>
        ) : (
          <article className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
            {/* Report Header */}
            <div className="border-b border-slate-200 pb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-700 uppercase mb-2">
                <ShieldAlert className="h-4 w-4" />
                <span>DarkSpot AI Research Dossier · Shinchan Online Hackathon 2026</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {report.title}
              </h1>
              <p className="mt-2 text-xs text-slate-600">
                <strong>Inquiry:</strong> {project.topic_question}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>Coverage Index: <strong className="text-slate-900">{project.coverage_score}%</strong></span>
                <span>·</span>
                <span>Generated: <strong>{new Date(report.created_at).toLocaleDateString()}</strong></span>
                <span>·</span>
                <span>Classification: <strong>Pre-Decision Verification</strong></span>
              </div>
            </div>

            {/* Executive Summary */}
            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                1. Executive Summary
              </h2>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 text-xs text-slate-800 leading-relaxed">
                {report.executive_summary}
              </div>
            </section>

            {/* Scientific Transparency Notice */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-brand-900 flex items-start gap-3">
              <Info className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Evaluation & Limitation Disclosure:</p>
                <p className="mt-0.5 leading-relaxed text-brand-800">
                  Findings in this report represent analysis of the explicitly reviewed materials.
                  An information gap signifies that the consulted documentation does not address the criterion;
                  it does not prove the fact is nonexistent in unreviewed records.
                </p>
              </div>
            </div>

            {/* Full Markdown Render */}
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                2. Full Investigation Dossier & Audit Tables
              </h2>
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-6 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {report.full_markdown}
              </div>
            </section>
          </article>
        )}
      </div>
    </div>
  );
}
