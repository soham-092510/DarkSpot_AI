"use client";

import { Dimension } from "@/lib/api";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface BlindSpotRadarProps {
  dimensions: Dimension[];
}

export function BlindSpotRadar({ dimensions }: BlindSpotRadarProps) {
  if (!dimensions || dimensions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        No dimensions evaluated yet.
      </div>
    );
  }

  const statusScoreMap: Record<string, number> = {
    SUPPORTED: 100,
    PARTIALLY_SUPPORTED: 50,
    CONFLICTING: 25,
    NEEDS_VERIFICATION: 25,
    NOT_FOUND: 0,
  };

  const chartData = dimensions.map((d) => ({
    dimension: d.name.length > 18 ? d.name.substring(0, 16) + "..." : d.name,
    fullName: d.name,
    coverage: statusScoreMap[d.coverage_status] ?? 0,
    weight: d.importance_weight,
    status: d.coverage_status,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "#334155", fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#94a3b8", fontSize: 9 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md text-xs">
                    <p className="font-bold text-slate-900">{data.fullName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-slate-500">Evidence Status:</span>
                      <span className="font-semibold text-brand-600">{data.status}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-slate-500">Coverage Index:</span>
                      <span className="font-semibold text-slate-900">{data.coverage}%</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-slate-500">Weight:</span>
                      <span className="font-semibold text-slate-900">{data.weight}x</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Radar
            name="Evidence Coverage"
            dataKey="coverage"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
