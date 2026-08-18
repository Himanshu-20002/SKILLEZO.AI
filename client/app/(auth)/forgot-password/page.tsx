"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import { cn } from "@/lib/utils";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email address is required" })
    .email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmittedEmail(data.email);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <AuthLayout>
      <AuthCard className="max-w-md w-full">
        {!isSubmitted ? (
          <>
            <AuthHeader
              title="Forgot Password? 🔑"
              subtitle="Enter your registered email address and we'll send you instructions to reset your password."
            />

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs sm:text-sm font-medium text-white/90">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 text-[#8A90A6]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    disabled={isSubmitting}
                    {...register("email")}
                    className={cn(
                      "w-full rounded-xl bg-[#0B1130]/80 border border-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-[#8A90A6]/60",
                      "transition-all duration-200 outline-none",
                      "focus:border-[#3D5AFE] focus:ring-2 focus:ring-[#3D5AFE]/30 focus:bg-[#0B1130]",
                      "hover:border-white/20",
                      errors.email && "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20",
                      isSubmitting && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-400 font-medium mt-0.5 animate-fadeIn">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "relative flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#3D5AFE] py-3.5 px-4 text-sm font-semibold text-white",
                  "shadow-[0_0_20px_rgba(61,90,254,0.4)] transition-all duration-300",
                  "hover:bg-[#3D5AFE]/90 hover:shadow-[0_0_30px_rgba(61,90,254,0.6)] hover:scale-[1.01]",
                  "active:scale-[0.99] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/50",
                  isSubmitting && "opacity-80 cursor-wait hover:scale-100"
                )}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#8A90A6] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center text-center space-y-5 py-2">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#00D9C0]/15 border border-[#00D9C0]/30 text-[#00D9C0]">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-white">Check Your Email 📧</h2>
              <p className="text-sm text-[#8A90A6] leading-relaxed max-w-sm">
                We have sent a password reset link to{" "}
                <span className="font-semibold text-white">{submittedEmail}</span>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-[#8A90A6] text-left w-full space-y-1">
              <p>• Didn&apos;t receive an email? Check your spam folder.</p>
              <p>• Links expire after 30 minutes for security.</p>
            </div>

            <div className="flex flex-col gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="w-full rounded-xl bg-white/10 hover:bg-white/15 py-3 text-xs sm:text-sm font-medium text-white transition-colors cursor-pointer"
              >
                Resend Link
              </button>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-[#00D9C0] hover:underline cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
