'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { MetricCard } from '@/components/dashboard/career/MetricCard';
import { RoleSelector } from '@/components/dashboard/skill-gap-analysis/RoleSelector';
import { SkillRadarChart } from '@/components/dashboard/skill-gap-analysis/SkillRadarChart';
import { CompetencyTable } from '@/components/dashboard/skill-gap-analysis/CompetencyTable';
import { PriorityRecommendations } from '@/components/dashboard/skill-gap-analysis/PriorityRecommendations';

import { mockCareerIntelligence } from '@/mock/career-intelligence';
import { SkillGapAnalysisData } from '@/types/career-intelligence';
import { skillGapService } from '@/services/skill-gap.service';
import { Target, CheckCircle2, AlertCircle, Cpu, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SkillGapAnalysisPage() {
  const [data, setData] = useState<SkillGapAnalysisData>(mockCareerIntelligence.skillGapAnalysis);
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
      // Fallback gracefully to demo state if offline
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
          roles={data.availableRoles || [
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
        ) : (
          <>
            {/* Overview KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Overall Role Match"
                value={`${data.overallMatchScore}%`}
                subtitle="Target Role Alignment"
                icon={Target}
                badge={`${getMatchBadge(data.overallMatchScore)} (${data.overallMatchScore}%)`}
                trend="+4% this month"
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
        )}
      </div>
    </DashboardLayout>
  );
}
