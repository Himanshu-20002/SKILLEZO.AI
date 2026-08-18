"use client";

import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  intensity?: "light" | "medium" | "strong";
  interactive?: boolean;
}

export function GlassCard({
  children,
  className,
  glow = false,
  intensity = "medium",
  interactive = false,
  ...props
}: GlassCardProps) {
  const intensityClasses = {
    light: "bg-[#0B1130]/60 border-white/5 backdrop-blur-md",
    medium: "bg-[#141b4d]/70 border-white/10 backdrop-blur-xl",
    strong: "bg-[#11183d]/90 border-white/15 backdrop-blur-2xl shadow-2xl",
  };

  return (
    <motion.div
      whileHover={interactive ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "relative rounded-[24px] border p-6 md:p-8 transition-all duration-300 overflow-hidden",
        intensityClasses[intensity],
        glow && "shadow-[0_0_50px_-12px_rgba(61,90,254,0.25)] hover:shadow-[0_0_60px_-10px_rgba(0,217,192,0.3)]",
        className
      )}
      {...props}
    >
      {/* Dynamic ambient highlight */}
      {glow && (
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
      )}
      {children}
    </motion.div>
  );
}

export default GlassCard;
