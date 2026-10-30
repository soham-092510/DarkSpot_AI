"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Compass,
  Sparkles,
  Menu,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Key,
} from "lucide-react";
import { useUserProfile } from "@/lib/user";

export function Navbar() {
  const pathname = usePathname();
  const { isAuth, profile } = useUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs group-hover:bg-brand-600 transition-colors">
              <ShieldAlert className="h-5 w-5 text-blue-400 group-hover:text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">DarkSpot AI</span>
                <span className="rounded bg-blue-50 px-1.5 py-0.2 text-[9px] font-bold text-brand-700 border border-blue-200 uppercase">
                  SaaS
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500">See What&apos;s Missing</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
            <Link
              href="/demo"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                pathname === "/demo"
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              <span>Interactive Demo</span>
            </Link>

            {isAuth && (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    pathname === "/dashboard"
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-slate-500" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/onboarding"
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    pathname === "/onboarding"
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Key className="h-3.5 w-3.5 text-slate-500" />
                  <span>BYOK Setup</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuth ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Workspace ({profile.name.split(" ")[0]})</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 active:scale-[0.98] transition"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:hidden space-y-3">
          <Link
            href="/demo"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Sparkles className="h-4 w-4 text-brand-600" />
            <span>Interactive Demo</span>
          </Link>

          {isAuth ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-500" />
                <span>Dashboard Workspace</span>
              </Link>
              <Link
                href="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Key className="h-4 w-4 text-slate-500" />
                <span>BYOK API Keys</span>
              </Link>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-300 py-2 text-xs font-semibold text-slate-700"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1 rounded-xl bg-brand-600 py-2 text-xs font-semibold text-white"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
