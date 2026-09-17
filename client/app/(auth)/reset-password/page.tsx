"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import PasswordInput from "@/components/auth/PasswordInput";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, { message: "New password is required" })
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Reset token is missing. Please request a new password reset link.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authClient.resetPassword({
        newPassword: data.newPassword,
        token,
      });

      if (res?.error) {
        toast.error(res.error.message || "Failed to reset password. The link may have expired.");
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || errorParam === "INVALID_TOKEN") {
    return (
      <div className="flex flex-col items-center text-center space-y-5 py-2">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-white">Invalid or Expired Link</h2>
          <p className="text-sm text-[#8A90A6] leading-relaxed max-w-sm">
            This password reset link is invalid, has expired, or has already been used. Please request a fresh reset link.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full pt-2">
          <Link
            href="/forgot-password"
            className="w-full rounded-xl bg-[#3D5AFE] py-3.5 px-4 text-sm font-semibold text-white shadow-[0_0_20px_rgba(61,90,254,0.4)] hover:bg-[#3D5AFE]/90 transition-all cursor-pointer text-center"
          >
            Request New Reset Link
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-[#8A90A6] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center space-y-5 py-2">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#00D9C0]/15 border border-[#00D9C0]/30 text-[#00D9C0]">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-white">Password Reset Complete 🎉</h2>
          <p className="text-sm text-[#8A90A6] leading-relaxed max-w-sm">
            Your password has been successfully updated. You can now log in with your new credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full rounded-xl bg-[#3D5AFE] py-3.5 px-4 text-sm font-semibold text-white shadow-[0_0_20px_rgba(61,90,254,0.4)] hover:bg-[#3D5AFE]/90 transition-all cursor-pointer"
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

  return (
    <>
      <AuthHeader
        title="Reset Password 🔐"
        subtitle="Enter your new secure password below to regain access to your account."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full mt-4">
        <PasswordInput
          label="New Password"
          placeholder="••••••••"
          disabled={isSubmitting}
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <PasswordInput
          label="Confirm New Password"
          placeholder="••••••••"
          disabled={isSubmitting}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "relative flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#3D5AFE] py-3.5 px-4 text-sm font-semibold text-white mt-2",
            "shadow-[0_0_20px_rgba(61,90,254,0.4)] transition-all duration-300",
            "hover:bg-[#3D5AFE]/90 hover:shadow-[0_0_30px_rgba(61,90,254,0.6)] hover:scale-[1.01]",
            "active:scale-[0.99] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/50",
            isSubmitting && "opacity-80 cursor-wait hover:scale-100"
          )}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Resetting Password...</span>
            </>
          ) : (
            <span>Reset Password</span>
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
  );
}

function ResetPasswordFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-[#8A90A6]">Validating reset link...</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard className="max-w-md w-full">
        <Suspense fallback={<ResetPasswordFallback />}>
          <ResetPasswordForm />
        </Suspense>
      </AuthCard>
    </AuthLayout>
  );
}
