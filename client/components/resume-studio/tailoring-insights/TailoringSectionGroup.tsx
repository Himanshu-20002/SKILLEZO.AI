'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Code2, Briefcase, FolderGit2 } from 'lucide-react';
import {
  TailoringInsightCategory,
  TailoringInsightItem,
  StudioSectionKey,
} from '@/types/tailoring-insights.types';
import { TailoringInsightCard } from './TailoringInsightCard';

export interface TailoringSectionGroupProps {
  category: TailoringInsightCategory;
  title: string;
  items: TailoringInsightItem[];
  onNavigateToSection?: (
    category: TailoringInsightCategory,
    sectionKey: StudioSectionKey | null,
    entityId?: string
  ) => void;
  defaultExpanded?: boolean;
  className?: string;
}

function getSectionIcon(category: TailoringInsightCategory) {
  switch (category) {
    case 'SUMMARY':
      return FileText;
    case 'SKILLS':
      return Code2;
    case 'EXPERIENCE':
      return Briefcase;
    case 'PROJECTS':
      return FolderGit2;
    default:
      return FileText;
  }
}

export const TailoringSectionGroup: React.FC<TailoringSectionGroupProps> = ({
  category,
  title,
  items,
  onNavigateToSection,
  defaultExpanded = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const Icon = getSectionIcon(category);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label={`${title} section insights`}
      className={`rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className="w-full flex items-center justify-between p-3 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 transition-colors border-b border-slate-200/60 dark:border-slate-800/80 text-left focus:outline-hidden"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {title}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {items.length}
          </span>
        </div>

        <div className="text-slate-400 dark:text-slate-500">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-3 space-y-3">
          {items.map(item => (
            <TailoringInsightCard
              key={item.id}
              item={item}
              onNavigateToSection={onNavigateToSection}
            />
          ))}
        </div>
      )}
    </div>
  );
};
