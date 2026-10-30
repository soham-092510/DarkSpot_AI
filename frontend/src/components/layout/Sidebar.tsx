"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  History,
  Settings,
  ShieldAlert,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/research/new",
      label: "New Research",
      icon: PlusCircle,
    },
    {
      href: "/demo",
      label: "Live Demo",
      icon: Sparkles,
      badge: "Sample",
    },
    {
      href: "/history",
      label: "Research History",
      icon: History,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center border-b border-slate-100 px-5">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm ring-1 ring-slate-800">
            <ShieldAlert className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900">
                DarkSpot AI
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              See What's Missing.
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50 text-brand-700 shadow-xs ring-1 ring-blue-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? "text-brand-600"
                        : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 ring-1 ring-amber-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo Card */}
      <div className="p-3">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-800">
            <BookOpen className="h-4 w-4 text-brand-600" />
            <span>Smarter Research</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
            Surface hidden contradictions, calculate blind spots, and export executive dossiers in seconds.
          </p>
          <Link
            href="/demo"
            onClick={onCloseMobile}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 transition-colors"
          >
            <span>Explore Casebook</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
