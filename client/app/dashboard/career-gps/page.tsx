'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { CareerGoalHeader } from '@/components/dashboard/career-gps/CareerGoalHeader';
import { RoadmapTimeline } from '@/components/dashboard/career-gps/RoadmapTimeline';
import { CurrentMilestoneWidget } from '@/components/dashboard/career-gps/CurrentMilestoneWidget';
import { SalaryProgressionChart } from '@/components/dashboard/career-gps/SalaryProgressionChart';

import { mockCareerIntelligence } from '@/mock/career-intelligence';
import { CareerGPSData, RoadmapStage } from '@/types/career-intelligence';
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

export default function CareerGPSPage() {
  const [data, setData] = useState<CareerGPSData>(mockCareerIntelligence.careerRoadmap);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [targetRole, setTargetRole] = useState<string>('Full-Stack Engineer');

  const fetchGpsData = useCallback(async (role: string) => {
    setIsLoading(true);
    try {
      const gpsResult = await employabilityService.getCareerGps(role);
      if (gpsResult && gpsResult.milestones) {
        // Map dynamic milestones into structured roadmap stages
        const dynamicStages: RoadmapStage[] = gpsResult.milestones.map((m, idx) => ({
          id: m.id || `stage-${idx + 1}`,
          stageNumber: idx + 1,
          title: m.title,
          status: idx === 0 ? 'In Progress' : 'Pending',
          completionPercentage: idx === 0 ? 35 : 0,
          description: m.description,
          actionText: m.priority === 'HIGH' ? 'High-Priority Focus' : 'Explore Tasks',
        }));

        const firstMilestone = gpsResult.milestones[0];

        setData((prev) => ({
          ...prev,
          targetRole: role,
          targetTimeline: `${gpsResult.totalEstimatedWeeks || 8} Weeks`,
          currentMilestone: firstMilestone ? {
            focusTitle: firstMilestone.title,
            progressPercentage: 35,
            nextAction: firstMilestone.description,
          } : prev.currentMilestone,
          stages: dynamicStages.length > 0 ? dynamicStages : prev.stages,
        }));
      }
    } catch {
      // Fallback to demo structure if offline
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGpsData(targetRole);
  }, [fetchGpsData, targetRole]);

  const handleRoleChange = (newRole: string) => {
    setTargetRole(newRole);
    fetchGpsData(newRole);
    toast.info(`Generated Career GPS Roadmap for ${newRole}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Career GPS"
          description={`Your personalized milestone roadmap to achieve career readiness for ${targetRole}.`}
          badge="Module 23 • Career GPS"
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
        ) : (
          <>
            {/* Career Goal Header */}
            <CareerGoalHeader data={data} />

            {/* Current Milestone Highlight */}
            <CurrentMilestoneWidget milestone={data.currentMilestone} />

            {/* Roadmap Timeline */}
            <RoadmapTimeline stages={data.stages} />

            {/* Salary Progression Chart */}
            <SalaryProgressionChart items={data.salaryProgression} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
