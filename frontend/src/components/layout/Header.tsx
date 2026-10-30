"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  ShieldCheck,
  User,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useUserProfile } from "@/lib/user";

interface HeaderProps {
  onToggleMobile?: () => void;
}

export function Header({ onToggleMobile }: HeaderProps) {
  const router = useRouter();
  const { profile, logout } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/history?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      {/* Mobile Menu & Search */}
      <div className="flex flex-1 items-center gap-3 max-w-xl">
        <button
          type="button"
          onClick={onToggleMobile}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar Pill */}
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your research, sources, claims..."
            className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-12 text-xs text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <kbd className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:inline-block shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Engine Online Status Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/60 px-3 py-1 text-xs text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-800">Engine Online</span>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] font-semibold text-brand-600">Mark all read</span>
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="rounded-xl bg-blue-50/60 p-2.5 text-xs">
                  <p className="font-semibold text-slate-900">Analysis Completed</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    ABC Scholarship 2026 evaluated with 62.5% coverage score.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">5 minutes ago</span>
                </div>
                <div className="rounded-xl bg-amber-50/60 p-2.5 text-xs">
                  <p className="font-semibold text-slate-900">Contradiction Flagged</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Income ceiling conflict detected across 2 official portals.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">15 minutes ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white p-1 pr-3 text-left transition hover:border-slate-300 hover:shadow-2xs"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 font-semibold text-white text-xs shadow-xs">
              {profile.initials}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold leading-none text-slate-900">
                {profile.name}
              </p>
              <p className="text-[10px] font-medium leading-none text-slate-500 mt-0.5">
                {profile.role}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl z-50">
              <div className="border-b border-slate-100 px-4 py-2.5">
                <p className="text-xs font-bold text-slate-900">{profile.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{profile.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>Account Settings</span>
                </Link>
                <Link
                  href="/demo"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <span>Sample Casebook</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
