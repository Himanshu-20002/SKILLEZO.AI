"use client";

import { cn } from "@/lib/utils";

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label = "Or continue with", className }: DividerProps) {
  return (
    <div className={cn("relative flex items-center justify-center my-4", className)}>
      <div className="w-full border-t border-white/10" />
      {label && (
        <span className="absolute bg-[#141b4d] px-3 text-[11px] font-medium tracking-wider uppercase text-[#8A90A6]">
          {label}
        </span>
      )}
    </div>
  );
}

export default Divider;
