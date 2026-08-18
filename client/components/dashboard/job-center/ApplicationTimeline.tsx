'use client';

import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { ApplicationTimelineEvent } from '@/types/job-center';

interface ApplicationTimelineProps {
  timeline: ApplicationTimelineEvent[];
}

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ timeline }) => {
  return (
    <div className="space-y-3 pt-2">
      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Application Progression Timeline</h4>
      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {timeline.map((evt, idx) => (
          <div key={idx} className="relative text-xs">
            <div className="absolute -left-6 top-0.5">
              {evt.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 bg-white dark:bg-slate-900 rounded-full" />
              ) : evt.isCurrent ? (
                <Clock className="w-4 h-4 text-[#3D5AFE] dark:text-[#00D9C0] bg-white dark:bg-slate-900 rounded-full animate-pulse" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700 bg-white dark:bg-slate-900 rounded-full" />
              )}
            </div>
            <div>
              <span
                className={`font-semibold block ${
                  evt.completed
                    ? 'text-slate-900 dark:text-slate-100'
                    : evt.isCurrent
                    ? 'text-[#3D5AFE] dark:text-[#00D9C0] font-bold'
                    : 'text-slate-400'
                }`}
              >
                {evt.title}
              </span>
              <span className="text-[11px] text-slate-500">{evt.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
