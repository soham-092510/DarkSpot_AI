"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, MailCheck } from "lucide-react";
import { verifyEmail } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (token) {
      handleVerification(token);
    }
  }, [token]);

  const handleVerification = async (verifyToken: string) => {
    setLoading(true);
    setErrorMessage("");
    try {
      await verifyEmail({ token: verifyToken });
      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to verify email. The token may be expired or already used.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
          {success ? <CheckCircle2 className="h-7 w-7 text-emerald-600" /> : <MailCheck className="h-7 w-7 text-brand-600" />}
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {success ? "Email Verified Successfully" : "Email Verification"}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {success
              ? "Your DarkSpot AI account is fully confirmed and verified."
              : "Verifying your security credentials with the platform..."}
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 text-left">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {loading && (
          <p className="text-xs text-slate-500 animate-pulse">
            Validating security token with encryption engine...
          </p>
        )}

        {success && (
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              <span>Continue to Research Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {!token && !success && (
          <div className="text-xs text-slate-500">
            No verification token found in URL. Please check the link from your confirmation email.
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Verifying session...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
