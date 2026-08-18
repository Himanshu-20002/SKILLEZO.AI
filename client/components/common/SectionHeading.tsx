"use client";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SectionHeading({
  badge,
  title,
  titleAccent,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  const alignClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div className={cn("flex flex-col gap-2.5 max-w-2xl mx-auto", alignClasses[align], className)}>
      {badge && (
        <span className="inline-flex items-center rounded-full bg-[#3D5AFE]/15 px-3 py-1 text-xs font-semibold text-[#00D9C0] border border-[#3D5AFE]/30 tracking-wide uppercase">
          {badge}
        </span>
      )}
      <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
        {title}{" "}
        {titleAccent && <span className="gradient-text">{titleAccent}</span>}
      </h2>
      {description && (
        <p className="text-sm sm:text-base text-[#8A90A6] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
