"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  RefreshCw,
  GitCompare,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { getProject, getFindings, Project, Finding } from "@/lib/api";
import { ResearchTabs } from "@/components/dashboard/ResearchTabs";

export default function ConflictsIntelligencePage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [conflicts, setConflicts] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [proj, finds] = await Promise.all([
          getProject(projectId),
          getFindings(projectId, "CONFLICT"),
        ]);
        setProject(proj);
        setConflicts(finds);
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
          <span>Loading Contradiction Intelligence...</span>
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
                <span className="text-xs font-bold text-rose-600 uppercase">
                  Contradiction Engine
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">Cross-Source Discrepancies</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Contradiction Intelligence
              </h1>
              <p className="mt-1 text-xs text-slate-600">
                Cross-source claim comparison detecting conflicting requirements, numbers, and policies.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ResearchTabs projectId={project.id} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6">
        {conflicts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">
              No Contradictions Detected
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              The claims extracted across the reviewed sources are consistent with one another.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {conflicts.map((conf) => (
              <div
                key={conf.id}
                className="rounded-xl border border-rose-200 bg-white shadow-2xs overflow-hidden"
              >
                <div className="border-b border-rose-100 bg-rose-50/40 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-rose-100 text-rose-700">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{conf.title}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{conf.explanation}</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-rose-100 px-3 py-0.5 text-xs font-bold text-rose-800 border border-rose-200 uppercase">
                    {conf.severity}
                  </span>
                </div>

                {/* Side by side comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {/* Source A */}
                  <div className="p-5 space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Claim A (Source 1)
                      </span>
                      {conf.source_a_url && (
                        <a
                          href={conf.source_a_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-brand-600 hover:underline"
                        >
                          <span>Open Source</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-800 italic">
                      "{conf.claim_a_excerpt || "Claim extracted from primary source"}"
                    </div>

                    <p className="text-[11px] text-slate-500">
                      <strong>Source Authority:</strong> {conf.source_a_title || "Official Portal"}
                    </p>
                  </div>

                  {/* Source B */}
                  <div className="p-5 space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Claim B (Source 2)
                      </span>
                      {conf.source_b_url && (
                        <a
                          href={conf.source_b_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-brand-600 hover:underline"
                        >
                          <span>Open Source</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-800 italic">
                      "{conf.claim_b_excerpt || "Claim extracted from secondary circular"}"
                    </div>

                    <p className="text-[11px] text-slate-500">
                      <strong>Source Authority:</strong> {conf.source_b_title || "State / Third-party Directorate"}
                    </p>
                  </div>
                </div>

                {/* Analysis & Verification Recommendation */}
                <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-2">
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900">Why this matters:</strong> {conf.why_it_matters}
                  </div>
                  <div className="text-xs text-brand-900 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <strong>Recommended Next Action:</strong> {conf.recommended_action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
