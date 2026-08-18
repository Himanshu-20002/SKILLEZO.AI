'use client';

import React from 'react';
import { FileText, Code2 } from 'lucide-react';
import { ResumeExtractedData } from '@/types/resume';

interface ResumePreviewProps {
  data: ResumeExtractedData;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Parsed Resume Preview</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Structured data extracted by AI parser</p>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium">{data.fileName}</span>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-3 text-xs">
        <div className="space-y-1 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{data.candidateName}</h3>
            <span className="text-slate-500">{data.location}</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 italic">{data.summary}</p>
        </div>

        <div className="space-y-1.5">
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-[#3D5AFE]" />
            Extracted Technologies ({data.skillsExtracted.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {data.skillsExtracted.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
