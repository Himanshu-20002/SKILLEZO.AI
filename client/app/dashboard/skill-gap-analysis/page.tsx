'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { MetricCard } from '@/components/dashboard/career/MetricCard';
import { RoleSelector } from '@/components/dashboard/skill-gap-analysis/RoleSelector';
import { SkillRadarChart } from '@/components/dashboard/skill-gap-analysis/SkillRadarChart';
import { CompetencyTable } from '@/components/dashboard/skill-gap-analysis/CompetencyTable';
import { PriorityRecommendations } from '@/components/dashboard/skill-gap-analysis/PriorityRecommendations';

import { SkillGapAnalysisData, RoadmapStage, CompetencyItem } from '@/types/career-intelligence';
import { skillGapService } from '@/services/skill-gap.service';
import { profileService } from '@/services/profile.service';
import { getDefaultRoadmapStages, healRoadmapStages, getGpsStorageKey } from '@/lib/career-gps-defaults';
import { Target, CheckCircle2, AlertCircle, Cpu, Loader2, FileText, User } from 'lucide-react';
import { toast } from 'sonner';

export default function SkillGapAnalysisPage() {
  const router = useRouter();
  const [data, setData] = useState<SkillGapAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<string>('Full-Stack Engineer');
  const [roadmapSkills, setRoadmapSkills] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('candidate');

  // Sync active skills in Career GPS roadmap for selected role
  const syncRoadmapSkills = useCallback(async (role: string, overrideUserId?: string) => {
    if (typeof window !== 'undefined') {
      let uid = overrideUserId || currentUserId;
      if (uid === 'candidate') {
        const profile = await profileService.getMyProfile().catch(() => null);
        if (profile?.userId || profile?._id) {
          uid = profile.userId || profile._id || 'candidate';
          setCurrentUserId(uid);
        }
      }
      const roleKey = role.toLowerCase().replace(/\s+/g, '_');
      const stageKey = getGpsStorageKey('stages', uid, roleKey);
      const cached = localStorage.getItem(stageKey);
      let currentStages: RoadmapStage[] = [];
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentStages = parsed;
          }
        } catch {}
      }
      const healed = healRoadmapStages(currentStages, role);
      setRoadmapSkills(healed.map((s) => s.title));
    }
  }, [currentUserId]);

  const fetchSkillGap = useCallback(async (role: string) => {
    setIsLoading(true);
    try {
      const [liveData, profile] = await Promise.all([
        skillGapService.getSkillGapAnalysis(role),
        profileService.getMyProfile().catch(() => null),
      ]);

      const uid = profile?.userId || profile?._id || 'candidate';
      setCurrentUserId(uid);

      if (liveData) {
        setData(liveData);
        setSelectedRole(liveData.targetRole);
      }
      await syncRoadmapSkills(liveData?.targetRole || role, uid);
    } catch {
      toast.error('Failed to load real-time skill gap analysis.');
    } finally {
      setIsLoading(false);
    }
  }, [syncRoadmapSkills]);

  useEffect(() => {
    fetchSkillGap('Full-Stack Engineer');
  }, [fetchSkillGap]);

  const handleSelectRole = async (role: string) => {
    setSelectedRole(role);
    syncRoadmapSkills(role);
    await fetchSkillGap(role);
    toast.info(`Updated skill gap analysis for target role: ${role}`);
  };

  // ── 1. Add Skill Gap to Career GPS Roadmap ───────────────────────────────
  const handleAddToRoadmap = (comp: CompetencyItem) => {
    const roleKey = selectedRole.toLowerCase().replace(/\s+/g, '_');
    const stageKey = getGpsStorageKey('stages', currentUserId, roleKey);
    const posKey = getGpsStorageKey('positions', currentUserId, roleKey);

    let stages: RoadmapStage[] = [];
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(stageKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            stages = parsed;
          }
        } catch {}
      }
    }

    // Always heal to ensure all 7 core pillars exist
    const baseStages = healRoadmapStages(stages, selectedRole);

    // Check if duplicate
    const exists = baseStages.some((s) => s.title.toLowerCase().includes(comp.skill.toLowerCase()));
    if (exists) {
      toast.info(`"${comp.skill}" is already part of your Career GPS roadmap.`);
      return;
    }

    const isRevision = comp.status === 'Matched';

    // Create newly added milestone with 'Pending' status (never 'In Progress'!)
    const newStage: RoadmapStage = {
      id: `stage-gap-${comp.id}-${Date.now()}`,
      stageNumber: 0,
      title: isRevision ? `Revise & Deepen ${comp.skill}` : `Master & Apply ${comp.skill}`,
      status: 'Pending',
      completionPercentage: 0,
      description: isRevision
        ? `Revisit core concepts, architecture patterns, and interview-readiness problems for ${comp.skill} (${comp.currentLevel}).`
        : `Bridge target role competency gap in ${comp.skill} (${comp.currentLevel} → ${comp.requiredLevel}). Priority: ${comp.priority}.`,
      actionText: isRevision ? 'Start Revision' : 'Explore Tasks',
    };

    // Smart insertion: insert before Portfolio & Resume Studio (technical phase)
    const resumeOrPortfolioIdx = baseStages.findIndex((s) => {
      const t = s.title.toLowerCase();
      return t.includes('portfolio') || t.includes('project') || t.includes('resume') || t.includes('ats');
    });

    let combined: RoadmapStage[];
    if (resumeOrPortfolioIdx >= 0) {
      combined = [
        ...baseStages.slice(0, resumeOrPortfolioIdx),
        newStage,
        ...baseStages.slice(resumeOrPortfolioIdx),
      ];
    } else {
      combined = [...baseStages, newStage];
    }

    const finalHealedStages = healRoadmapStages(combined, selectedRole);

    if (typeof window !== 'undefined') {
      localStorage.setItem(stageKey, JSON.stringify(finalHealedStages));
      // Invalidate saved layout so newly added node recalculates dynamic coordinates
      localStorage.removeItem(posKey);
    }

    setRoadmapSkills(finalHealedStages.map((s) => s.title));

    toast.success(
      isRevision
        ? `Added "${comp.skill}" revision stage to Career GPS Roadmap!`
        : `Added "${comp.skill}" to Career GPS Roadmap!`,
      {
        action: {
          label: 'View in GPS',
          onClick: () => router.push('/dashboard/career-gps'),
        },
      }
    );
  };

  // ── 2. Quick-Verify Skill ("I know this" -> Profile Sync) ────────────────
  const handleQuickVerify = async (skillName: string, level: string) => {
    try {
      const profile = await profileService.getMyProfile().catch(() => null);
      const existingSkills = profile?.skills || [];

      const skillIdx = existingSkills.findIndex(
        (s) => s.name.toLowerCase() === skillName.toLowerCase()
      );

      let updatedSkills;
      if (skillIdx >= 0) {
        updatedSkills = existingSkills.map((s, idx) =>
          idx === skillIdx ? { ...s, level: level as any, verified: true } : s
        );
      } else {
        updatedSkills = [
          ...existingSkills,
          {
            name: skillName,
            level: level as any,
            verified: true,
          },
        ];
      }

      await profileService.updateProfile({ skills: updatedSkills });

      // Optimistically update Competency Table and summary metrics
      setData((prev) => {
        if (!prev) return prev;
        const updatedCompetencies = prev.competencies.map((comp) =>
          comp.skill.toLowerCase() === skillName.toLowerCase()
            ? { ...comp, currentLevel: level as any, status: 'Matched' as const }
            : comp
        );

        const newAcquired = prev.skillsAcquiredCount + 1;
        const newMissing = Math.max(0, prev.skillsMissingCount - 1);
        const newScore = Math.min(100, Math.round((newAcquired / Math.max(1, prev.skillsRequiredCount)) * 100));

        return {
          ...prev,
          skillsAcquiredCount: newAcquired,
          skillsMissingCount: newMissing,
          overallMatchScore: newScore,
          competencies: updatedCompetencies,
        };
      });

      toast.success(`Verified "${skillName}" (${level}) in your profile! Match score boosted.`);
    } catch {
      toast.error(`Failed to verify skill "${skillName}". Please try again.`);
    }
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
            <CompetencyTable 
              competencies={data.competencies}
              roadmapSkills={roadmapSkills}
              onAddToRoadmap={handleAddToRoadmap}
              onQuickVerify={handleQuickVerify}
            />

            {/* Priority Recommendations */}
            <PriorityRecommendations 
              recommendations={data.priorityRecommendations} 
              onAddToRoadmap={(skillName) => {
                const comp = data.competencies.find(
                  (c) => c.skill.toLowerCase() === skillName.toLowerCase()
                ) || {
                  id: `rec-${Date.now()}`,
                  skill: skillName,
                  category: 'Backend',
                  currentLevel: 'Unranked',
                  requiredLevel: 'Intermediate',
                  currentNumeric: 0,
                  requiredNumeric: 60,
                  gap: 2,
                  priority: 'High',
                  status: 'Gap',
                };
                handleAddToRoadmap(comp);
              }}
            />
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
