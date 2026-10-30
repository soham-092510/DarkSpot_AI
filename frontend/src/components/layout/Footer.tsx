import Link from "next/link";
import { ShieldAlert, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-8 text-xs text-slate-700">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-brand-600" />
          <span className="font-semibold text-slate-900">DarkSpot AI</span>
          <span>— Evidence-First Information Gap Detection Platform</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
            Enterprise Intelligence v1.0
          </span>
          <Link
            href="/demo"
            className="flex items-center gap-1 font-medium text-brand-600 hover:underline"
          >
            <span>Live Demonstration</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
          <a
            href="https://github.com/soham-092510/DarkSpot_AI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900 hover:underline"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
