"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Lock,
  Trash2,
  User,
  ShieldAlert,
  Save,
  KeyRound,
  LogOut,
} from "lucide-react";
import {
  getCredentials,
  saveCredential,
  testCredential,
  deleteCredential,
  updateProfile,
  changePassword,
  deleteAccount,
  ApiCredential,
} from "@/lib/api";
import { useUserProfile } from "@/lib/user";

export default function SettingsPage() {
  const { profile, logout } = useUserProfile();
  const [activeTab, setActiveTab] = useState<"profile" | "byok" | "security">("byok");

  // Health state
  const [healthStatus, setHealthStatus] = useState<any>(null);

  // Profile Form state
  const [displayName, setDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: "",
  });

  // Credentials state
  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(true);

  // Gemini state
  const [geminiKey, setGeminiKey] = useState("");
  const [testingGemini, setTestingGemini] = useState(false);
  const [savingGemini, setSavingGemini] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: "",
  });

  // Tavily state
  const [tavilyKey, setTavilyKey] = useState("");
  const [testingTavily, setTestingTavily] = useState(false);
  const [savingTavily, setSavingTavily] = useState(false);
  const [tavilyStatus, setTavilyStatus] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: "",
  });

  // Change Password state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmNewPwd, setConfirmNewPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: "",
  });
  const [changingPwd, setChangingPwd] = useState(false);

  // Delete account confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setDisplayName(profile.name);
    fetch("/health")
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch(() => setHealthStatus({ status: "offline" }));

    loadCredentials();
  }, [profile.name]);

  const loadCredentials = async () => {
    try {
      setLoadingCreds(true);
      const data = await getCredentials();
      setCredentials(data);
    } catch {
      // not authenticated
    } finally {
      setLoadingCreds(false);
    }
  };

  const geminiCred = credentials.find((c) => c.provider === "gemini");
  const tavilyCred = credentials.find((c) => c.provider === "tavily");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: null, text: "" });
    try {
      await updateProfile({ full_name: displayName.trim() });
      setProfileMsg({ type: "success", text: "Profile details updated successfully." });
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTestGemini = async () => {
    if (!geminiKey.trim()) {
      setGeminiStatus({ type: "error", text: "Enter a Google Gemini API key to test." });
      return;
    }
    setTestingGemini(true);
    setGeminiStatus({ type: null, text: "" });
    try {
      const res = await testCredential("gemini", geminiKey.trim());
      if (res.valid) {
        setGeminiStatus({ type: "success", text: res.message });
      } else {
        setGeminiStatus({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setGeminiStatus({ type: "error", text: err.message || "Key test failed." });
    } finally {
      setTestingGemini(false);
    }
  };

  const handleSaveGemini = async () => {
    if (!geminiKey.trim()) {
      setGeminiStatus({ type: "error", text: "Enter your Google Gemini API key." });
      return;
    }
    setSavingGemini(true);
    setGeminiStatus({ type: null, text: "" });
    try {
      await saveCredential("gemini", geminiKey.trim());
      setGeminiStatus({ type: "success", text: "Google Gemini key validated and encrypted with AES-256-GCM." });
      setGeminiKey("");
      await loadCredentials();
    } catch (err: any) {
      setGeminiStatus({ type: "error", text: err.message || "Failed to save Gemini key." });
    } finally {
      setSavingGemini(false);
    }
  };

  const handleDeleteGemini = async () => {
    if (!confirm("Are you sure you want to remove your configured Google Gemini key?")) return;
    try {
      await deleteCredential("gemini");
      await loadCredentials();
      setGeminiStatus({ type: "success", text: "Google Gemini key removed." });
    } catch (err: any) {
      setGeminiStatus({ type: "error", text: err.message || "Failed to delete key." });
    }
  };

  const handleTestTavily = async () => {
    if (!tavilyKey.trim()) {
      setTavilyStatus({ type: "error", text: "Enter a Tavily API key to test." });
      return;
    }
    setTestingTavily(true);
    setTavilyStatus({ type: null, text: "" });
    try {
      const res = await testCredential("tavily", tavilyKey.trim());
      if (res.valid) {
        setTavilyStatus({ type: "success", text: res.message });
      } else {
        setTavilyStatus({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setTavilyStatus({ type: "error", text: err.message || "Key test failed." });
    } finally {
      setTestingTavily(false);
    }
  };

  const handleSaveTavily = async () => {
    if (!tavilyKey.trim()) {
      setTavilyStatus({ type: "error", text: "Enter your Tavily API key." });
      return;
    }
    setSavingTavily(true);
    setTavilyStatus({ type: null, text: "" });
    try {
      await saveCredential("tavily", tavilyKey.trim());
      setTavilyStatus({ type: "success", text: "Tavily key validated and encrypted with AES-256-GCM." });
      setTavilyKey("");
      await loadCredentials();
    } catch (err: any) {
      setTavilyStatus({ type: "error", text: err.message || "Failed to save Tavily key." });
    } finally {
      setSavingTavily(false);
    }
  };

  const handleDeleteTavily = async () => {
    if (!confirm("Are you sure you want to remove your configured Tavily key?")) return;
    try {
      await deleteCredential("tavily");
      await loadCredentials();
      setTavilyStatus({ type: "success", text: "Tavily key removed." });
    } catch (err: any) {
      setTavilyStatus({ type: "error", text: err.message || "Failed to delete key." });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg({ type: null, text: "" });

    if (newPwd.length < 12) {
      setPwdMsg({ type: "error", text: "New password must be at least 12 characters long." });
      return;
    }
    if (newPwd !== confirmNewPwd) {
      setPwdMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setChangingPwd(true);
    try {
      await changePassword({ current_password: currentPwd, new_password: newPwd });
      setPwdMsg({ type: "success", text: "Password changed successfully with Argon2id hashing!" });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmNewPwd("");
    } catch (err: any) {
      setPwdMsg({ type: "error", text: err.message || "Failed to change password." });
    } finally {
      setChangingPwd(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      logout();
    } catch (err: any) {
      alert(err.message || "Failed to delete account");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Account & Engine Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your researcher profile, configure Bring-Your-Own-Key (BYOK) encryption, and review security health.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("byok")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "byok"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Key className="h-4 w-4" />
          <span>BYOK API Credentials</span>
          {credentials.length > 0 && (
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.2 font-bold">
              {credentials.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Researcher Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "security"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Security & Encryption</span>
        </button>
      </div>

      {/* TAB 1: BYOK CREDENTIALS */}
      {activeTab === "byok" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-brand-900 flex items-start gap-3">
            <Lock className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>AES-256-GCM Authenticated Encryption:</strong> DarkSpot AI guarantees that your API keys are never stored in plaintext
              and are never returned in full to the client browser. They are decrypted in-memory solely when your research analysis job executes.
            </div>
          </div>

          {/* Google Gemini Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-brand-600 border border-blue-200">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Google Gemini LLM Key</h3>
                    {geminiCred ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Active ({geminiCred.status})</span>
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                        Not Configured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Powers Gemini-2.0-flash / Gemini-1.5-flash with structured atomic claim extraction
                  </p>
                </div>
              </div>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
              >
                <span>Google AI Studio</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {geminiCred && (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Stored Masked Key</span>
                  <code className="font-mono font-bold text-slate-900">{geminiCred.key_mask}</code>
                  {geminiCred.last_validated_at && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Last validated: {new Date(geminiCred.last_validated_at).toLocaleString()}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleDeleteGemini}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Key</span>
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {geminiCred ? "Replace Google Gemini API Key" : "Enter Google Gemini API Key"}
              </label>
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
                  className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  {testingGemini ? "Testing..." : "Test"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveGemini}
                  disabled={savingGemini || !geminiKey.trim()}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 disabled:opacity-40"
                >
                  {savingGemini ? "Saving..." : "Save Key"}
                </button>
              </div>

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
                  <span>{geminiStatus.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tavily Search Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Tavily Research Web Search</h3>
                    {tavilyCred ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Active ({tavilyCred.status})</span>
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enables automated discovery of live web sources and government gazette circulars
                  </p>
                </div>
              </div>

              <a
                href="https://app.tavily.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
              >
                <span>Tavily Portal</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {tavilyCred && (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Stored Masked Key</span>
                  <code className="font-mono font-bold text-slate-900">{tavilyCred.key_mask}</code>
                  {tavilyCred.last_validated_at && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Last validated: {new Date(tavilyCred.last_validated_at).toLocaleString()}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleDeleteTavily}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Key</span>
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tavilyCred ? "Replace Tavily API Key" : "Enter Tavily API Key"}
              </label>
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
                  className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  {testingTavily ? "Testing..." : "Test"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveTavily}
                  disabled={savingTavily || !tavilyKey.trim()}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 disabled:opacity-40"
                >
                  {savingTavily ? "Saving..." : "Save Key"}
                </button>
              </div>

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
                  <span>{tavilyStatus.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESEARCHER PROFILE */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Researcher Profile</h3>
                <p className="text-xs text-slate-500">Update your researcher name and details</p>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                Active Session
              </span>
            </div>

            {profileMsg.type && (
              <div
                className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
                  profileMsg.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {profileMsg.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{savingProfile ? "Saving..." : "Save Profile Changes"}</span>
              </button>
            </div>
          </form>

          {/* Session Logout Action */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">End Current Session</h4>
              <p className="text-[11px] text-slate-500">Sign out from DarkSpot AI on this device</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & ENCRYPTION */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Security Standards Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Security Architecture & Health</h3>
                <p className="text-xs text-slate-500">Verified cryptographic controls protecting your intelligence data</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Password Hashing</span>
                <strong className="text-emerald-700 block mt-0.5">Argon2id (RFC 9106)</strong>
                <span className="text-[10px] text-slate-400">m=65536, t=2, p=1</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">API Key Encryption</span>
                <strong className="text-emerald-700 block mt-0.5">AES-256-GCM</strong>
                <span className="text-[10px] text-slate-400">96-bit random nonce per key</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">SSRF Protection</span>
                <strong className="text-emerald-700 block mt-0.5">Active Guard</strong>
                <span className="text-[10px] text-slate-400">RFC1918 / Loopback blocked</span>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Change Account Password</h3>
              <p className="text-xs text-slate-500">Update your Argon2id encrypted account password (minimum 12 characters)</p>
            </div>

            {pwdMsg.type && (
              <div
                className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
                  pwdMsg.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {pwdMsg.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password (min. 12 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="At least 12 characters"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPwd}
                  onChange={(e) => setConfirmNewPwd(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={changingPwd}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>{changingPwd ? "Updating..." : "Update Password"}</span>
              </button>
            </div>
          </form>

          {/* Danger Zone: Delete Account */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                Danger Zone: Delete Account
              </h4>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              Permanently delete your user account, all configured BYOK keys, and associated research projects.
              This action is irreversible.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Account Permanently</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-rose-100 text-rose-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Account Deletion</h3>
                <p className="text-xs text-slate-500">This action will delete all your intelligence projects.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete your account and all associated encrypted credentials?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteAccount}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
