"use client";

import { useState } from "react";
import { Dimension } from "@/lib/api";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PieChart as PieIcon, Activity } from "lucide-react";

interface BlindSpotRadarProps {
  dimensions: Dimension[];
  coverageScore?: number;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; score: number }
> = {
  SUPPORTED: {
    label: "Supported Evidence",
    color: "#10B981", // Emerald 500
    score: 100,
  },
  PARTIALLY_SUPPORTED: {
    label: "Partial Corroboration",
    color: "#3B82F6", // Blue 500
    score: 50,
  },
  NOT_FOUND: {
    label: "Information Gaps",
    color: "#F59E0B", // Amber 500
    score: 0,
  },
  CONFLICTING: {
    label: "Contradictions & Conflicts",
    color: "#EF4444", // Red 500
    score: 25,
  },
  NEEDS_VERIFICATION: {
    label: "Needs Field Verification",
    color: "#8B5CF6", // Purple 500
    score: 25,
  },
};

export function BlindSpotRadar({
  dimensions,
  coverageScore,
}: BlindSpotRadarProps) {
  const [viewMode, setViewMode] = useState<"donut" | "radar">("donut");

  if (!dimensions || dimensions.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
        <Activity className="h-8 w-8 text-slate-300 mb-2" />
        <p className="font-semibold text-slate-700">No Dimension Data Yet</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Dimensions will populate automatically once research analysis begins.
        </p>
      </div>
    );
  }

  // Calculate breakdown for Donut chart
  const statusCounts: Record<string, number> = {
    SUPPORTED: 0,
    PARTIALLY_SUPPORTED: 0,
    NOT_FOUND: 0,
    CONFLICTING: 0,
    NEEDS_VERIFICATION: 0,
  };

  dimensions.forEach((d) => {
    const key = d.coverage_status in statusCounts ? d.coverage_status : "NEEDS_VERIFICATION";
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  });

  const donutData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([statusKey, count]) => ({
      name: STATUS_CONFIG[statusKey]?.label || statusKey,
      count,
      color: STATUS_CONFIG[statusKey]?.color || "#94A3B8",
      statusKey,
      percentage: Math.round((count / dimensions.length) * 100),
    }));

  // Fallback if all counts are 0
  if (donutData.length === 0) {
    donutData.push({
      name: "Pending Assessment",
      count: dimensions.length,
      color: "#CBD5E1",
      statusKey: "PENDING",
      percentage: 100,
    });
  }

  // Data for multi-axis radar chart
  const radarData = dimensions.map((d) => ({
    dimension: d.name.length > 18 ? d.name.substring(0, 16) + "..." : d.name,
    fullName: d.name,
    coverage: STATUS_CONFIG[d.coverage_status]?.score ?? 25,
    weight: d.importance_weight,
    status: STATUS_CONFIG[d.coverage_status]?.label ?? d.coverage_status,
  }));

  const calculatedScore =
    coverageScore !== undefined
      ? Math.round(coverageScore)
      : Math.round(
          dimensions.reduce(
            (acc, d) => acc + (STATUS_CONFIG[d.coverage_status]?.score ?? 0),
            0
          ) / dimensions.length
        );

  return (
    <div className="flex flex-col">
      {/* View Toggle */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold text-slate-500">
          Distribution & Coverage Radar
        </span>
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setViewMode("donut")}
            className={`flex items-center gap-1 rounded-md px-2 py-1 font-semibold transition ${
              viewMode === "donut"
                ? "bg-white text-brand-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PieIcon className="h-3 w-3" />
            <span>Donut</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("radar")}
            className={`flex items-center gap-1 rounded-md px-2 py-1 font-semibold transition ${
              viewMode === "radar"
                ? "bg-white text-brand-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Activity className="h-3 w-3" />
            <span>Multi-Axis</span>
          </button>
        </div>
      </div>

      {viewMode === "donut" ? (
        <div className="flex flex-col items-center">
          {/* Circular Donut with Centered Score */}
          <div className="relative h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-md text-xs">
                          <p className="font-bold text-slate-900">{data.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {data.count} dimensions ({data.percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={3}
                  dataKey="count"
                  strokeWidth={2}
                  stroke="#ffffff"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Donut Value */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {calculatedScore}%
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-0.5">
                Coverage
              </span>
            </div>
          </div>

          {/* Color Breakdown Legend */}
          <div className="mt-2 w-full space-y-1.5 px-2">
            {donutData.map((item) => (
              <div
                key={item.statusKey}
                className="flex items-center justify-between text-xs py-0.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.count}</span>
                  <span className="text-[11px] text-slate-400 w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Multi-Axis Radar View */
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: "#334155", fontSize: 10, fontWeight: 500 }}
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
                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-md text-xs">
                        <p className="font-bold text-slate-900">{data.fullName}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-slate-500">Status:</span>
                          <span className="font-semibold text-brand-600">
                            {data.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-slate-500">Score:</span>
                          <span className="font-semibold text-slate-900">
                            {data.coverage}%
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-slate-500">Weight:</span>
                          <span className="font-semibold text-slate-900">
                            {data.weight}x
                          </span>
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
      )}
    </div>
  );
}
