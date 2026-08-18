"use client";

import Link from "next/link";
import { ShieldAlert, HelpCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";

export default function AccountSuspendedPage() {
  const handleContactSupport = () => {
    toast.info("Support ticket initiated", {
      description: "Our security team has been notified. We will reach out via email shortly.",
    });
  };

  return (
    <AuthLayout>
      <AuthCard className="max-w-md w-full text-center">
        <div className="flex justify-center mb-2">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
            <ShieldAlert className="h-8 w-8" />
          </div>
        </div>

        <AuthHeader
          title="Account Suspended ⚠️"
          subtitle="Access to your SKILLEZO account has been temporarily restricted."
          align="center"
        />

        <div className="my-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-[#8A90A6] text-left space-y-2">
          <p className="text-amber-300 font-semibold">Possible Reasons:</p>
          <p>• Unusual login activity or security policy violation.</p>
          <p>• Multiple failed authentication attempts.</p>
          <p>• Administrative security hold pending verification.</p>
        </div>

        <div className="space-y-3 w-full">
          <button
            type="button"
            onClick={handleContactSupport}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3D5AFE] py-3.5 px-4 text-sm font-semibold text-white shadow-[0_0_20px_rgba(61,90,254,0.4)] hover:bg-[#3D5AFE]/90 transition-all cursor-pointer"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Contact Support</span>
          </button>

          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-3 px-4 text-xs sm:text-sm font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
