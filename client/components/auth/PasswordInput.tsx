"use client";

import { useState, forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightLabelSlot?: ReactNode;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = "Password", error, rightLabelSlot, className, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {(label || rightLabelSlot) && (
          <div className="flex items-center justify-between text-xs sm:text-sm">
            {label && (
              <label className="font-medium text-slate-700 dark:text-white/90">
                {label}
              </label>
            )}
            {rightLabelSlot}
          </div>
        )}

        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-3.5 text-slate-400">
            <Lock className="h-4 w-4" />
          </div>

          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            disabled={disabled}
            className={cn(
              "w-full rounded-xl bg-slate-50 dark:bg-[#0B1130]/80 border border-slate-200 dark:border-white/10 py-3 pl-10 pr-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#8A90A6]/60",
              "transition-all duration-200 outline-none",
              "focus:border-[#3D5AFE] focus:ring-2 focus:ring-[#3D5AFE]/30 focus:bg-white dark:focus:bg-[#0B1130]",
              "hover:border-slate-300 dark:hover:border-white/20",
              error && "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            className="absolute right-3.5 grid place-items-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {error && (
          <p className="text-xs text-rose-500 dark:text-rose-400 font-medium mt-0.5 animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
