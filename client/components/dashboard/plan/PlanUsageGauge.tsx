'use client';

import React from 'react';
import { PlanDetails } from '@/services/plan.service';
import {
  Zap,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Flame,
} from 'lucide-react';

interface PlanUsageGaugeProps {
  plan: PlanDetails;
  onUpgradeClick?: () => void;
}

export const PlanUsageGauge: React.FC<PlanUsageGaugeProps> = ({ plan, onUpgradeClick }) => {
  const totalTokens = plan.totalAllowance + plan.bonusTokens;
  const remaining = plan.remainingTokens;
  const consumed = plan.consumedTokens;
  const percentage = plan.usagePercent;
  const isExhausted = plan.isExhausted || remaining <= 0;
  const isLow = !isExhausted && percentage >= 80;

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white/95 via-white/80 to-slate-50/80 dark:from-[#0E1538]/95 dark:via-[#0E1538]/80 dark:to-[#070B24]/90 backdrop-blur-xl border border-slate-200/80 dark:border-indigo-500/20 shadow-xl shadow-slate-200/40 dark:shadow-none">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#3D5AFE]/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        {/* Left: Plan Tier Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20 text-[#3D5AFE] flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {plan.planDetails.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#3D5AFE]/10 text-[#3D5AFE] dark:bg-[#3D5AFE]/25 border border-[#3D5AFE]/30">
                  {plan.tier}
                </span>
                {plan.status === 'ACTIVE' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {plan.planDetails.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Upgrade Button */}
        {plan.tier === 'FREE' && (
          <button
            onClick={onUpgradeClick}
            className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#3D5AFE] to-indigo-600 hover:from-[#324ad4] hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-[#3D5AFE]/25 transition-all duration-200 cursor-pointer active:scale-[0.98] shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade to SKILLEZO Pro</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Center: Token Consumption Progress Gauge */}
      <div className="pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Remaining AI Token Quota
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {remaining.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                / {totalTokens.toLocaleString()} tokens
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {isExhausted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Quota Depleted (100% used)
              </span>
            ) : isLow ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                <Flame className="w-3.5 h-3.5" />
                Low Quota ({percentage}% used)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3D5AFE]/10 text-[#3D5AFE] dark:bg-[#3D5AFE]/20 border border-[#3D5AFE]/25 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                {percentage}% Consumed
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="relative w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isExhausted
                ? 'bg-rose-500'
                : isLow
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : 'bg-gradient-to-r from-[#00D9C0] via-[#3D5AFE] to-indigo-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(isExhausted ? 100 : 3, percentage))}%` }}
          />
        </div>

        {/* Bottom Metadata Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Total Granted</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
              {plan.totalAllowance.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Used Tokens</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
              {consumed.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Bonus / Promos</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              +{plan.bonusTokens.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Renewal Cycle</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
              {plan.tier === 'FREE' ? 'One-time Quota' : 'Every 30 Days'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
