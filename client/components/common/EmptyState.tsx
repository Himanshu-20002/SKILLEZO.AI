"use client";

import { ReactNode } from "react";
import { LucideIcon, Inbox } from "lucide-react";
import GlassCard from "./GlassCard";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <GlassCard className={`flex flex-col items-center justify-center text-center p-10 ${className}`}>
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#3D5AFE]/10 border border-[#3D5AFE]/20 mb-4 text-[#00D9C0]">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-display text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-[#8A90A6] max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </GlassCard>
  );
}

export default EmptyState;
