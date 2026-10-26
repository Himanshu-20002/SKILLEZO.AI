'use client';

import React from 'react';
import {
  X,
  FileText,
  Clock,
  Download,
  Sparkles,
  ExternalLink,
  Layers,
  BookOpen,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { PdfDocumentItem } from '@/types/learning-hub';

interface PdfPreviewModalProps {
  pdf: PdfDocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConvertToQuiz: (pdf: PdfDocumentItem) => void;
  isConverting?: boolean;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  pdf,
  isOpen,
  onClose,
  onConvertToQuiz,
  isConverting = false,
}) => {
  if (!isOpen || !pdf) return null;

  const previewUrl = `/api/learning-hub/vault/pdfs/${encodeURIComponent(pdf.id)}/preview`;
  const downloadUrl = `/api/learning-hub/vault/pdfs/${encodeURIComponent(pdf.id)}/preview?download=true`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3D5AFE]/10 text-[#3D5AFE] flex items-center justify-center shrink-0 border border-[#3D5AFE]/20 mt-0.5">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D5AFE]/10 text-[#3D5AFE] uppercase tracking-wider">
                  {pdf.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <Layers className="w-3 h-3 text-slate-400" />
                  <span>{pdf.pdfPageCount} Pages</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{pdf.estimatedMinutes} Mins</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Provider: {pdf.provider}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {pdf.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Document Preview & Syllabus Summary */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Document Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#3D5AFE]" />
              <span>Guide Synopsis & Core Takeaways</span>
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {pdf.summary}
            </p>
          </div>

          {/* Key Engineering Skills Covered */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
              Tested Technical Skills & Domains
            </h4>
            <div className="flex flex-wrap gap-2">
              {pdf.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* In-Browser PDF Streaming Frame / Notice */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-900 text-slate-100">
            <div className="p-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-200">
                  PDF Binary Stream Ready
                </span>
                <span className="text-slate-400">
                  ({pdf.pdfPageCount} pages, zero-disk memory buffer)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open in Full Tab</span>
                </a>
              </div>
            </div>

            <div className="p-8 text-center bg-slate-950/80">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#3D5AFE]/20 text-[#3D5AFE] flex items-center justify-center mb-3">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-100 mb-1">
                {pdf.title}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                Curated technical document verified by SKILLEZO Staff Engineers. Open directly in your browser or extract interactive AI practice quizzes.
              </p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-4 rounded-xl text-xs font-semibold bg-[#3D5AFE] hover:bg-[#324bdf] text-white transition-colors inline-flex items-center gap-1.5 shadow-md shadow-[#3D5AFE]/30"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View PDF Document</span>
                </a>
                {pdf.downloadAllowed && (
                  <a
                    href={downloadUrl}
                    className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Copy</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Curated & indexed for senior technical interviews</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => onConvertToQuiz(pdf)}
              disabled={isConverting}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-[#3D5AFE] hover:bg-[#324bdf] disabled:opacity-50 text-white transition-all shadow-md shadow-[#3D5AFE]/20 flex items-center gap-1.5"
            >
              {isConverting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>Extract AI Practice Quiz</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
