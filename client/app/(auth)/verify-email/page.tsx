"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [resendTimer, setResendTimer] = useState(60);
  const canResend = resendTimer === 0;

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleResend = () => {
    setResendTimer(60);
    toast.success("Verification email resent!", {
      description: "Please check your inbox and spam folder.",
    });
  };

  return (
    <AuthLayout>
      <AuthCard className="max-w-md w-full text-center">
        <div className="flex justify-center mb-2">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#3D5AFE]/15 border border-[#3D5AFE]/30 text-[#00D9C0] shadow-[0_0_25px_rgba(61,90,254,0.3)]">
            <Mail className="h-8 w-8 animate-bounce" />
          </div>
        </div>

        <AuthHeader
          title="Verify Your Email 📩"
          subtitle="We've sent a verification link to your registered email address."
          align="center"
        />

        <div className="my-6 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-[#8A90A6] text-left space-y-2">
          <div className="flex items-center gap-2 text-white font-medium">
            <CheckCircle2 className="h-4 w-4 text-[#00D9C0]" /> Next steps:
          </div>
          <p>1. Open your inbox and click the verification link.</p>
          <p>2. Once verified, your account permissions will activate automatically.</p>
        </div>

        <div className="space-y-3 w-full">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3D5AFE] py-3.5 px-4 text-sm font-semibold text-white shadow-[0_0_20px_rgba(61,90,254,0.4)] hover:bg-[#3D5AFE]/90 transition-all cursor-pointer"
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-3 px-4 text-xs sm:text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${!canResend ? "animate-spin" : ""}`} />
            <span>
              {canResend ? "Resend Verification Email" : `Resend available in ${resendTimer}s`}
            </span>
          </button>
        </div>

        <div className="pt-4 text-center text-xs text-[#8A90A6]">
          Wrong email address?{" "}
          <Link href="/register" className="text-[#00D9C0] hover:underline font-medium">
            Register again
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
