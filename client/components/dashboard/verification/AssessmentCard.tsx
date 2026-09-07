'use client';

import React from 'react';
import {
  Clock,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  FileCode2,
  Server,
  Cloud,
  Binary,
} from 'lucide-react';
import { AssessmentCatalogItem } from '@/types/verification';

interface AssessmentCardProps {
  track: AssessmentCatalogItem;
  onStartAssessment: (track: AssessmentCatalogItem) => void;
  onViewCertificate?: (certificate: {
    skillName: string;
    category: string;
    score: number;
    credentialHash: string;
    issueDate?: string;
  }) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Atom: <Layers className="w-6 h-6 text-[#61DAFB]" />,
  FileCode2: <FileCode2 className="w-6 h-6 text-[#3178C6]" />,
  Server: <Server className="w-6 h-6 text-[#339933]" />,
  Cloud: <Cloud className="w-6 h-6 text-[#FF9900]" />,
  Binary: <Binary className="w-6 h-6 text-[#3776AB]" />,
};

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  track,
  onStartAssessment,
  onViewCertificate,
}) => {
  const icon = iconMap[track.iconName] || <Award className="w-6 h-6 text-[#3D5AFE]" />;

  return (
    <div className="relative group p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:border-[#3D5AFE]/40">
      {/* Decorative Glow on hover */}
      <div
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-15 transition duration-500 pointer-events-none"
        style={{ backgroundColor: track.color || '#3D5AFE' }}
      />

      <div className="space-y-4">
        {/* Card Header: Icon + Category + Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner"
            style={{
              backgroundColor: `${track.color}15`,
              borderColor: `${track.color}35`,
            }}
          >
            {icon}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {track.category}
            </span>

            {track.completed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            ) : track.status === 'failed' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                Retake Needed
              </span>
            ) : null}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#3D5AFE] dark:group-hover:text-[#8098FF] transition">
            {track.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {track.description}
          </p>
        </div>

        {/* Key Metrics Pill Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] block font-medium">
              Duration
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              {track.durationMinutes} Mins
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] block font-medium">
              Questions
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
              <HelpCircle className="w-3 h-3 text-slate-400" />
              {track.totalQuestions} MCQs
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] block font-medium">
              Passing Mark
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
              {track.passingScore}%
            </span>
          </div>
        </div>

        {/* Score Preview if Completed */}
        {track.completed && track.lastScore !== null && track.lastScore !== undefined && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs">
            <span className="text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Score Earned: <strong>{track.lastScore}%</strong>
            </span>
            {track.credentialHash && onViewCertificate && (
              <button
                onClick={() =>
                  onViewCertificate({
                    skillName: track.skillName,
                    category: track.category,
                    score: track.lastScore || 100,
                    credentialHash: track.credentialHash!,
                    issueDate: track.verifiedDate || undefined,
                  })
                }
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                View Credential
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 mt-2">
        <button
          onClick={() => onStartAssessment(track)}
          className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            track.completed
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              : 'bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] text-white shadow-md shadow-[#3D5AFE]/20 hover:opacity-95'
          }`}
        >
          {track.completed ? (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Retake Assessment</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Start Assessment</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
