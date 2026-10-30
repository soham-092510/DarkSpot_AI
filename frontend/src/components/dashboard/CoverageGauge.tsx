"use client";

import { Info } from "lucide-react";

interface CoverageGaugeProps {
  score: number;
  totalDimensions: number;
  supportedCount: number;
  gapsCount: number;
  conflictsCount: number;
}

export function CoverageGauge({
  score,
  totalDimensions,
  supportedCount,
  gapsCount,
  conflictsCount,
}: CoverageGaugeProps) {
  // Determine color based on score
  let scoreColor = "text-emerald-600 border-emerald-500";
  let bgBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let verdict = "Robust Evidence Found";

  if (score < 40) {
    scoreColor = "text-rose-600 border-rose-500";
    bgBadge = "bg-rose-50 text-rose-700 border-rose-200";
    verdict = "Severe Information Gaps";
  } else if (score < 75) {
    scoreColor = "text-amber-600 border-amber-500";
    bgBadge = "bg-amber-50 text-amber-700 border-amber-200";
    verdict = "Critical Verification Needed";
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Evidence Coverage Index
          </h3>
          <p className="text-xs text-slate-400">Weighted evaluation across reviewed sources</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${bgBadge}`}>
          {verdict}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-6">
        <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full border-4 border-slate-100 bg-slate-50">
          <div className="text-center">
            <span className="text-2xl font-black tracking-tight text-slate-900">{score}%</span>
            <span className="block text-[9px] font-bold uppercase text-slate-600">Coverage</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Supported Dimensions:</span>
            <span className="font-bold text-emerald-700">{supportedCount} of {totalDimensions}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Missing Information Gaps:</span>
            <span className="font-bold text-amber-700">{gapsCount} detected</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Contradictory Claim Pairs:</span>
            <span className="font-bold text-rose-700">{conflictsCount} detected</span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2 flex">
            <div
              style={{ width: `${score}%` }}
              className="bg-brand-600 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-700 border border-slate-200">
        <Info className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Scientific Methodology:</strong> Measures completeness of verified criteria in the reviewed materials. 
          Not finding information in reviewed documents does not mean the information does not exist.
        </p>
      </div>
    </div>
  );
}
