import React from 'react';
import { ResumeSummary } from '@/types/resume-document';

interface SummarySectionProps {
  summary?: ResumeSummary;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  summary,
  isHighlighted,
  onClick,
}) => {
  if (!summary?.text?.trim()) return null;

  return (
    <section
      id="resume-section-summary"
      onClick={onClick}
      className={`transition-all duration-200 mb-6 ${
        isHighlighted
          ? 'ring-2 ring-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-lg p-3 -m-3'
          : onClick
          ? 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-lg p-1 -m-1'
          : ''
      }`}
    >
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-700 pb-1 mb-2 font-mono">
        Summary
      </h2>
      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
        {summary.text}
      </p>
    </section>
  );
};
