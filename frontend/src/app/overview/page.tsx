import Link from "next/link";
import {
  ShieldAlert,
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Layers,
  Search,
  CheckSquare,
  FileSpreadsheet,
} from "lucide-react";

export default function OverviewPage() {
  const problemCards = [
    {
      title: "Information Gaps",
      desc: "Crucial requirements, deadlines, and renewal policies omitted across reviewed sources.",
      icon: HelpCircle,
      badge: "Incomplete Data",
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: "Conflicting Claims",
      desc: "Contradictory criteria, differing income ceilings, or mismatched rules between sources.",
      icon: AlertTriangle,
      badge: "Cross-Source Conflict",
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      title: "Outdated Information",
      desc: "Expired academic notices, prior application cycles, and unmaintained web portals.",
      icon: Clock,
      badge: "Temporal Decay",
      color: "text-orange-600 bg-orange-50 border-orange-200",
    },
    {
      title: "Unanswered Questions",
      desc: "User research inquiries that none of the available documentation resolves.",
      icon: Search,
      badge: "Blind Spots",
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: "Lack of Verification Guidance",
      desc: "Users left without a prioritized, evidence-backed action plan before taking high-stakes decisions.",
      icon: CheckSquare,
      badge: "Action Deficit",
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
  ];

  const innovations = [
    {
      title: "Evidence Coverage Matrix",
      desc: "Deconstructs research questions into weighted dimensions. Computes a deterministic Coverage Index and links every finding to verbatim source excerpts.",
      metric: "Weighted Coverage Formula",
      route: "/demo",
      icon: FileSpreadsheet,
      accent: "from-blue-600 to-indigo-600",
    },
    {
      title: "Contradiction Engine",
      desc: "Pairwise cross-source verification comparing atomic claims side-by-side with semantic divergence scores.",
      metric: "Pairwise Semantic Cross-Check",
      route: "/demo",
      icon: AlertTriangle,
      accent: "from-rose-500 to-red-600",
    },
    {
      title: "Gap & Blind-Spot Detection",
      desc: "Identifies absent criteria and unaddressed requirements with priority weighting to eliminate hidden omissions.",
      metric: "Deterministic Blind-Spot Scoring",
      route: "/demo",
      icon: HelpCircle,
      accent: "from-amber-500 to-orange-600",
    },
    {
      title: "Verification Action Plan",
      desc: "Interactive, priority-ranked checklist guiding analysts on exact primary contacts, circulars, and steps to verify.",
      metric: "Ranked Action Plan",
      route: "/demo",
      icon: CheckSquare,
      accent: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-6 py-20 text-center text-white shadow-xl sm:px-12 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.25),rgba(255,255,255,0))]" />
        
        <div className="relative mx-auto max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-blue-300" />
            <span>AI-Powered Research Intelligence & Blind-Spot Detection</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            See What&apos;s Missing.
            <span className="block bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent mt-2">
              Before Making High-Stakes Decisions.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg">
            DarkSpot AI surfaces hidden omissions, flags contradictory circulars, scores research blind spots,
            and produces verifiable action plans across scholarship programs, policy audits, clinical guidelines, and regulatory filings.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-all"
            >
              <span>Sign In to Platform</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur-md hover:bg-slate-700 hover:text-white active:scale-95 transition-all"
            >
              <Compass className="h-4 w-4 text-blue-400" />
              <span>Explore Interactive Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* The 5 Critical Problem Categories */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Why Traditional Search Fails High-Stakes Research
          </h2>
          <p className="text-sm text-slate-600">
            Search engines find matching keywords; they cannot synthesize multi-source omissions or warn you about what is dangerously absent.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problemCards.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${p.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                    <span>{p.badge}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Innovations */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <Layers className="h-3.5 w-3.5" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Engineered for Precision & Verifiability
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {innovations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.route}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} text-white shadow-md`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md">
                      {item.metric}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>Explore in live showcase</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
