"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Lock,
  Search,
  Cpu,
  RefreshCw,
} from "lucide-react";
import {
  getCredentials,
  saveCredential,
  testCredential,
  ApiCredential,
} from "@/lib/api";
import { getStoredUser } from "@/lib/user";

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string }>({ name: "Researcher", email: "" });
  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(true);

  // Gemini state
  const [geminiKey, setGeminiKey] = useState("");
  const [testingGemini, setTestingGemini] = useState(false);
  const [savingGemini, setSavingGemini] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  // Tavily state
  const [tavilyKey, setTavilyKey] = useState("");
  const [testingTavily, setTestingTavily] = useState(false);
  const [savingTavily, setSavingTavily] = useState(false);
  const [tavilyStatus, setTavilyStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  useEffect(() => {
    setUser(getStoredUser());
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      setLoadingCreds(true);
      const data = await getCredentials();
      setCredentials(data);
    } catch {
      // Not authenticated or error
    } finally {
      setLoadingCreds(false);
    }
  };

  const hasGeminiConfigured = credentials.some((c) => c.provider === "gemini" && c.status === "valid");
  const hasTavilyConfigured = credentials.some((c) => c.provider === "tavily" && c.status === "valid");

  const handleTestGemini = async () => {
    if (!geminiKey.trim()) {
      setGeminiStatus({ type: "error", message: "Please enter a Google Gemini API key to test." });
      return;
    }
    setTestingGemini(true);
    setGeminiStatus({ type: null, message: "" });
    try {
      const res = await testCredential("gemini", geminiKey.trim());
      if (res.valid) {
        setGeminiStatus({ type: "success", message: res.message });
      } else {
        setGeminiStatus({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setGeminiStatus({ type: "error", message: err.message || "Key test failed." });
    } finally {
      setTestingGemini(false);
    }
  };

  const handleSaveGemini = async () => {
    if (!geminiKey.trim()) {
      setGeminiStatus({ type: "error", message: "Please enter your Google Gemini API key." });
      return;
    }
    setSavingGemini(true);
    setGeminiStatus({ type: null, message: "" });
    try {
      await saveCredential("gemini", geminiKey.trim());
      setGeminiStatus({ type: "success", message: "Google Gemini key encrypted and saved successfully!" });
      setGeminiKey("");
      await loadCredentials();
    } catch (err: any) {
      setGeminiStatus({ type: "error", message: err.message || "Failed to save Gemini key." });
    } finally {
      setSavingGemini(false);
    }
  };

  const handleTestTavily = async () => {
    if (!tavilyKey.trim()) {
      setTavilyStatus({ type: "error", message: "Please enter a Tavily API key to test." });
      return;
    }
    setTestingTavily(true);
    setTavilyStatus({ type: null, message: "" });
    try {
      const res = await testCredential("tavily", tavilyKey.trim());
      if (res.valid) {
        setTavilyStatus({ type: "success", message: res.message });
      } else {
        setTavilyStatus({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setTavilyStatus({ type: "error", message: err.message || "Key test failed." });
    } finally {
      setTestingTavily(false);
    }
  };

  const handleSaveTavily = async () => {
    if (!tavilyKey.trim()) {
      setTavilyStatus({ type: "error", message: "Please enter your Tavily Search API key." });
      return;
    }
    setSavingTavily(true);
    setTavilyStatus({ type: null, message: "" });
    try {
      await saveCredential("tavily", tavilyKey.trim());
      setTavilyStatus({ type: "success", message: "Tavily Search key encrypted and saved successfully!" });
      setTavilyKey("");
      await loadCredentials();
    } catch (err: any) {
      setTavilyStatus({ type: "error", message: err.message || "Failed to save Tavily key." });
    } finally {
      setSavingTavily(false);
    }
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Welcome Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 mb-3 shadow-xs">
          <Key className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome to DarkSpot AI, {user.name}
        </h1>
        <p className="mt-2 text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
          Configure your Bring-Your-Own-Key (BYOK) credentials below. Your keys remain entirely under your control,
          encrypted with authenticated <strong>AES-256-GCM</strong>, and decrypted strictly in volatile server memory during analysis.
        </p>
      </div>

      {/* Security Guarantee Banner */}
      <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <strong>Enterprise Security Architecture:</strong> DarkSpot AI never logs or displays your plaintext API keys in frontend responses.
          Keys are bound to your user account and protected against SSRF, prompt injection, and credential leakages.
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Google Gemini API Key */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-600 border border-blue-200">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">1. Google Gemini API Key</h2>
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                    Required for AI
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Powers atomic claim extraction, multi-dimensional gap detection, and contradiction analysis.
                </p>
              </div>
            </div>

            {hasGeminiConfigured && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Configured</span>
              </span>
            )}
          </div>

          {/* Active Key Mask if configured */}
          {hasGeminiConfigured && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Active Encrypted Key:</span>
                <code className="rounded bg-white px-2 py-0.5 font-mono font-semibold text-slate-800 border border-slate-200">
                  {credentials.find((c) => c.provider === "gemini")?.key_mask}
                </code>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">Validated & Ready</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {hasGeminiConfigured ? "Update Gemini API Key" : "Enter Gemini API Key"}
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:underline"
              >
                <span>Get a free key at Google AI Studio</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={handleTestGemini}
                disabled={testingGemini || !geminiKey.trim()}
                className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                {testingGemini ? "Testing..." : "Test"}
              </button>
              <button
                type="button"
                onClick={handleSaveGemini}
                disabled={savingGemini || !geminiKey.trim()}
                className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 disabled:opacity-40 transition-colors"
              >
                {savingGemini ? "Saving..." : "Save Key"}
              </button>
            </div>

            {/* Gemini Status Message */}
            {geminiStatus.type && (
              <div
                className={`mt-2.5 flex items-start gap-2 rounded-xl border p-3 text-xs ${
                  geminiStatus.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {geminiStatus.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <span>{geminiStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Tavily Search API Key */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">2. Tavily Search API Key</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                    Optional
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automates real-time authoritative web source discovery and government circular retrieval.
                </p>
              </div>
            </div>

            {hasTavilyConfigured && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Configured</span>
              </span>
            )}
          </div>

          {/* Active Key Mask if configured */}
          {hasTavilyConfigured && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Active Encrypted Key:</span>
                <code className="rounded bg-white px-2 py-0.5 font-mono font-semibold text-slate-800 border border-slate-200">
                  {credentials.find((c) => c.provider === "tavily")?.key_mask}
                </code>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">Validated & Ready</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {hasTavilyConfigured ? "Update Tavily Key" : "Enter Tavily API Key"}
              </label>
              <a
                href="https://app.tavily.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:underline"
              >
                <span>Get a free key (1,000 queries/mo)</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={tavilyKey}
                onChange={(e) => setTavilyKey(e.target.value)}
                placeholder="tvly-..."
                className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={handleTestTavily}
                disabled={testingTavily || !tavilyKey.trim()}
                className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                {testingTavily ? "Testing..." : "Test"}
              </button>
              <button
                type="button"
                onClick={handleSaveTavily}
                disabled={savingTavily || !tavilyKey.trim()}
                className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 disabled:opacity-40 transition-colors"
              >
                {savingTavily ? "Saving..." : "Save Key"}
              </button>
            </div>

            {/* Tavily Status Message */}
            {tavilyStatus.type && (
              <div
                className={`mt-2.5 flex items-start gap-2 rounded-xl border p-3 text-xs ${
                  tavilyStatus.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {tavilyStatus.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <span>{tavilyStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <Link
            href="/demo"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <Sparkles className="h-4 w-4 text-brand-600" />
            <span>Explore with pre-seeded demo first</span>
          </Link>

          <button
            type="button"
            onClick={handleFinish}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99] transition-all"
          >
            <span>Launch Research Intelligence Platform</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
