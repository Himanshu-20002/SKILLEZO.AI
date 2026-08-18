"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RememberMeProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  rightSlot?: ReactNode;
  error?: string;
}

export const RememberMe = forwardRef<HTMLInputElement, RememberMeProps>(
  ({ label = "Remember me for 30 days", rightSlot, error, className, checked, disabled, onChange, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between gap-3">
          <label className={cn("inline-flex items-center gap-2.5 cursor-pointer select-none text-xs sm:text-sm text-[#8A90A6] hover:text-white transition-colors", disabled && "opacity-50 cursor-not-allowed")}>
            <div className="relative grid place-items-center">
              <input
                ref={ref}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={onChange}
                className="peer sr-only"
                {...props}
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
            <span>{label}</span>
          </label>

          {rightSlot && <div className="text-xs sm:text-sm">{rightSlot}</div>}
        </div>

        {error && (
          <p className="text-xs text-rose-400 font-medium mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

RememberMe.displayName = "RememberMe";

export default RememberMe;
