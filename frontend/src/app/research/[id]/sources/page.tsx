"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  RefreshCw,
  FileSpreadsheet,
  Globe,
  FileText,
  ExternalLink,
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { getProject, getSources, addSourceUrl, Project, Source } from "@/lib/api";
import { ResearchTabs } from "@/components/dashboard/ResearchTabs";

export default function SourceExplorerPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const loadData = async () => {
    try {
      const [proj, srcs] = await Promise.all([
        getProject(projectId),
        getSources(projectId),
      ]);
      setProject(proj);
      setSources(srcs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    try {
      setAdding(true);
      await addSourceUrl(projectId, newUrl.trim());
      setNewUrl("");
      await loadData();
    } catch (err: any) {
      alert("Failed to add URL: " + err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
          <span>Loading Source Explorer...</span>
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
                <span className="text-xs font-bold text-brand-600 uppercase">
                  Source Provenance
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">Audit Trail</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Source Explorer
              </h1>
              <p className="mt-1 text-xs text-slate-600">
                Inspect crawled web materials, uploaded documents, extracted chunks, and publication dates.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ResearchTabs projectId={project.id} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-6">
        {/* Add Source Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <form onSubmit={handleAddUrl} className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="url"
              required
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Add another source URL for comparative analysis (e.g. https://portal.gov.in/notice.html)"
              className="flex-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={adding}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{adding ? "Ingesting..." : "Ingest Source"}</span>
            </button>
          </form>
        </div>

        {/* Source List */}
        <div className="space-y-4">
          {sources.map((src, i) => (
            <div
              key={src.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-brand-600 mt-0.5 border border-blue-200">
                    {src.source_type === "webpage" ? (
                      <Globe className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{src.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Publisher: <strong>{src.publisher_domain || "Unknown"}</strong></span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {src.publication_date ? `Published: ${src.publication_date}` : "Undated Material"}
                      </span>
                      <span>·</span>
                      <span className="capitalize">Type: {src.source_type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      src.status === "extracted"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {src.status}
                  </span>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-brand-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {src.content_preview && (
                <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-600 leading-relaxed font-mono">
                  {src.content_preview}
                </div>
              )}

              {src.error_message && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
                  {src.error_message}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
