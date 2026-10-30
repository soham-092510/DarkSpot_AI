"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, Sparkles, ArrowRight, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  const handleQuickDemo = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-900 text-white shadow-sm">
            <ShieldAlert className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
            Sign in to DarkSpot AI
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            AI-Assisted Information Gap Detection Platform
          </p>
        </div>

        {/* Quick Demo Access */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-center">
          <span className="text-[10px] font-bold uppercase text-brand-800 block">
            Instant Demo Access
          </span>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            <span>Enter as Lead Researcher (Instant Access)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="researcher@darkspot.ai"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          New to DarkSpot AI?{" "}
          <Link href="/signup" className="font-semibold text-brand-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
