import React from 'react';
import { ResumeSummary } from '@/types/resume-document';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';
import { resolveConfigClasses } from './templates';

interface SummarySectionProps {
  summary?: ResumeSummary;
  isHighlighted?: boolean;
  onClick?: () => void;
  config?: ResumeBuilderConfig | null;
}

export const SummarySection: React.FC<SummarySectionProps> = React.memo(({
  summary,
  isHighlighted,
  onClick,
  config,
}) => {
  if (!summary?.text?.trim()) return null;

  const { template, sectionSpacingClass, lineHeightClass } = resolveConfigClasses(config);

  return (
    <section
      id="resume-section-summary"
      onClick={onClick}
      className={`transition-all duration-200 break-inside-avoid print:break-inside-avoid ${sectionSpacingClass} ${
        isHighlighted
          ? 'ring-2 ring-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-lg p-3 -m-3'
          : onClick
          ? 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-lg p-1 -m-1'
          : ''
      }`}
    >
      <h2 className={template.sectionHeaderStyle}>
        Professional Summary
      </h2>
      <p className={`text-slate-700 dark:text-slate-300 ${lineHeightClass} text-justify`}>
        {summary.text}
      </p>
    </section>
  );
});

SummarySection.displayName = 'SummarySection';
