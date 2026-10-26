'use client';

import React from 'react';
import {
  FileText,
  Clock,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { PdfDocumentItem, LearningDifficulty } from '@/types/learning-hub';

interface PdfCardProps {
  pdf: PdfDocumentItem;
  onPreview: (pdf: PdfDocumentItem) => void;
  onConvertToQuiz: (pdf: PdfDocumentItem) => void;
  isConverting?: boolean;
}

const DIFFICULTY_STYLES: Record<
  LearningDifficulty,
  { bg: string; text: string; label: string }
> = {
  beginner: {
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Beginner',
  },
  intermediate: {
    bg: 'bg-blue-500/10 border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    label: 'Intermediate',
  },
  advanced: {
    bg: 'bg-purple-500/10 border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    label: 'Advanced',
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: 'from-blue-600 to-indigo-600',
  Backend: 'from-emerald-600 to-teal-600',
  Database: 'from-amber-600 to-orange-600',
  DevOps: 'from-rose-600 to-pink-600',
  'System Design': 'from-purple-600 to-violet-600',
};

export const PdfCard: React.FC<PdfCardProps> = ({
  pdf,
  onPreview,
  onConvertToQuiz,
  isConverting = false,
}) => {
  const diffStyle = DIFFICULTY_STYLES[pdf.difficulty] || DIFFICULTY_STYLES.intermediate;
  const gradientClass =
    CATEGORY_COLORS[pdf.category] || 'from-indigo-600 to-[#3D5AFE]';

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
      {/* Top Banner Gradient Thumbnail */}
      <div className={`h-24 bg-gradient-to-r ${gradientClass} relative p-4 flex items-start justify-between text-white overflow-hidden`}>
        {/* Abstract pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[11px] font-medium tracking-wide uppercase text-white/80 block">
              {pdf.category}
            </span>
            <span className="text-xs font-bold text-white tracking-tight">
              Technical Cheat-Sheet
            </span>
          </div>
        </div>

        {/* Page Count Badge */}
        <div className="relative z-10 flex items-center gap-1 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-white/95 border border-white/20">
          <Layers className="w-3 h-3" />
          <span>{pdf.pdfPageCount} pgs</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata badges row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${diffStyle.bg} ${diffStyle.text}`}
            >
              {diffStyle.label}
            </span>

            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{pdf.estimatedMinutes} min read</span>
            </span>

            {pdf.hasExtractedQuiz && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ml-auto">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{pdf.questionsCount || 5} Qs Quiz</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#3D5AFE] dark:group-hover:text-[#536DFE] transition-colors line-clamp-2 mb-2">
            {pdf.title}
          </h3>

          {/* Summary */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
            {pdf.summary}
          </p>

          {/* Skills pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {pdf.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
              >
                {skill}
              </span>
            ))}
            {pdf.skills.length > 4 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                +{pdf.skills.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
          {/* Read / Preview Button */}
          <button
            onClick={() => onPreview(pdf)}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            title="Read Guide & Preview"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Read Guide</span>
          </button>

          {/* AI Quiz Blitz Button */}
          <button
            onClick={() => onConvertToQuiz(pdf)}
            disabled={isConverting}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#3D5AFE] hover:bg-[#324bdf] disabled:opacity-50 text-white transition-all shadow-sm shadow-[#3D5AFE]/20 flex items-center justify-center gap-1.5 group/btn"
            title="Extract interactive AI Quiz"
          >
            {isConverting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover/btn:rotate-12 transition-transform" />
            )}
            <span>AI Practice Qs</span>
          </button>
        </div>
      </div>
    </div>
  );
};
