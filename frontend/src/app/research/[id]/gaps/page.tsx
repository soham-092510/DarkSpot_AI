"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  RefreshCw,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Info,
  CheckSquare,
} from "lucide-react";
import { getProject, getFindings, Project, Finding } from "@/lib/api";
import { ResearchTabs } from "@/components/dashboard/ResearchTabs";

export default function MissingGapsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [gaps, setGaps] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [proj, finds] = await Promise.all([
          getProject(projectId),
          getFindings(projectId, "GAP"),
        ]);
        setProject(proj);
        setGaps(finds);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [projectId]);

  if (loading || !project) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
          <span>Loading Information Gaps...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-600 uppercase">
                  Innovation C
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">Information Completeness Engine</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Information Gaps & Blind Spots
              </h1>
              <p className="mt-1 text-xs text-slate-600">
                Identifies missing criteria and unanswered questions that reviewed sources fail to resolve.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ResearchTabs projectId={project.id} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6">
        {/* Transparency Banner */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Critical Research Principle:</p>
            <p className="mt-0.5 leading-relaxed text-amber-800">
              Not finding information in the reviewed sources does not prove non-existence.
              It means the documentation consulted is incomplete, and independent verification is necessary before proceeding.
            </p>
          </div>
        </div>

        {gaps.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <h3 className="text-sm font-bold text-slate-900">
              No Major Information Gaps Detected
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              The reviewed sources sufficiently addressed all identified research dimensions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {gaps.map((gap) => (
              <div
                key={gap.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 mt-0.5">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{gap.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {gap.explanation}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold border uppercase flex-shrink-0 ${
                      gap.severity === "CRITICAL"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {gap.severity}
                  </span>
                </div>

                <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3.5 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                    Decision Impact Rationale
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {gap.why_it_matters}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="text-brand-800">
                    <strong>Recommended Next Action:</strong> {gap.recommended_action}
                  </div>
                  <Link
                    href={`/research/${project.id}/checklist`}
                    className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline flex-shrink-0"
                  >
                    <span>Checklist Target</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
