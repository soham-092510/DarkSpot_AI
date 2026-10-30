"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Grid,
  GitCompare,
  HelpCircle,
  FileText,
  CheckSquare,
  FileSpreadsheet,
} from "lucide-react";

interface ResearchTabsProps {
  projectId: string;
  isDemo?: boolean;
  counts?: {
    sources?: number;
    gaps?: number;
    conflicts?: number;
    tasks?: number;
  };
}

export function ResearchTabs({ projectId, isDemo = false, counts }: ResearchTabsProps) {
  const pathname = usePathname();
  const basePath = isDemo ? `/demo` : `/research/${projectId}`;

  const tabs = [
    {
      href: basePath,
      label: "Workspace Overview",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `${basePath}/evidence`,
      label: "Evidence Matrix",
      icon: Grid,
      badge: "Formula",
    },
    {
      href: `${basePath}/conflicts`,
      label: "Contradictions",
      icon: GitCompare,
      count: counts?.conflicts,
      badgeColor: "bg-rose-100 text-rose-800",
    },
    {
      href: `${basePath}/gaps`,
      label: "Missing Gaps",
      icon: HelpCircle,
      count: counts?.gaps,
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      href: `${basePath}/sources`,
      label: "Source Explorer",
      icon: FileSpreadsheet,
      count: counts?.sources,
    },
    {
      href: `${basePath}/checklist`,
      label: "Verification Checklist",
      icon: CheckSquare,
      count: counts?.tasks,
      badgeColor: "bg-brand-100 text-brand-800",
    },
    {
      href: `${basePath}/report`,
      label: "Research Dossier",
      icon: FileText,
      badge: "Export",
    },
  ];

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact ? pathname === tab.href : pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700 shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-brand-600" : "text-slate-500"
                  }`}
                />
                <span>{tab.label}</span>
                {typeof tab.count === "number" && tab.count > 0 && (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      tab.badgeColor || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-medium text-slate-600 border border-slate-200">
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
