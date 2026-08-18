"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative w-full rounded-[24px] bg-[#141b4d]/85 border border-white/10 p-6 sm:p-9 shadow-2xl backdrop-blur-xl transition-all duration-300",
        "hover:border-white/15 hover:shadow-[0_0_50px_-10px_rgba(61,90,254,0.3)]",
        className
      )}
    >
      {/* Top subtle highlight gradient bar */}
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-[24px] bg-gradient-to-r from-transparent via-[#00D9C0]/60 to-transparent" />
      
      {/* Inner ambient glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-[#3D5AFE]/15 blur-2xl" />

      <div className="relative z-10 space-y-6">{children}</div>
    </motion.div>
  );
}

export default AuthCard;
