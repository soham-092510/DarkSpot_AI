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

export default function HomePage() {
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
    },
    {
      title: "Contradiction Intelligence",
      desc: "Extracts atomic claims and performs cross-source semantic comparisons. Automatically differentiates genuine contradictions from contextual differences.",
      metric: "Semantic Discrepancy Engine",
    },
    {
      title: "Research Blind-Spot Radar",
      desc: "Visualizes information blind spots and synthesizes targeted unanswered questions with explicit explanations of why each omission matters.",
      metric: "Risk-Ranked Action Plan",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-brand-700 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              <span>AI-Assisted Information Gap & Contradiction Detection Platform</span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              See What Research <span className="text-brand-600">Misses.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Traditional tools tell you what they found. <strong>DarkSpot AI</strong> tells you what
              they found, what they couldn't establish, why the omissions matter, and exactly what you
              must verify next.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/research/new"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98] sm:w-auto"
              >
                <Compass className="h-4 w-4" />
                <span>Start New Research</span>
              </Link>
              <Link
                href="/demo"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 shadow-2xs transition hover:bg-slate-50 active:scale-[0.98] sm:w-auto"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Explore Evaluation Demo</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold text-slate-600 hover:text-slate-900 sm:w-auto"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Verbatim Source Evidence
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Zero Hallucinated Citations
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Transparent Uncertainty
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">
              The Digital Dark Spot Challenge
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why Existing Information Tools Are Insufficient
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Search engines index content and chatbots summarize answers, but neither systematically
              audits completeness, tracks contradictions, or warns you about blind spots.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {problemCards.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300 hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg border ${p.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {p.badge}
                      </span>
                    </div>
                    <h3 className="mt-4 text-sm font-bold text-slate-900">{p.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Signature Innovations */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Core Technical Differentiators
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
              Built for High-Stakes Decision Verification
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {innovations.map((inv, idx) => (
              <div
                key={inv.title}
                className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex rounded-lg bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 border border-brand-200">
                    {inv.metric}
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{inv.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600">{inv.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600">
                  <span>Explore in Live Demo</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10-Stage Pipeline Flow */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Deterministic & Traceable
            </h2>
            <p className="mt-1 text-xl font-bold text-slate-900">
              10-Stage Evidence Analysis Architecture
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {[
              "1. Question Deconstruction",
              "2. Safe Ingestion & Crawling",
              "3. Document Parsing (PyMuPDF)",
              "4. Atomic Claim Extraction",
              "5. Evidence Coverage Matrix",
              "6. Cross-Source Comparison",
              "7. Blind-Spot & Gap Engine",
              "8. Temporal Freshness Check",
              "9. Verification Prioritization",
              "10. Research Dossier Export",
            ].map((stage, i) => (
              <div
                key={stage}
                className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs font-medium text-slate-700"
              >
                <span className="block font-bold text-brand-600 mb-1">Stage {i + 1}</span>
                <span>{stage.split(". ")[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
