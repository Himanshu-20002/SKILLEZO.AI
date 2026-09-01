'use client';

import React from 'react';
import { FileText, Code2, MapPin } from 'lucide-react';
import { ResumeExtractedData } from '@/types/resume';

interface ResumePreviewProps {
  data: ResumeExtractedData;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  const candidateName = data.candidateName || data.personalInfo?.fullName || 'Candidate';
  const rawLoc = data.location || data.personalInfo?.location || '';
  const cleanLocation = rawLoc
    ? rawLoc.replace(new RegExp(candidateName, 'gi'), '').replace(/^[,\s|/.-]+/, '').trim()
    : '';

  const skillsList = data.skillsExtracted || (data.skills || []).map((s: any) => s.name || s) || [];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
            Resume Summary
          </h2>
        </div>

        {data.fileName && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 max-w-[130px] truncate shrink-0"
            title={data.fileName}
          >
            <FileText className="w-3 h-3 text-purple-500 shrink-0" />
            <span className="truncate">{data.fileName}</span>
          </span>
        )}
      </div>

      {/* Structured Card Content */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-3 text-xs">
        {/* Candidate Info Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {candidateName}
            </h3>
            {(data.email || data.phone) && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {[data.email, data.phone].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>

          {cleanLocation && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-medium px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
              <MapPin className="w-3 h-3 text-[#3D5AFE]" />
              <span>{cleanLocation}</span>
            </span>
          )}
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="p-3 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              {data.summary}
            </p>
          </div>
        )}

        {/* Technologies */}
        {skillsList.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-semibold">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#3D5AFE]" />
                Extracted Technologies
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#00D9C0]">
                {skillsList.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

