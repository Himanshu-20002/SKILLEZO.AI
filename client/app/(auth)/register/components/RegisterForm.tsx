"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Check, AlertCircle } from "lucide-react";
import PasswordInput from "@/components/auth/PasswordInput";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import { cn } from "@/lib/utils";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";

// Register Schema with Zod validation rules
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, { message: "Full name is required" })
      .min(3, { message: "Full name must be at least 3 characters long" }),
    email: z
      .string()
      .min(1, { message: "Email address is required" })
      .email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Service and Privacy Policy to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.fullName,
      });

      if (res.error) {
        const errorMsg = res.error.message || "Failed to create account. Please try again.";
        setAuthError(errorMsg);
        toast.error("Registration Failed", { description: errorMsg });
      } else {
        toast.success("Account Created!", { description: "Your account has been created successfully." });
        router.push("/dashboard");
      }
    } catch (err: any) {
      const fallbackMsg = err?.message || "An unexpected error occurred during registration.";
      setAuthError(fallbackMsg);
      toast.error("Error", { description: fallbackMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
      {authError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{authError}</span>
        </div>
      )}
      {/* Full Name Input */}
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-xs sm:text-sm font-medium text-white/90">
          Full Name
        </label>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-3.5 text-[#8A90A6]">
            <User className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Alex Morgan"
            disabled={isSubmitting}
            {...register("fullName")}
            className={cn(
              "w-full rounded-xl bg-[#0B1130]/80 border border-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-[#8A90A6]/60",
              "transition-all duration-200 outline-none",
              "focus:border-[#3D5AFE] focus:ring-2 focus:ring-[#3D5AFE]/30 focus:bg-[#0B1130]",
              "hover:border-white/20",
              errors.fullName && "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
        {errors.fullName && (
          <p className="text-xs text-rose-400 font-medium mt-0.5 animate-fadeIn">
            {errors.fullName.message}
          </p>
        )}
      </div>

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

      {/* Confirm Password Input */}
      <PasswordInput
        label="Confirm Password"
        placeholder="••••••••"
        disabled={isSubmitting}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {/* Terms & Conditions Checkbox */}
      <div className="flex flex-col gap-1 w-full pt-1">
        <label className={cn("inline-flex items-start gap-2.5 cursor-pointer select-none text-xs sm:text-sm text-[#8A90A6] hover:text-white transition-colors", isSubmitting && "opacity-50 cursor-not-allowed")}>
          <div className="relative grid place-items-center mt-0.5 shrink-0">
            <input
              type="checkbox"
              disabled={isSubmitting}
              {...register("termsAccepted")}
              className="peer sr-only"
            />
            <div
              className={cn(
                "h-4 w-4 rounded border border-white/20 bg-[#0B1130] transition-all duration-200",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-[#3D5AFE]/50",
                "peer-checked:bg-[#3D5AFE] peer-checked:border-[#3D5AFE]",
                "hover:border-white/40"
              )}
            />
            <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100" />
          </div>
          <span className="leading-tight">
            I agree to the{" "}
            <Link
              href="#terms"
              className="text-[#00D9C0] hover:underline underline-offset-4 font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="#privacy"
              className="text-[#00D9C0] hover:underline underline-offset-4 font-medium"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {errors.termsAccepted && (
          <p className="text-xs text-rose-400 font-medium mt-0.5">
            {errors.termsAccepted.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
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
            <span>Creating Account...</span>
          </>
        ) : (
          <span>Create Account</span>
        )}
      </button>
    </form>
  );
}
