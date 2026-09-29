'use client';

import React, { useState } from 'react';
import { ResumeDiffSection } from '@/types/resume-comparison.types';
import { ComparisonChangeVM, ResumeComparisonViewModel } from '@/types/resume-comparison-view.types';
import { ResumeComparisonChangeCard } from './ResumeComparisonChangeCard';

export interface ResumeSideBySideViewProps {
  viewModel: ResumeComparisonViewModel;
  onOpenEvidence: (changeId: string) => void;
  onNavigateToResume: (change: ComparisonChangeVM) => void;
}

const SECTION_TABS: { key: 'all' | ResumeDiffSection; label: string }[] = [
  { key: 'all', label: 'All Changes' },
  { key: 'summary', label: 'Summary' },
  { key: 'skills', label: 'Skills' },
  { key: 'experience', label: 'Experience' },
  { key: 'projects', label: 'Projects' },
  { key: 'education', label: 'Education' },
  { key: 'layout', label: 'Layout' },
];

export const ResumeSideBySideView: React.FC<ResumeSideBySideViewProps> = ({
  viewModel,
  onOpenEvidence,
  onNavigateToResume,
}) => {
  const [selectedSection, setSelectedSection] = useState<'all' | ResumeDiffSection>('all');

  const displayedChanges =
    selectedSection === 'all'
      ? viewModel.allChanges
      : viewModel.changesBySection[selectedSection] || [];

  return (
    <div data-testid="resume-side-by-side-view" className="flex flex-col gap-4">
      {/* Section Filter Pills */}
      <div
        role="tablist"
        aria-label="Filter changes by section"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
      >
        {SECTION_TABS.map((tab) => {
          const count =
            tab.key === 'all'
              ? viewModel.totalChanges
              : viewModel.sectionCounts[tab.key] || 0;

          const isSelected = selectedSection === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              data-testid={`side-by-side-tab-${tab.key}`}
              onClick={() => setSelectedSection(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  isSelected
                    ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Changes Feed */}
      {displayedChanges.length > 0 ? (
        <div className="flex flex-col gap-4">
          {displayedChanges.map((change) => (
            <ResumeComparisonChangeCard
              key={change.id}
              change={change}
              onOpenEvidence={onOpenEvidence}
              onNavigateToResume={onNavigateToResume}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          No changes found in this section.
        </div>
      )}
    </div>
  );
};
