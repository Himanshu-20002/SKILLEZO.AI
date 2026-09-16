'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { MetricCard } from '@/components/dashboard/career/MetricCard';
import { RoleSelector } from '@/components/dashboard/skill-gap-analysis/RoleSelector';
import { SkillRadarChart } from '@/components/dashboard/skill-gap-analysis/SkillRadarChart';
import { CompetencyTable } from '@/components/dashboard/skill-gap-analysis/CompetencyTable';
import { PriorityRecommendations } from '@/components/dashboard/skill-gap-analysis/PriorityRecommendations';

import { SkillGapAnalysisData } from '@/types/career-intelligence';
import { skillGapService } from '@/services/skill-gap.service';
import { Target, CheckCircle2, AlertCircle, Cpu, Loader2, FileText, User } from 'lucide-react';
import { toast } from 'sonner';

export default function SkillGapAnalysisPage() {
  const [data, setData] = useState<SkillGapAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<string>('Full-Stack Engineer');

  const fetchSkillGap = useCallback(async (role: string) => {
    setIsLoading(true);
    try {
      const liveData = await skillGapService.getSkillGapAnalysis(role);
      if (liveData) {
        setData(liveData);
        setSelectedRole(liveData.targetRole);
      }
    } catch {
      toast.error('Failed to load real-time skill gap analysis.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkillGap('Full-Stack Engineer');
  }, [fetchSkillGap]);

  const handleSelectRole = async (role: string) => {
    setSelectedRole(role);
    await fetchSkillGap(role);
    toast.info(`Updated skill gap analysis for target role: ${role}`);
  };

  const handleAddToGap = (skillName: string) => {
    toast.success(`Added ${skillName} to active learning roadmap`);
  };

  const getMatchBadge = (score: number) => {
    if (score >= 85) return 'Role Ready';
    if (score >= 70) return 'High Potential';
    if (score >= 50) return 'Developing';
    return 'Action Needed';
  };

  const isZeroState = !data || (data.skillsAcquiredCount === 0 && data.overallMatchScore === 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Skill Gap Analysis"
          description="Understand what skills you need to become job-ready for your target role."
          badge="Module 21 • Skill Gap Analysis"
        />

        {/* Role Selector Header */}
        <RoleSelector
          selectedRole={selectedRole}
          roles={data?.availableRoles || [
            'Full-Stack Engineer',
            'Frontend Engineer',
            'Backend Engineer',
            'AI/ML Specialist',
            'DevOps & Cloud Engineer',
            'Mobile App Developer',
          ]}
          onSelectRole={handleSelectRole}
        />

        {isLoading ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <Loader2 className="w-8 h-8 text-[#3D5AFE] dark:text-[#00D9C0] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Calculating 6-Axis Competency Benchmarks for {selectedRole}...
            </p>
          </div>
        ) : data ? (
          <>
            {/* Zero Verified Skills Authentic Onboarding Banner */}
            {isZeroState && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 border border-blue-500/20 dark:border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[#3D5AFE] text-white shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Zero Verified Skills Detected
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                      Upload your resume or add technical skills to your profile to benchmark your real-time match against <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedRole}</span>.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/dashboard/resume-studio"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white shadow-sm transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Upload Resume</span>
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Add Skills</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Overview KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Overall Role Match"
                value={`${data.overallMatchScore}%`}
                subtitle="Target Role Alignment"
                icon={Target}
                badge={`${getMatchBadge(data.overallMatchScore)} (${data.overallMatchScore}%)`}
              />
              <MetricCard
                title="Skills Acquired"
                value={data.skillsAcquiredCount}
                subtitle="Verified & resume-matched"
                icon={CheckCircle2}
                color="text-emerald-500"
              />
              <MetricCard
                title="Skills Required"
                value={data.skillsRequiredCount}
                subtitle="Industry standards"
                icon={Cpu}
                color="text-[#3D5AFE]"
              />
              <MetricCard
                title="Skills Missing"
                value={data.skillsMissingCount}
                subtitle="Gaps to close"
                icon={AlertCircle}
                color="text-amber-500"
              />
            </div>

            {/* Radar / Category Proficiency Overview */}
            <SkillRadarChart categories={data.radarCategories} />

            {/* Competency Match Table */}
            <CompetencyTable competencies={data.competencies} onAddToGap={handleAddToGap} />

            {/* Priority Recommendations */}
            <PriorityRecommendations recommendations={data.priorityRecommendations} />
          </>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Unable to load skill gap data. Please check your connection and retry.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
