'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { CareerGoalHeader } from '@/components/dashboard/career-gps/CareerGoalHeader';
import { RoadmapTimeline } from '@/components/dashboard/career-gps/RoadmapTimeline';
import { CurrentMilestoneWidget } from '@/components/dashboard/career-gps/CurrentMilestoneWidget';
import { SalaryProgressionChart } from '@/components/dashboard/career-gps/SalaryProgressionChart';

import { CareerGPSData, RoadmapStage, SalaryProgressionItem } from '@/types/career-intelligence';
import { employabilityService } from '@/services/employability.service';
import { profileService } from '@/services/profile.service';
import { 
  getDefaultRoadmapStages, 
  healRoadmapStages, 
  computeSalaryProgression,
  buildCandidateSpecificRoadmap,
  getGpsStorageKey
} from '@/lib/career-gps-defaults';
import { skillGapService } from '@/services/skill-gap.service';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const TARGET_ROLES = [
  'Full-Stack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'AI/ML Specialist',
  'DevOps & Cloud Engineer',
  'Mobile App Developer',
];

export default function CareerGPSPage() {
  const [data, setData] = useState<CareerGPSData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [targetRole, setTargetRole] = useState<string>('Full-Stack Engineer');

  const fetchGpsData = useCallback(async (roleToLoad?: string) => {
    setIsLoading(true);
    try {
      const [profileResult, gpsResult] = await Promise.all([
        profileService.getMyProfile().catch(() => null),
        employabilityService.getCareerGps(roleToLoad).catch(() => null),
      ]);

      const userId = profileResult?.userId || profileResult?._id || 'candidate';

      // 1. Role determination: passed role > candidate profile target role > default
      const role = roleToLoad || profileResult?.targetRole || 'Full-Stack Engineer';
      setTargetRole(role);

      // Fetch candidate's live skill gap analysis to tailor personalized milestones
      const skillGapResult = await skillGapService.getSkillGapAnalysis(role).catch(() => null);

      const roleKey = role.toLowerCase().replace(/\s+/g, '_');
      const stageStorageKey = getGpsStorageKey('stages', userId, roleKey);
      const cachedStagesStr = typeof window !== 'undefined' ? localStorage.getItem(stageStorageKey) : null;
      let rawStages: RoadmapStage[];

      if (cachedStagesStr) {
        try {
          const parsed = JSON.parse(cachedStagesStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rawStages = parsed;
          } else {
            // Build 100% personalized candidate roadmap from their actual profile & skill gaps
            rawStages = buildCandidateSpecificRoadmap({
              role,
              competencies: skillGapResult?.competencies || [],
              gpsMilestones: gpsResult?.milestones || [],
            });
          }
        } catch {
          rawStages = buildCandidateSpecificRoadmap({
            role,
            competencies: skillGapResult?.competencies || [],
            gpsMilestones: gpsResult?.milestones || [],
          });
        }
      } else {
        // Build 100% personalized candidate roadmap from their actual profile & skill gaps
        rawStages = buildCandidateSpecificRoadmap({
          role,
          competencies: skillGapResult?.competencies || [],
          gpsMilestones: gpsResult?.milestones || [],
        });
      }

      // Automatically self-heal: restore missing CI/CD, Portfolio, Resume Studio, Job Matching pillars
      // and ensure only ONE stage is marked In Progress
      const finalStages = healRoadmapStages(rawStages, role);

      if (typeof window !== 'undefined') {
        localStorage.setItem(stageStorageKey, JSON.stringify(finalStages));
      }

      const activeFocusMilestone = finalStages.find((s) => s.status === 'In Progress') || finalStages[2] || finalStages[0];

      const salaryKey = getGpsStorageKey('salary', userId);
      const timelineKey = getGpsStorageKey('timeline', userId);

      const cachedSalary = typeof window !== 'undefined' ? localStorage.getItem(salaryKey) : null;
      const cachedTimeline = typeof window !== 'undefined' ? localStorage.getItem(timelineKey) : null;

      // Prioritize persistent database profile (synced across computers), then user-scoped cache, then 1 - 3 LPA baseline
      const rawSalary = profileResult?.targetSalary || cachedSalary || '1 - 3 LPA';
      const initialSalary = (rawSalary || '1 - 3 LPA').replace(/₹/g, '').trim() || '1 - 3 LPA';
      const initialTimeline = profileResult?.targetTimeline || cachedTimeline || `${gpsResult?.totalEstimatedWeeks || 8} Weeks`;

      if (typeof window !== 'undefined') {
        localStorage.setItem(salaryKey, initialSalary);
        localStorage.setItem(timelineKey, initialTimeline);
      }

      const initialSalaryProgression = computeSalaryProgression(initialSalary);

      setData({
        userId,
        targetRole: role,
        targetSalary: initialSalary,
        targetTimeline: initialTimeline,
        currentMilestone: {
          focusTitle: activeFocusMilestone.title,
          progressPercentage: activeFocusMilestone.completionPercentage,
          nextAction: activeFocusMilestone.description,
        },
        salaryProgression: initialSalaryProgression,
        stages: finalStages,
      });
    } catch {
      toast.error('Failed to generate real-time Career GPS Roadmap.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGpsData();
  }, [fetchGpsData]);

  const handleRoleChange = (newRole: string) => {
    setTargetRole(newRole);
    fetchGpsData(newRole);
    toast.info(`Generated personalized Career GPS Roadmap for ${newRole}`);
  };

  const handleUpdateGoal = async (updated: { targetSalary?: string; targetTimeline?: string }) => {
    if (!data) return;

    const rawSalary = updated.targetSalary || data.targetSalary;
    const newSalary = (rawSalary || '1 - 3 LPA').replace(/₹/g, '').trim() || '1 - 3 LPA';
    const newTimeline = updated.targetTimeline || data.targetTimeline;

    // Dynamically project salary growth starting from the newly set target salary
    const updatedSalaryProgression = computeSalaryProgression(newSalary);

    setData({
      ...data,
      targetSalary: newSalary,
      targetTimeline: newTimeline,
      salaryProgression: updatedSalaryProgression,
    });

    const userId = data.userId || 'candidate';
    if (typeof window !== 'undefined') {
      localStorage.setItem(getGpsStorageKey('salary', userId), newSalary);
      localStorage.setItem(getGpsStorageKey('timeline', userId), newTimeline);
    }

    try {
      await profileService.updateProfile({
        targetSalary: newSalary,
        targetTimeline: newTimeline,
      });
      toast.success(`Updated Career Target: ${newSalary} • ${newTimeline}`);
    } catch (err) {
      console.error('Failed to sync target salary & timeline to profile:', err);
      toast.error('Failed to save goal to profile. Please check your connection.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Career GPS"
          description={`Your personalized milestone roadmap to achieve career readiness for ${targetRole}.`}
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
              Generating Dynamic Career GPS Roadmap for {targetRole}...
            </p>
          </div>
        ) : data ? (
          <>
            {/* Career Goal Header */}
            <CareerGoalHeader data={data} onUpdateGoal={handleUpdateGoal} />

            {/* Current Milestone Highlight */}
            <CurrentMilestoneWidget milestone={data.currentMilestone} />

            {/* Roadmap Timeline */}
            <RoadmapTimeline 
              stages={data.stages} 
              targetRole={data.targetRole}
              userId={data.userId}
              onStagesChange={(updatedStages) => {
                setData((prev) => prev ? { ...prev, stages: updatedStages } : prev);
              }}
            />

            {/* Salary Progression Chart */}
            <SalaryProgressionChart items={data.salaryProgression} />
          </>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Unable to generate Career GPS Roadmap. Please check your connection and retry.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
