'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { EmployabilityGauge } from '@/components/dashboard/employability-index/EmployabilityGauge';
import { ScoreBreakdown } from '@/components/dashboard/employability-index/ScoreBreakdown';
import { StrengthsAndGaps } from '@/components/dashboard/employability-index/StrengthsAndGaps';
import { ActionList } from '@/components/dashboard/employability-index/ActionList';

import { mockCareerIntelligence } from '@/mock/career-intelligence';
import { EmployabilityIndexData } from '@/types/career-intelligence';
import { employabilityService } from '@/services/employability.service';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TARGET_ROLES = [
  'Full-Stack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'AI/ML Specialist',
  'DevOps & Cloud Engineer',
  'Mobile App Developer',
];

export default function EmployabilityIndexPage() {
  const [data, setData] = useState<EmployabilityIndexData>(mockCareerIntelligence.employabilityIndex);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [targetRole, setTargetRole] = useState<string>('Full-Stack Engineer');

  const fetchEmployability = useCallback(async (role: string) => {
    setIsLoading(true);
    try {
      const liveData = await employabilityService.getEmployabilityIndex(role);
      if (liveData) {
        setData(liveData);
      }
    } catch {
      // Fallback gracefully to demo state if offline
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployability(targetRole);
  }, [fetchEmployability, targetRole]);

  const handleRoleChange = (newRole: string) => {
    setTargetRole(newRole);
    fetchEmployability(newRole);
    toast.info(`Recalculating Employability Index for ${newRole}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Employability Index"
          description={`Consolidated hiring-readiness benchmark and recruiter visibility evaluation for ${targetRole}.`}
          badge="Module 22 • Employability Index"
          actions={
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 px-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Target Role:</span>
              </div>
              <div className="relative">
                <select
                  aria-label="Target Role Selector"
                  value={targetRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold py-1.5 pl-2.5 pr-7 rounded-lg border-0 focus:ring-2 focus:ring-[#3D5AFE] cursor-pointer appearance-none"
                >
                  {TARGET_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <span className="text-slate-400 text-[10px] absolute right-2.5 top-2 pointer-events-none">▼</span>
              </div>
            </div>
          }
        />

        {isLoading ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <Loader2 className="w-8 h-8 text-[#3D5AFE] dark:text-[#00D9C0] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Calculating Multi-Factor Employability Index for {targetRole}...
            </p>
          </div>
        ) : (
          <>
            {/* Main Employability Gauge */}
            <EmployabilityGauge data={data} />

            {/* Score Breakdown Cards */}
            <ScoreBreakdown metrics={data.metrics} />

            {/* Strengths & Improvement Opportunities */}
            <StrengthsAndGaps strengths={data.strengths} improvementAreas={data.improvementAreas} />

            {/* Action List */}
            <ActionList actions={data.actionList} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
