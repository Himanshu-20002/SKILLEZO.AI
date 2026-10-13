'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Sparkles, ChevronRight, AlertTriangle } from 'lucide-react';
import { planService, PlanDetails } from '@/services/plan.service';
import { useSession } from '@/lib/auth-client';

interface SidebarTokenWidgetProps {
  collapsed?: boolean;
  onItemClick?: () => void;
}

export const SidebarTokenWidget: React.FC<SidebarTokenWidgetProps> = ({
  collapsed = false,
  onItemClick,
}) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Role Gate: Strictly candidate only
  const role = ((session?.user as any)?.role || '').toLowerCase();
  const email = (session?.user?.email || '').toLowerCase();
  const isAdmin = role === 'admin' || email === 'admin@gmail.com' || pathname.startsWith('/admin');
  const isRecruiter = role === 'recruiter' || pathname.startsWith('/recruiter');

  const isCandidateOnly = !isAdmin && !isRecruiter;

  useEffect(() => {
    if (!isCandidateOnly) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchPlan() {
      try {
        const data = await planService.getPlanStatus();
        if (isMounted) {
          setPlan(data);
        }
      } catch (err) {
        // Silently fail if unauthenticated or network error to avoid breaking sidebar
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPlan();

    // Listen for real-time telemetry updates whenever an AI route deducts tokens
    const handleTokensUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ remaining: number }>;
      if (customEvent.detail?.remaining !== undefined) {
        setPlan((prev) => {
          if (!prev) return prev;
          const remaining = customEvent.detail.remaining;
          const total = prev.totalAllowance + prev.bonusTokens;
          const consumed = Math.max(0, total - remaining);
          const percent = total > 0 ? Math.min(100, Math.round((consumed / total) * 100)) : 100;
          return {
            ...prev,
            remainingTokens: remaining,
            consumedTokens: consumed,
            usagePercent: percent,
            isExhausted: remaining <= 0,
          };
        });
      }
    };

    window.addEventListener('skillezo:tokens-updated', handleTokensUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('skillezo:tokens-updated', handleTokensUpdated);
    };
  }, [isCandidateOnly]);

  // If Admin or Recruiter, do NOT render this widget
  if (!isCandidateOnly) {
    return null;
  }

  // Loading Skeleton Placeholder
  if (loading || !plan) {
    if (collapsed) {
      return (
        <div className="w-10 h-10 mx-auto my-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
      );
    }
    return (
      <div className="p-3.5 m-3 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 animate-pulse">
        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  const remaining = plan.remainingTokens;
  const total = plan.totalAllowance + plan.bonusTokens;
  const percent = plan.usagePercent;
  const isExhausted = plan.isExhausted || remaining <= 0;
  const isLow = !isExhausted && percent >= 80;

  // Collapsed Mode: Icon Button with Hover Tooltip
  if (collapsed) {
    return (
      <Link
        href="/dashboard/plan"
        onClick={onItemClick}
        className="group relative flex justify-center py-2"
        title="AI Token Balance"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isExhausted
              ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
              : isLow
              ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
              : 'bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20 text-[#3D5AFE] dark:text-[#00D9C0] hover:bg-[#3D5AFE]/20'
          }`}
        >
          <Zap className="w-5 h-5 fill-current" />
        </div>

        {/* Hover Tooltip */}
        <div className="absolute left-full ml-3 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
          <div className="font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#00D9C0] fill-current" />
            <span>{remaining.toLocaleString()} AI Tokens Left</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {plan.planDetails.name} • Click to manage
          </div>
        </div>
      </Link>
    );
  }

  // Expanded Mode: Interactive Card Link to /dashboard/plan
  return (
    <Link
      href="/dashboard/plan"
      onClick={onItemClick}
      className="group block p-3.5 m-3 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100/70 dark:from-[#0E1538] dark:via-[#0B1130] dark:to-[#070B24] border border-slate-200/90 dark:border-indigo-500/20 hover:border-[#3D5AFE]/40 dark:hover:border-[#3D5AFE]/50 shadow-xs hover:shadow-md transition-all duration-200 text-left shrink-0 cursor-pointer"
    >
      {/* Top Row: Icon + Plan Name + Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              isExhausted
                ? 'bg-rose-500/15 text-rose-500'
                : isLow
                ? 'bg-amber-500/15 text-amber-500'
                : 'bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/25 text-[#3D5AFE] dark:text-[#00D9C0]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            AI Credits
          </span>
        </div>

        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
            plan.tier === 'PRO'
              ? 'bg-gradient-to-r from-[#3D5AFE]/20 to-purple-500/20 text-[#3D5AFE] dark:text-[#00D9C0] border-[#3D5AFE]/30'
              : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
          }`}
        >
          {plan.tier}
        </span>
      </div>

      {/* Middle Row: Numerical Balance */}
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="flex items-baseline gap-1">
          <span
            className={`text-sm font-black tracking-tight ${
              isExhausted
                ? 'text-rose-500'
                : isLow
                ? 'text-amber-500'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {remaining.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            / {total.toLocaleString()} tokens
          </span>
        </div>

        <span className="text-[10px] text-slate-400 font-medium">
          {Math.round(percent)}% used
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isExhausted
              ? 'bg-rose-500'
              : isLow
              ? 'bg-amber-500'
              : 'bg-gradient-to-r from-[#00D9C0] to-[#3D5AFE]'
          }`}
          style={{ width: `${Math.min(100, Math.max(isExhausted ? 100 : 3, percent))}%` }}
        />
      </div>

      {/* Bottom CTA / Action Link */}
      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 dark:border-slate-800/80">
        {isExhausted ? (
          <span className="text-rose-500 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Quota Depleted</span>
          </span>
        ) : plan.tier === 'FREE' ? (
          <span className="text-[#3D5AFE] dark:text-[#536DFE] font-bold group-hover:underline flex items-center gap-0.5">
            <Sparkles className="w-3 h-3" />
            <span>Upgrade to Pro</span>
          </span>
        ) : (
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Renews monthly
          </span>
        )}

        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#3D5AFE] group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
};
