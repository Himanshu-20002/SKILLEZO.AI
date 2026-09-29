'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  TailoringCategoryFilter,
  TailoringInsightCategory,
  TailoringInsightsViewModel,
  StudioSectionKey,
} from '@/types/tailoring-insights.types';
import { TailoringInsightsHeader } from './TailoringInsightsHeader';
import { TailoringSummaryMetrics } from './TailoringSummaryMetrics';
import { TailoringSectionGroup } from './TailoringSectionGroup';
import { TailoringNotAddedSection } from './TailoringNotAddedSection';
import { TailoringInsightCard } from './TailoringInsightCard';

export interface TailoringInsightsPanelProps {
  viewModel: TailoringInsightsViewModel | null;
  isLoading: boolean;
  error: string | null;
  onRefetch?: () => void;
  onOpenComparison?: () => void;
  onNavigateToSection?: (
    category: TailoringInsightCategory,
    sectionKey: StudioSectionKey | null,
    entityId?: string
  ) => void;
  className?: string;
}

export const TailoringInsightsPanel: React.FC<TailoringInsightsPanelProps> = ({
  viewModel,
  isLoading,
  error,
  onRefetch,
  onOpenComparison,
  onNavigateToSection,
  className = '',
}) => {
  const [activeFilter, setActiveFilter] = useState<TailoringCategoryFilter>('ALL');

  const filterTabs: Array<{ id: TailoringCategoryFilter; label: string; count: number }> = useMemo(() => {
    if (!viewModel) return [];
    return [
      { id: 'ALL', label: 'All Items', count: viewModel.items.length },
      { id: 'SUMMARY', label: 'Summary', count: viewModel.summary.sectionCounts.SUMMARY },
      { id: 'SKILLS', label: 'Skills', count: viewModel.summary.sectionCounts.SKILLS },
      { id: 'EXPERIENCE', label: 'Experience', count: viewModel.summary.sectionCounts.EXPERIENCE },
      { id: 'PROJECTS', label: 'Projects', count: viewModel.summary.sectionCounts.PROJECTS },
      { id: 'NOT_ADDED', label: 'Not Added', count: viewModel.summary.sectionCounts.NOT_ADDED },
    ];
  }, [viewModel]);

  // Loading skeleton state
  if (isLoading && !viewModel) {
    return (
      <div
        role="status"
        aria-label="Loading tailoring insights"
        className={`p-4 space-y-4 animate-pulse ${className}`}
      >
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="space-y-3">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error && !viewModel) {
    return (
      <div
        role="alert"
        className={`p-6 text-center rounded-xl border border-rose-500/20 bg-rose-500/5 m-4 ${className}`}
      >
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" aria-hidden="true" />
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Unable to Load Tailoring Insights
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          {error}
        </p>
        {onRefetch && (
          <button
            type="button"
            onClick={onRefetch}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (!viewModel || viewModel.items.length === 0) {
    return (
      <div className={`p-8 text-center m-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 ${className}`}>
        <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-50" aria-hidden="true" />
        <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
          No Tailoring Insights Available
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          This resume does not currently have upstream job match or tailoring proposal data linked.
        </p>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Tailoring Insights Panel"
      className={`space-y-4 p-4 ${className}`}
    >
      {/* 1. Header Banner */}
      <TailoringInsightsHeader
        targetRole={viewModel.targetRole}
        targetCompany={viewModel.targetCompany}
        totalChanges={viewModel.summary.totalAppliedChanges}
        onOpenComparison={onOpenComparison}
      />

      {/* 2. Summary Metrics 4-Stat Grid */}
      <TailoringSummaryMetrics summary={viewModel.summary} />

      {/* 3. Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {filterTabs.map(tab => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-label={`Filter by ${tab.label}`}
              aria-pressed={isActive}
              onClick={() => setActiveFilter(tab.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 select-none ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-indigo-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Filtered Content Display */}
      {activeFilter === 'ALL' && (
        <div className="space-y-3">
          <TailoringSectionGroup
            category="SUMMARY"
            title="Professional Summary"
            items={viewModel.itemsByCategory.SUMMARY}
            onNavigateToSection={onNavigateToSection}
          />
          <TailoringSectionGroup
            category="SKILLS"
            title="Skills & Competencies"
            items={viewModel.itemsByCategory.SKILLS}
            onNavigateToSection={onNavigateToSection}
          />
          <TailoringSectionGroup
            category="EXPERIENCE"
            title="Work Experience"
            items={viewModel.itemsByCategory.EXPERIENCE}
            onNavigateToSection={onNavigateToSection}
          />
          <TailoringSectionGroup
            category="PROJECTS"
            title="Projects & Deliverables"
            items={viewModel.itemsByCategory.PROJECTS}
            onNavigateToSection={onNavigateToSection}
          />
          <TailoringNotAddedSection items={viewModel.notAddedItems} />
        </div>
      )}

      {activeFilter === 'SUMMARY' && (
        <div className="space-y-3">
          {viewModel.itemsByCategory.SUMMARY.length > 0 ? (
            viewModel.itemsByCategory.SUMMARY.map(item => (
              <TailoringInsightCard
                key={item.id}
                item={item}
                onNavigateToSection={onNavigateToSection}
              />
            ))
          ) : (
            <p className="text-xs text-slate-500 p-4 text-center">No summary modifications applied.</p>
          )}
        </div>
      )}

      {activeFilter === 'SKILLS' && (
        <div className="space-y-3">
          {viewModel.itemsByCategory.SKILLS.length > 0 ? (
            viewModel.itemsByCategory.SKILLS.map(item => (
              <TailoringInsightCard
                key={item.id}
                item={item}
                onNavigateToSection={onNavigateToSection}
              />
            ))
          ) : (
            <p className="text-xs text-slate-500 p-4 text-center">No skills modifications applied.</p>
          )}
        </div>
      )}

      {activeFilter === 'EXPERIENCE' && (
        <div className="space-y-3">
          {viewModel.itemsByCategory.EXPERIENCE.length > 0 ? (
            viewModel.itemsByCategory.EXPERIENCE.map(item => (
              <TailoringInsightCard
                key={item.id}
                item={item}
                onNavigateToSection={onNavigateToSection}
              />
            ))
          ) : (
            <p className="text-xs text-slate-500 p-4 text-center">No experience modifications applied.</p>
          )}
        </div>
      )}

      {activeFilter === 'PROJECTS' && (
        <div className="space-y-3">
          {viewModel.itemsByCategory.PROJECTS.length > 0 ? (
            viewModel.itemsByCategory.PROJECTS.map(item => (
              <TailoringInsightCard
                key={item.id}
                item={item}
                onNavigateToSection={onNavigateToSection}
              />
            ))
          ) : (
            <p className="text-xs text-slate-500 p-4 text-center">No projects modifications applied.</p>
          )}
        </div>
      )}

      {activeFilter === 'NOT_ADDED' && (
        <TailoringNotAddedSection items={viewModel.notAddedItems} />
      )}
    </div>
  );
};
