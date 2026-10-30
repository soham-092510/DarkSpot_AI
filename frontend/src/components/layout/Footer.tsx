"use client";

import Link from "next/link";
import { ShieldAlert, ExternalLink, Mail, Phone, Lock, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 bg-white py-12 text-xs text-slate-600 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs group-hover:bg-brand-600 transition-colors">
                <ShieldAlert className="h-4 w-4 text-blue-400 group-hover:text-white" />
              </div>
              <span className="text-sm font-bold text-slate-900">DarkSpot AI</span>
            </Link>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              See What&apos;s Missing. Enterprise intelligence platform for automated information gap, contradiction, and freshness detection.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>BYOK AES-256-GCM Encrypted</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/dashboard" className="text-slate-600 hover:text-brand-600 transition-colors">
                  Research Dashboard
                </Link>
              </li>
              <li>
                <Link href="/research/new" className="text-slate-600 hover:text-brand-600 transition-colors">
                  New Investigation
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-slate-600 hover:text-brand-600 transition-colors flex items-center gap-1">
                  <span>Interactive Casebook</span>
                  <span className="rounded bg-amber-50 px-1 py-0.2 text-[9px] font-bold text-amber-700 border border-amber-200">
                    Live
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-slate-600 hover:text-brand-600 transition-colors">
                  BYOK Credentials & Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Access */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Security & Auth
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/login" className="text-slate-600 hover:text-brand-600 transition-colors">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-slate-600 hover:text-brand-600 transition-colors">
                  Create Secure Account
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-slate-600 hover:text-brand-600 transition-colors">
                  BYOK Key Setup Wizard
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="text-slate-600 hover:text-brand-600 transition-colors">
                  Password Recovery
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Support & Contact */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Contact & Support
            </h4>
            <ul className="space-y-2.5 text-[11px]">
              <li>
                <a
                  href="mailto:support@darkspot.ai"
                  className="flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors group"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-600" />
                  <span>support@darkspot.ai</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+18005553275"
                  className="flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors group"
                >
                  <Phone className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-600" />
                  <span>+1 (800) 555-DARK</span>
                </a>
              </li>
              <li className="pt-1">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                  Engine Version 1.0.0
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Dynamic Year */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {currentYear} DarkSpot AI. All rights reserved. Built for rigorous investigative intelligence.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-800 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer">Security Whitepaper</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
