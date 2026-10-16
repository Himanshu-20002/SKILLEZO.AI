'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Flame,
  Loader2,
} from 'lucide-react';
import { billingService } from '@/services/billing.service';
import { toast } from 'sonner';

export interface InsufficientTokenDetails {
  balance?: number;
  required?: number;
  missing?: number;
  feature?: string;
  upgradeUrl?: string;
}

export const UpgradePlanModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState<InsufficientTokenDetails | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    const handleInsufficientTokens = (event: Event) => {
      const customEvent = event as CustomEvent<InsufficientTokenDetails>;
      setDetails(customEvent.detail || null);
      setIsOpen(true);
    };

    window.addEventListener('skillezo:insufficient-tokens', handleInsufficientTokens);
    return () => {
      window.removeEventListener('skillezo:insufficient-tokens', handleInsufficientTokens);
    };
  }, []);

  const featureNames: Record<string, string> = {
    RESUME_ATS: 'Resume ATS Diagnostic',
    TAILORED_RESUME: 'AI Tailored Resume Generation',
    CAREER_COACH: 'AI Career Coach Chat',
    MOCK_INTERVIEW: 'AI Mock Interview Assessment',
    SKILL_GAP: 'Skill Gap & Career GPS',
  };

  const featureLabel = details?.feature
    ? featureNames[details.feature] || details.feature.replace(/_/g, ' ')
    : 'AI Feature';

  const handleDirectUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await billingService.startCheckout({
        billingCycle: 'MONTHLY',
        onSuccess: (result) => {
          setIsUpgrading(false);
          setIsOpen(false);
          toast.success('Upgraded to SKILLEZO Pro!', {
            description: result.message || '100,000 AI tokens have been credited to your account.',
          });
        },
        onError: (err) => {
          setIsUpgrading(false);
          toast.error('Upgrade Failed', {
            description: err?.message || 'Could not complete payment.',
          });
        },
        onDismiss: () => {
          setIsUpgrading(false);
        },
      });
    } catch (err: any) {
      setIsUpgrading(false);
      toast.error('Checkout Error', {
        description: err?.message || 'Failed to initiate checkout.',
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 dark:bg-[#070b1e]/85 backdrop-blur-md">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#3D5AFE]/30 via-indigo-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative max-w-lg w-full rounded-3xl p-6 sm:p-8 bg-white/95 dark:bg-[#0E1538]/95 backdrop-blur-2xl border border-slate-200 dark:border-indigo-500/30 shadow-2xl overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Icon */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#3D5AFE] to-indigo-500 flex items-center justify-center shadow-lg shadow-[#3D5AFE]/30 text-white shrink-0">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                  Free Quota Finished
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                  Upgrade to SKILLEZO Pro
                </h3>
              </div>
            </div>

            {/* Context Message */}
            <div className="space-y-3 mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                You’ve used all your Free Plan tokens. To run{' '}
                <strong className="text-slate-900 dark:text-white font-semibold">{featureLabel}</strong>
                {details?.missing ? (
                  <span>
                    {' '}(needs{' '}
                    <span className="text-[#3D5AFE] font-bold">
                      {details.missing.toLocaleString()}
                    </span>{' '}
                    more tokens)
                  </span>
                ) : null}
                , upgrade to SKILLEZO Pro to continue without limits.
              </p>

              {/* Token Quota Progress bar snippet */}
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">Current Balance</span>
                  <span className="text-rose-500 font-bold">
                    {details?.balance !== undefined ? details.balance.toLocaleString() : 0} Tokens Left
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-full" />
                </div>
              </div>
            </div>

            {/* Pro Benefits List */}
            <div className="space-y-2.5 mb-6 text-xs text-slate-700 dark:text-slate-200">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white font-semibold">100,000 Monthly Tokens</strong>{' '}
                  (refills automatically every 30 days)
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white font-semibold">Unlimited Resume Tailoring</strong>{' '}
                  matched against live job descriptions
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white font-semibold">Unlimited Voice & Video Mock Interviews</strong>{' '}
                  with instant AI rubric feedback
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 dark:text-white font-semibold">Priority AI Engine</strong>{' '}
                  powered by Gemini 1.5 Pro & GPT-4o
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={handleDirectUpgrade}
                disabled={isUpgrading}
                className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-[#3D5AFE] hover:bg-[#324ad4] text-white font-bold text-xs shadow-lg shadow-[#3D5AFE]/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Upgrade to Pro (₹399/mo)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <Link
                href="/dashboard/plan"
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors text-center cursor-pointer"
              >
                <span>View All Plans</span>
              </Link>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Cancel or change plans anytime with zero commitment.</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
