"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxW?: "max-w-7xl" | "max-w-6xl" | "max-w-5xl" | "max-w-4xl" | "full";
}

export function PageContainer({
  children,
  className,
  maxW = "max-w-7xl",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full bg-[#0B1130] text-white overflow-x-hidden",
        className
      )}
    >
      {/* Background Glowing Blobs */}
      <div className="pointer-events-none fixed -left-40 top-0 h-[600px] w-[600px] rounded-full bg-[#3D5AFE]/15 blur-[180px]" />
      <div className="pointer-events-none fixed -right-40 bottom-0 h-[600px] w-[600px] rounded-full bg-[#00D9C0]/15 blur-[180px]" />
      <div className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-[#3D5AFE]/5 blur-[220px]" />

      {/* Grid line overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div
        className={cn(
          "relative z-10 mx-auto w-full px-4 sm:px-6 lg:px-8",
          maxW !== "full" && maxW
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default PageContainer;
