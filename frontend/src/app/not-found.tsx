import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, PlusCircle, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md mb-6">
        <ShieldAlert className="h-8 w-8 text-blue-400" />
      </div>

      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-brand-700 border border-blue-200 uppercase tracking-widest">
        404 — Information Blind-Spot
      </span>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Page or Dossier Not Found
      </h1>

      <p className="mt-3 max-w-md text-xs text-slate-500 leading-relaxed mx-auto">
        The research dossier, finding, or platform resource you requested could not be located in the current workspace.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Research Dashboard</span>
        </Link>

        <Link
          href="/research/new"
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Investigation</span>
        </Link>

        <Link
          href="/demo"
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <Sparkles className="h-4 w-4 text-brand-600" />
          <span>Explore Demo</span>
        </Link>
      </div>
    </div>
  );
}
