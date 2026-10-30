"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Compass,
  Plus,
  Trash2,
  UploadCloud,
  FileText,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  Globe,
  FileCheck,
  CheckCircle2,
  Clock,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { createProject, uploadDocument } from "@/lib/api";

function NewResearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [depth, setDepth] = useState<"standard" | "deep">("standard");
  const [urls, setUrls] = useState<string[]>([""]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill from query parameter if present
  useEffect(() => {
    const topicParam = searchParams.get("topic");
    if (topicParam) {
      setTitle(topicParam);
      setQuestion(
        `What are the specific eligibility criteria, mandatory conditions, deadlines, and critical prerequisites for ${topicParam}?`
      );
    }
  }, [searchParams]);

  const quickTemplates = [
    {
      title: "Scholarship & Grant Verification",
      question:
        "What are the eligibility criteria, required income thresholds, deadline, and renewal conditions for the national merit scholarship?",
      tag: "Academic",
      icon: Sparkles,
      color: "bg-blue-50 text-brand-700 border-blue-200",
    },
    {
      title: "Corporate Compliance Audit",
      question:
        "What are the mandatory notification deadlines, audit requirements, and liability penalties under the updated data protection framework?",
      tag: "Governance",
      icon: ShieldAlert,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      title: "Clinical Trial & Healthcare Protocol",
      question:
        "What are the inclusion/exclusion criteria, primary efficacy endpoints, contraindications, and regulatory reporting requirements?",
      tag: "Biomedical",
      icon: FileCheck,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  const handleAddUrl = () => {
    setUrls([...urls, ""]);
  };

  const handleUrlChange = (index: number, val: string) => {
    const updated = [...urls];
    updated[index] = val;
    setUrls(updated);
  };

  const handleRemoveUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles([...files, ...selected]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const applyTemplate = (t: { title: string; question: string }) => {
    setTitle(t.title);
    setQuestion(t.question);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !question.trim()) {
      setError("Please provide a research title and question.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const validUrls = urls.map((u) => u.trim()).filter((u) => u.length > 5);

      // 1. Create project
      const project = await createProject({
        title: title.trim(),
        topic_question: question.trim(),
        depth,
        urls: validUrls,
      });

      // 2. Upload any documents
      for (const file of files) {
        await uploadDocument(project.id, file);
      }

      // 3. Redirect to workspace
      router.push(`/research/${project.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to start research.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
              <Compass className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Start Evidence Analysis
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Deconstruct inquiry questions, cross-verify multiple sources, and isolate hidden information gaps.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5 text-brand-600" />
          <span>Estimated duration: <strong>15–30s</strong></span>
        </div>
      </div>

      {/* Quick Investigation Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quick Investigation Templates
          </h2>
          <span className="text-[11px] text-slate-400">
            Click to auto-populate scope
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickTemplates.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.title}
                type="button"
                onClick={() => applyTemplate(t)}
                className="group relative flex flex-col justify-between text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-brand-400 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${t.color}`}
                    >
                      {t.tag}
                    </span>
                    <Icon className="h-4 w-4 text-slate-400 group-hover:text-brand-600 transition" />
                  </div>
                  <h3 className="mt-3 text-xs font-bold text-slate-900 group-hover:text-brand-600 transition">
                    {t.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {t.question}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-brand-600">
                  <span>Use template</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Core Inquiry & Scope */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                1. Investigation Scope & Depth
              </h2>
              <p className="text-[11px] text-slate-500">
                Define the core inquiry and configure analysis granularity.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
              Required
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Research Workspace Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ABC Merit Scholarship 2026 Guidelines & Verification"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Research Question or Hypothesis
            </label>
            <textarea
              required
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What are the specific eligibility requirements, financial thresholds, deadlines, and prerequisites that must be corroborated?"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Analysis Depth
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer text-xs transition ${
                  depth === "standard"
                    ? "border-brand-500 bg-blue-50/50 text-brand-950 font-semibold ring-1 ring-brand-500"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="depth"
                  value="standard"
                  checked={depth === "standard"}
                  onChange={() => setDepth("standard")}
                  className="text-brand-600 h-4 w-4"
                />
                <div>
                  <span className="block font-bold">Standard Analysis</span>
                  <span className="text-[11px] text-slate-500">
                    Fast multi-source crawl, 5 dimensions, core contradiction scan
                  </span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer text-xs transition ${
                  depth === "deep"
                    ? "border-brand-500 bg-blue-50/50 text-brand-950 font-semibold ring-1 ring-brand-500"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="depth"
                  value="deep"
                  checked={depth === "deep"}
                  onChange={() => setDepth("deep")}
                  className="text-brand-600 h-4 w-4"
                />
                <div>
                  <span className="block font-bold">Deep Forensic Audit</span>
                  <span className="text-[11px] text-slate-500">
                    Exhaustive cross-source corroboration, granular caveats & full dossier
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Card 2: Web Sources (URLs) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                2. Target Source URLs (Optional)
              </h2>
              <p className="text-[11px] text-slate-500">
                Provide specific links to analyze. If left empty, Tavily Search automatically gathers authoritative web pages.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddUrl}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add URL</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {urls.map((u, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Globe className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    value={u}
                    onChange={(e) => handleUrlChange(i, e.target.value)}
                    placeholder="https://example.gov.in/guidelines-2026.html"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
                {urls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(i)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Document Ingestion */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              3. Document Ingestion (Optional)
            </h2>
            <p className="text-[11px] text-slate-500">
              Upload local circulars, policy PDFs, or text documents (Up to 10MB each).
            </p>
          </div>

          <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-8 text-center hover:bg-slate-50 transition cursor-pointer">
            <UploadCloud className="h-10 w-10 text-brand-600 mb-2" />
            <p className="text-xs font-bold text-slate-900">
              Drag and drop documents here, or <span className="text-brand-600 underline">browse files</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supported formats: PDF, DOCX, TXT, CSV (up to 10MB)
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-400">
                Uploaded Files ({files.length}):
              </span>
              {files.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-700"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="h-4 w-4 text-brand-600 flex-shrink-0" />
                    <span className="truncate font-semibold">{f.name}</span>
                    <span className="text-[10px] text-slate-400">
                      ({(f.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-700 disabled:opacity-50 transition active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Launching Intelligence Pipeline...</span>
              </>
            ) : (
              <>
                <span>Start Evidence Analysis</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewResearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin text-brand-600" />
            <span>Loading Research Workspace Form...</span>
          </div>
        </div>
      }
    >
      <NewResearchContent />
    </Suspense>
  );
}
