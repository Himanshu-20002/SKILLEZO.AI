'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Target,
  DollarSign,
  Calendar,
  Edit3,
  Check,
  X,
  Plus,
  Minus,
  Sparkles
} from 'lucide-react';
import { CareerGPSData } from '@/types/career-intelligence';

interface CareerGoalHeaderProps {
  data: CareerGPSData;
  onUpdateGoal?: (updated: { targetSalary?: string; targetTimeline?: string }) => void;
}

const SALARY_PRESETS = [
  '1 - 3 LPA',
  '3 - 6 LPA',
  '6 - 9 LPA',
  '8 - 12 LPA',
  '12 - 18 LPA',
  '18 - 25 LPA',
  '25 - 35 LPA',
  '35 - 50 LPA',
  '50+ LPA',
  '$90k - $130k USD',
  '$140k - $180k USD',
];

const TIMELINE_PRESETS = [
  '1 Week',
  '2 Weeks',
  '4 Weeks',
  '6 Weeks',
  '8 Weeks',
  '10 Weeks',
  '12 Weeks',
  '16 Weeks',
  '24 Weeks',
];

export const CareerGoalHeader: React.FC<CareerGoalHeaderProps> = ({ data, onUpdateGoal }) => {
  // Editing state for Target Salary
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState((data.targetSalary || '12 - 18 LPA').replace(/₹/g, '').trim());

  // Editing state for Target Timeline
  const [isEditingTimeline, setIsEditingTimeline] = useState(false);
  const [timelineInput, setTimelineInput] = useState(data.targetTimeline);

  // Synchronize when data updates asynchronously or on reload
  useEffect(() => {
    setSalaryInput((data.targetSalary || '12 - 18 LPA').replace(/₹/g, '').trim());
  }, [data.targetSalary]);

  useEffect(() => {
    setTimelineInput(data.targetTimeline);
  }, [data.targetTimeline]);

  // Parse weeks number from string (e.g. "8 Weeks" -> 8, "1 Week" -> 1)
  const parseWeeks = (str: string): number => {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : 8;
  };

  const handleSaveSalary = (salaryToSave?: string) => {
    const finalSalary = (salaryToSave || salaryInput).replace(/₹/g, '').trim();
    if (finalSalary && finalSalary !== data.targetSalary) {
      onUpdateGoal?.({ targetSalary: finalSalary });
    }
    setIsEditingSalary(false);
  };

  const handleSaveTimeline = (timelineToSave?: string) => {
    const finalTimeline = (timelineToSave || timelineInput).trim();
    if (finalTimeline && finalTimeline !== data.targetTimeline) {
      onUpdateGoal?.({ targetTimeline: finalTimeline });
    }
    setIsEditingTimeline(false);
  };

  const handleStepSalary = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = (data.targetSalary || '12 - 18 LPA').replace(/₹/g, '').trim();
    const curIdx = SALARY_PRESETS.findIndex((p) => p.toLowerCase() === current.toLowerCase());

    let nextIdx = 4;
    if (curIdx >= 0) {
      nextIdx = curIdx + delta;
    } else {
      const numMatch = current.match(/\d+/);
      const num = numMatch ? parseInt(numMatch[0], 10) : 12;
      const foundIdx = SALARY_PRESETS.findIndex((p) => {
        const pNum = p.match(/\d+/);
        return pNum && parseInt(pNum[0], 10) >= num;
      });
      nextIdx = (foundIdx >= 0 ? foundIdx : 4) + delta;
    }

    // Minimum floor at index 0 ('1 - 3 LPA')
    const clampedIdx = Math.max(0, Math.min(SALARY_PRESETS.length - 1, nextIdx));
    const nextSalary = SALARY_PRESETS[clampedIdx];

    setSalaryInput(nextSalary);
    onUpdateGoal?.({ targetSalary: nextSalary });
  };

  const handleStepWeeks = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentWeeks = parseWeeks(data.targetTimeline);
    const newWeeks = Math.max(1, Math.min(52, currentWeeks + delta));
    const newTimelineStr = newWeeks === 1 ? '1 Week' : `${newWeeks} Weeks`;
    setTimelineInput(newTimelineStr);
    onUpdateGoal?.({ targetTimeline: newTimelineStr });
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#3D5AFE]/10 via-slate-900/5 to-[#00D9C0]/10 dark:from-slate-900/80 dark:to-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#00D9C0]">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Career GPS Goal &amp; Horizon
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#3D5AFE] dark:text-[#00D9C0] bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
                <Sparkles className="w-3 h-3" />
                Customizable Targets
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize target compensation &amp; timeline duration — updates synchronized to profile
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* 1. Target Role Card */}
        <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1 backdrop-blur-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#3D5AFE]" />
            Target Role
          </span>
          <p className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
            {data.targetRole}
          </p>
          <span className="text-[10px] text-slate-400 block">Switch role using top selector</span>
        </div>

        {/* 2. Target Salary Card (Stepper with + and -) */}
        <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5 backdrop-blur-sm relative group">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              Target Salary
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => handleStepSalary(-1, e)}
                title="Decrease salary tier (min 1 - 3 LPA)"
                className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => handleStepSalary(1, e)}
                title="Increase salary tier"
                className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div>
            <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
              {(data.targetSalary || '12 - 18 LPA').replace(/₹/g, '').trim()}
            </p>
            <span className="text-[10px] text-slate-400 block">Use + / - to adjust target bracket (min 1 - 3 LPA)</span>
          </div>
        </div>

        {/* 3. Target Timeline Card (Editable & Stepper) */}
        <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5 backdrop-blur-sm relative group">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-500" />
              Target Timeline
            </span>

            {/* Quick Step Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => handleStepWeeks(-1, e)}
                title="Decrease 1 week (min 1 week)"
                className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 text-slate-600 dark:text-slate-300 hover:text-cyan-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => handleStepWeeks(1, e)}
                title="Increase 1 week"
                className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 text-slate-600 dark:text-slate-300 hover:text-cyan-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {!isEditingTimeline ? (
            <div
              onClick={() => {
                setTimelineInput(data.targetTimeline);
                setIsEditingTimeline(true);
              }}
              className="cursor-pointer group-hover:opacity-90"
            >
              <p className="font-extrabold text-cyan-600 dark:text-cyan-400 text-base">
                {data.targetTimeline}
              </p>
              <span className="text-[10px] text-slate-400 block">Use + / - or click to change duration (min 1 week)</span>
            </div>
          ) : (
            <div className="space-y-2 pt-1 animate-fadeIn">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={timelineInput}
                  onChange={(e) => setTimelineInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTimeline()}
                  placeholder="e.g. 10 Weeks"
                  autoFocus
                  className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-cyan-300 dark:border-cyan-700 bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={() => handleSaveTimeline()}
                  className="p-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors cursor-pointer shrink-0"
                  title="Save target timeline"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingTimeline(false)}
                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer shrink-0"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Timeline Preset Weeks */}
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {TIMELINE_PRESETS.slice(0, 5).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setTimelineInput(preset);
                      handleSaveTimeline(preset);
                    }}
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100 border border-cyan-200/60 dark:border-cyan-800/60 cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
