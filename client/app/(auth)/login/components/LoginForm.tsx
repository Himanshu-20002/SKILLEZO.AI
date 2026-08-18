"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, AlertCircle } from "lucide-react";
import PasswordInput from "@/components/auth/PasswordInput";
import RememberMe from "@/components/auth/RememberMe";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import { cn } from "@/lib/utils";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";

// Login Schema with Zod validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email address is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (res.error) {
        const errorMsg = res.error.message || "Failed to sign in. Please check your credentials.";
        setAuthError(errorMsg);
        toast.error("Authentication Failed", { description: errorMsg });
      } else {
        toast.success("Welcome back!", { description: "Signed in successfully." });
        router.push("/dashboard");
      }
    } catch (err: any) {
      const fallbackMsg = err?.message || "An unexpected error occurred during sign in.";
      setAuthError(fallbackMsg);
      toast.error("Error", { description: fallbackMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full">
      {authError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{authError}</span>
        </div>
      )}

      {/* Email Input */}
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

      {/* Password Input */}
      <PasswordInput
        label="Password"
        placeholder="••••••••"
        disabled={isSubmitting}
        error={errors.password?.message}
        {...register("password")}
      />

      {/* Remember Me & Forgot Password Link */}
      <RememberMe
        disabled={isSubmitting}
        {...register("rememberMe")}
        rightSlot={
          <Link
            href="/forgot-password"
            className="font-medium text-[#00D9C0] hover:text-white transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            Forgot password?
          </Link>
        }
      />

      {/* Submit Button */}
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
            <span>Signing in...</span>
          </>
        ) : (
          <span>Continue</span>
        )}
      </button>
    </form>
  );
}