"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Compass, PlusCircle, LayoutDashboard, Sparkles, Settings } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/research/new", label: "New Research", icon: PlusCircle },
    { href: "/demo", label: "Live Demo", icon: Sparkles, badge: "Sample" },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-900 text-white shadow-sm">
              <ShieldAlert className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">DarkSpot AI</span>
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700 border border-blue-200">
                  Shinchan 2026
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-700">See What's Missing</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-brand-600" : "text-slate-600"}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 border border-amber-200">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-700">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">Intelligence Engine Online</span>
          </div>
          <Link
            href="/research/new"
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
          >
            <Compass className="h-4 w-4" />
            <span>Launch Research</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
