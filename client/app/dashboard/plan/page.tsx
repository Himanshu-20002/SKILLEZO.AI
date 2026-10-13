'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { PlanUsageGauge } from '@/components/dashboard/plan/PlanUsageGauge';
import { PricingCardMatrix } from '@/components/dashboard/plan/PricingCardMatrix';
import { TokenHistoryTable } from '@/components/dashboard/plan/TokenHistoryTable';
import {
  planService,
  PlanDetails,
  PricingPlan,
  TokenUsageLogItem,
} from '@/services/plan.service';
import { toast } from 'sonner';

export default function PlanAndUsagePage() {
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [logs, setLogs] = useState<TokenUsageLogItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [planData, pricingData, usageData] = await Promise.all([
        planService.getPlanStatus(),
        planService.getPricingPlans(),
        planService.getUsageHistory(page, 15),
      ]);

      setPlan(planData);
      setPricingPlans(pricingData.plans);
      setLogs(usageData.history);
      setTotalPages(usageData.totalPages);
      setTotalRecords(usageData.totalRecords);
    } catch (err: any) {
      console.error('[Plan Page Error]:', err);
      toast.error('Failed to load plan details', {
        description: err?.message || 'Please refresh the page.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen to telemetry event to refresh plan automatically if tokens were deducted
  useEffect(() => {
    const handleTokensUpdated = () => {
      loadData(true);
    };

    window.addEventListener('skillezo:tokens-updated', handleTokensUpdated);
    return () => {
      window.removeEventListener('skillezo:tokens-updated', handleTokensUpdated);
    };
  }, [loadData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleUpgradeClick = (tier = 'PRO') => {
    if (tier === 'ENTERPRISE') {
      toast.info('Enterprise Tier Inquiry', {
        description: 'Please contact support@skillezo.ai for institutional placement bulk packages.',
      });
      return;
    }

    // Phase 4 will connect Stripe checkout session here
    toast.success('Upgrade to SKILLEZO Pro', {
      description: 'Redirecting to checkout session...',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Page Header */}
        <PageHeader
          title="Plan & AI Token Quota"
          description="Manage your platform subscription tier, monitor AI token consumption, and view usage history."
          actions={
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh Balance'}</span>
            </button>
          }
        />

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800/60" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800/60" />
              <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800/60" />
              <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800/60" />
            </div>
          </div>
        ) : plan ? (
          <>
            {/* 1. Hero Quota & Consumption Gauge */}
            <PlanUsageGauge plan={plan} onUpgradeClick={() => handleUpgradeClick('PRO')} />

            {/* 2. Pricing & Tier Comparison Matrix */}
            <PricingCardMatrix
              plans={pricingPlans}
              currentTier={plan.tier}
              onUpgradeClick={handleUpgradeClick}
            />

            {/* 3. Token Audit History */}
            <TokenHistoryTable
              logs={logs}
              page={page}
              totalPages={totalPages}
              totalRecords={totalRecords}
              onPageChange={handlePageChange}
              isLoading={isRefreshing}
            />
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
