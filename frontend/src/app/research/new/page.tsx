"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { createProject, uploadDocument } from "@/lib/api";

export default function NewResearchPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [depth, setDepth] = useState("standard");
  const [urls, setUrls] = useState<string[]>([""]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleTemplates = [
    {
      title: "Scholarship Verification 2026",
      question:
        "What are the eligibility criteria, required income thresholds, deadline, and renewal conditions for the national merit scholarship?",
    },
    {
      title: "AI Engineer Job Opportunity Verification",
      question:
        "What are the mandatory qualifications, salary range, remote policies, and interview stages for the AI Systems Engineer role?",
    },
    {
      title: "Corporate Data Privacy Compliance 2026",
      question:
        "What are the mandatory notification deadlines, audit requirements, and liability penalties under the updated data protection framework?",
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Launch Evidence-First Research
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          DarkSpot AI will deconstruct your question into research dimensions, gather sources,
          extract atomic claims, and detect what information is missing or contradictory.
        </p>
      </div>

      {/* Template Suggestions */}
      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Quick Investigation Templates:
        </span>
        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {sampleTemplates.map((t) => (
            <button
              key={t.title}
              type="button"
              onClick={() => applyTemplate(t)}
              className="text-left rounded-lg border border-blue-200 bg-white p-2.5 text-xs text-slate-700 hover:border-brand-500 hover:shadow-2xs transition"
            >
              <span className="font-bold text-slate-900 block truncate">{t.title}</span>
              <span className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{t.question}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Question */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Core Inquiry & Scope
          </h2>

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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Research Question or Goal
            </label>
            <textarea
              required
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What are the specific requirements, deadlines, and critical prerequisites that need to be verified?"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Research Depth
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer text-xs transition ${
                  depth === "standard"
                    ? "border-brand-500 bg-brand-50/50 text-brand-900 font-semibold"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="depth"
                  value="standard"
                  checked={depth === "standard"}
                  onChange={() => setDepth("standard")}
                  className="text-brand-600"
                />
                <div>
                  <span className="block font-bold">Standard Analysis</span>
                  <span className="text-[10px] text-slate-500">
                    5 Dimensions, fast crawl & claim verification
                  </span>
                </div>
              </label>

              <label
                className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer text-xs transition ${
                  depth === "deep"
                    ? "border-brand-500 bg-brand-50/50 text-brand-900 font-semibold"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="depth"
                  value="deep"
                  checked={depth === "deep"}
                  onChange={() => setDepth("deep")}
                  className="text-brand-600"
                />
                <div>
                  <span className="block font-bold">Deep Audit</span>
                  <span className="text-[10px] text-slate-500">
                    Comprehensive cross-source contradiction scan & full dossier
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* URLs Ingestion */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                2. Target Source URLs (Optional)
              </h2>
              <p className="text-[11px] text-slate-500">
                Provide specific links to compare. If left empty, Tavily web search will discover relevant sources.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddUrl}
              className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add URL</span>
            </button>
          </div>

          <div className="space-y-2">
            {urls.map((u, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="url"
                  value={u}
                  onChange={(e) => handleUrlChange(i, e.target.value)}
                  placeholder="https://example.gov.in/guidelines-2026.html"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {urls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(i)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Document Ingestion */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">
              3. Document Ingestion (Optional)
            </h2>
            <p className="text-[11px] text-slate-500">
              Upload PDF notices, Word circulars, or text documents (Up to 10MB each).
            </p>
          </div>

          <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:bg-slate-50 transition">
            <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              Drag and drop documents, or <span className="text-brand-600 underline">browse</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Supported formats: .pdf, .docx, .txt</p>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-1.5">
              {files.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 text-brand-600 flex-shrink-0" />
                    <span className="truncate">{f.name}</span>
                    <span className="text-[10px] text-slate-400">
                      ({(f.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Launch Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Launching Intelligence Pipeline...</span>
              </>
            ) : (
              <>
                <Compass className="h-4 w-4" />
                <span>Start Evidence Analysis</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
