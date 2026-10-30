"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  RefreshCw,
  Grid,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  GitCompare,
  FileText,
} from "lucide-react";
import {
  getProject,
  getDimensions,
  getClaims,
  getSources,
  Project,
  Dimension,
  Claim,
  Source,
} from "@/lib/api";
import { ResearchTabs } from "@/components/dashboard/ResearchTabs";

export default function EvidenceMatrixPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [proj, dims, clms, srcs] = await Promise.all([
          getProject(projectId),
          getDimensions(projectId),
          getClaims(projectId),
          getSources(projectId),
        ]);
        setProject(proj);
        setDimensions(dims);
        setClaims(clms);
        setSources(srcs);
        if (dims.length > 0) {
          setExpandedDim(dims[0].id);
        }
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
          <span>Loading Evidence Coverage Matrix...</span>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUPPORTED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PARTIALLY_SUPPORTED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CONFLICTING":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "NEEDS_VERIFICATION":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "NOT_FOUND":
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUPPORTED":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
      case "PARTIALLY_SUPPORTED":
        return <HelpCircle className="h-3.5 w-3.5 text-amber-600" />;
      case "CONFLICTING":
        return <GitCompare className="h-3.5 w-3.5 text-rose-600" />;
      case "NEEDS_VERIFICATION":
        return <AlertCircle className="h-3.5 w-3.5 text-orange-600" />;
      case "NOT_FOUND":
      default:
        return <HelpCircle className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Workspace Header */}
      <div className="border-b border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-600 uppercase">
                  Dimensional Verification
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">Traceable Provenance</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Evidence Coverage Matrix
              </h1>
              <p className="mt-1 text-xs text-slate-600">
                Deconstructs "{project.title}" into weighted dimensions and verifies each against atomic claims.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ResearchTabs projectId={project.id} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6">
        {/* Transparent Formula Header */}
        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/60 to-white p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                Deterministic Completeness Scoring
              </span>
              <p className="text-xs text-slate-700 mt-0.5">
                Formula: <code className="rounded bg-blue-100/60 px-1.5 py-0.5 font-mono text-brand-900 text-[11px]">Coverage = (Σ w_i · s_i) / (Σ w_i) × 100</code>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Where Supported = 1.0, Partial = 0.5, Conflicting/Needs Verification = 0.25, Not Found = 0.0.
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-3xl font-extrabold text-slate-900">{project.coverage_score}%</span>
              <span className="block text-[10px] font-semibold text-slate-500 uppercase">Current Score</span>
            </div>
          </div>
        </div>

        {/* Dimension Cards */}
        <div className="space-y-4">
          {dimensions.map((dim) => {
            const dimClaims = claims.filter(
              (c) => c.dimension_id === dim.id || c.subject.toLowerCase() === dim.name.toLowerCase()
            );
            const isExpanded = expandedDim === dim.id;

            return (
              <div
                key={dim.id}
                className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden transition"
              >
                <div
                  onClick={() => setExpandedDim(isExpanded ? null : dim.id)}
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">{getStatusIcon(dim.coverage_status)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{dim.name}</h3>
                        {dim.category && (
                          <span className="rounded bg-slate-100 px-2 py-0.2 text-[10px] font-medium text-slate-600">
                            {dim.category}
                          </span>
                        )}
                        <span className="rounded bg-blue-50 px-1.5 py-0.2 text-[10px] font-semibold text-brand-700 border border-blue-200">
                          {dim.importance_weight}x Weight
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{dim.explanation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getStatusBadge(
                        dim.coverage_status
                      )}`}
                    >
                      {dim.coverage_status.replace("_", " ")}
                    </span>
                    <button className="p-1 text-slate-400 hover:text-slate-700">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Claims Provenance */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Supporting Atomic Claims ({dimClaims.length})
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Exact Verbatim Provenance
                      </span>
                    </div>

                    {dimClaims.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
                        No factual claims found in the reviewed sources for this dimension.
                      </div>
                    ) : (
                      dimClaims.map((claim) => (
                        <div
                          key={claim.id}
                          className="rounded-lg border border-slate-200 bg-white p-4 space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              {claim.subject} {claim.predicate}
                            </span>
                            {claim.applicable_date_cycle && (
                              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                Cycle: {claim.applicable_date_cycle}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-800 font-medium">{claim.value}</p>

                          {claim.conditions && (
                            <p className="text-[11px] text-slate-500">
                              <strong>Conditions:</strong> {claim.conditions}
                            </p>
                          )}

                          <div className="rounded-md border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-700 italic">
                            "{claim.exact_excerpt}"
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <span className="truncate max-w-md font-medium text-slate-700">
                              Source: {claim.source_title || "Reviewed Webpage"}
                            </span>
                            {claim.source_url && (
                              <a
                                href={claim.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-brand-600 hover:underline font-semibold"
                              >
                                <span>Inspect Original</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
