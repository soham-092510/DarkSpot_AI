"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/user";
import { getCredentials } from "@/lib/api";
import { ShieldAlert, Sparkles, Lock } from "lucide-react";

export default function RootGatewayPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If not authenticated, immediately redirect to Login as the primary entry point
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    // Authenticated user: check whether they need to complete BYOK onboarding
    getCredentials()
      .then((creds) => {
        const hasGemini = creds.some((c) => c.provider === "gemini" && c.status === "valid");
        if (!hasGemini) {
          router.replace("/onboarding");
        } else {
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        router.replace("/dashboard");
      })
      .finally(() => {
        setChecking(false);
      });
  }, [router]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
          <ShieldAlert className="h-8 w-8 text-blue-400" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">DarkSpot AI</h2>
          <p className="text-xs text-slate-500">
            Secure Intelligence Gateway · Initializing...
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          <span>Verifying secure session...</span>
        </div>
      </div>
    </div>
  );
}
