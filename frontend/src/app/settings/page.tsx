"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  ShieldCheck,
  Key,
  Database,
  Search,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    fetch("/health")
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch(() => setHealthStatus({ status: "offline" }));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          System Configuration & API Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify external service connectivity, model selection, and database status.
        </p>
      </div>

      <div className="space-y-6">
        {/* Backend & DB Health Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Engine & Database Health</h3>
                <p className="text-xs text-slate-500">FastAPI Backend & Relational Storage</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{healthStatus?.status === "ok" ? "Operational" : "Checking"}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-lg bg-slate-50 p-3">
              <span className="text-slate-500 block">Application</span>
              <strong className="text-slate-900">DarkSpot AI v1.0.0</strong>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <span className="text-slate-500 block">Database Engine</span>
              <strong className="text-slate-900">SQLite (Dev) / Postgres (Prod)</strong>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <span className="text-slate-500 block">SSRF Guard</span>
              <strong className="text-emerald-700">Active (RFC1918 Blocked)</strong>
            </div>
          </div>
        </div>

        {/* AI & Search API Providers */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Configured AI & Search Engines</h3>
            <p className="text-xs text-slate-500">External services powering structured gap detection</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-brand-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Google Gemini LLM Engine</h4>
                  <p className="text-[11px] text-slate-500">Model: gemini-2.0-flash / gemini-1.5-flash with structured JSON output</p>
                </div>
              </div>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
              >
                <span>Google AI Studio</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-brand-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Tavily Research Web Search</h4>
                  <p className="text-[11px] text-slate-500">Retrieves authoritative public web pages and circulars</p>
                </div>
              </div>
              <a
                href="https://app.tavily.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
              >
                <span>Tavily Portal</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50/70 p-3 border border-blue-200 text-xs text-brand-900 leading-relaxed">
            <strong>Security Notice:</strong> In compliance with security best practices, API keys are configured exclusively via server-side environment variables (<code className="rounded bg-blue-100 px-1 py-0.5">.env</code>) and are never exposed to the client browser.
          </div>
        </div>
      </div>
    </div>
  );
}
