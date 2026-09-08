"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  showTagline?: boolean;
  className?: string;
  variant?: "default" | "darkOnly" | "lightOnly";
}

export function BrandLogo({
  size = "md",
  href = "/",
  showTagline = false,
  className = "",
  variant = "default",
}: BrandLogoProps) {
  const sizeClasses = {
    sm: {
      box: "h-7 w-7 rounded-lg",
      icon: "h-4 w-4",
      text: "text-lg",
      tagline: "text-[10px]",
    },
    md: {
      box: "h-9 w-9 rounded-xl",
      icon: "h-5 w-5",
      text: "text-xl",
      tagline: "text-xs",
    },
    lg: {
      box: "h-11 w-11 rounded-2xl",
      icon: "h-6 w-6",
      text: "text-2xl",
      tagline: "text-xs",
    },
  };

  const textColor =
    variant === "darkOnly"
      ? "text-white"
      : variant === "lightOnly"
      ? "text-slate-900"
      : "text-slate-900 dark:text-white";

  const content = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-2.5 group cursor-pointer ${className}`}
    >
      <div
        className={`grid place-items-center bg-[#3D5AFE] shadow-[0_0_18px_rgba(61,90,254,0.5)] group-hover:shadow-[0_0_25px_rgba(61,90,254,0.8)] transition-all duration-300 ${sizeClasses[size].box}`}
      >
        <Zap className={`${sizeClasses[size].icon} text-white`} fill="white" />
      </div>
      <div className="flex flex-col">
        <span className={`font-display font-bold tracking-tight leading-none ${textColor} ${sizeClasses[size].text}`}>
          SKILL<span className="gradient-text">EZO</span>
        </span>
        {showTagline && (
          <span className={`text-[#8A90A6] font-medium mt-0.5 ${sizeClasses[size].tagline}`}>
            AI Skill Verification Platform
          </span>
        )}
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default BrandLogo;
