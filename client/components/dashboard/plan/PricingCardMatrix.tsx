'use client';

import React from 'react';
import { PricingPlan } from '@/services/plan.service';
import {
  CheckCircle2,
  Sparkles,
  Zap,
  Building2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface PricingCardMatrixProps {
  plans: PricingPlan[];
  currentTier: string;
  onUpgradeClick?: (tier: string) => void;
}

export const PricingCardMatrix: React.FC<PricingCardMatrixProps> = ({
  plans,
  currentTier,
  onUpgradeClick,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#3D5AFE] dark:text-[#536DFE] bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20 px-3 py-1 rounded-full border border-[#3D5AFE]/25 inline-block">
          Plans & Pricing
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Accelerate Your Career with the Right Plan
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Scale your AI capabilities from essential job applications to unlimited deep career acceleration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-4">
        {plans.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          const isPro = plan.tier === 'PRO';

          return (
            <div
              key={plan.tier}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                isPro
                  ? 'bg-gradient-to-b from-white via-indigo-50/20 to-white dark:from-[#111A46] dark:via-[#0E1538] dark:to-[#0A0F2B] border-2 border-[#3D5AFE] shadow-2xl shadow-[#3D5AFE]/15 scale-[1.02] z-10'
                  : 'bg-white/80 dark:bg-[#0E1538]/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Most Popular Ribbon */}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-[#3D5AFE] to-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                  {plan.badge}
                </div>
              )}

              {/* Card Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#3D5AFE]/10 text-[#3D5AFE] flex items-center justify-center font-bold">
                    {plan.tier === 'FREE' ? (
                      <Zap className="w-5 h-5 fill-current" />
                    ) : plan.tier === 'PRO' ? (
                      <Sparkles className="w-5 h-5 fill-current" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </div>
                  {isCurrent && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      Current Plan
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[34px]">
                    {plan.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  {plan.priceMonthly !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {plan.currency === 'USD' ? '$' : '₹'}{plan.priceMonthly.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        / month
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        Custom
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        institutional pricing
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] font-bold text-[#3D5AFE] mt-1 block">
                    {plan.tokenAllowance.toLocaleString()} AI Tokens
                    {plan.tier === 'PRO' ? ' / month' : ''}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-300 leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs cursor-default flex items-center justify-center gap-2"
                  >
                    <span>Active Plan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onUpgradeClick && onUpgradeClick(plan.tier)}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-xs shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                      isPro
                        ? 'bg-[#3D5AFE] hover:bg-[#324ad4] text-white shadow-[#3D5AFE]/30'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
