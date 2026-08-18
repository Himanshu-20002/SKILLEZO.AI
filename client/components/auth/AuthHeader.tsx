"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  linkText?: string;
  linkHref?: string;
  align?: "left" | "center";
  className?: string;
}

export function AuthHeader({
  title,
  subtitle,
  linkText,
  linkHref,
  align = "left",
  className,
}: AuthHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        align === "center" ? "text-center items-center" : "text-left items-start",
        className
      )}
    >
      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
        {title}
      </h1>
      
      {(subtitle || linkText) && (
        <p className="text-sm text-[#8A90A6] leading-relaxed">
          {subtitle}{" "}
          {linkText && linkHref && (
            <Link
              href={linkHref}
              className="font-medium text-[#00D9C0] hover:text-white transition-colors underline-offset-4 hover:underline cursor-pointer ml-1"
            >
              {linkText}
            </Link>
          )}
        </p>
      )}
    </div>
  );
}

export default AuthHeader;
