'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ResumeUploaderProps {
  currentFileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  onSimulateUpload?: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  currentFileName = "Resume.pdf",
  fileSize = "1.2 MB",
  uploadedAt = "Just now",
  onSimulateUpload,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUploadClick = () => {
    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          onSimulateUpload?.();
          toast.success('Resume analyzed successfully!');
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#00D9C0]">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Resume Upload & Parsing</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">PDF or DOCX document (Max 5MB)</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Active Parser</span>
        </span>
      </div>

      <div
        onClick={handleUploadClick}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isUploading
            ? 'border-[#3D5AFE] bg-[#3D5AFE]/5'
            : 'border-slate-300 dark:border-slate-700 hover:border-[#3D5AFE] dark:hover:border-[#00D9C0] hover:bg-slate-50 dark:hover:bg-slate-800/40'
        }`}
      >
        {!isUploading ? (
          <div className="space-y-2">
            <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-[#3D5AFE] dark:text-[#00D9C0]">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Click to upload or drag & drop resume
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Supports .PDF, .DOCX — Automated ATS parsing active
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#3D5AFE] dark:text-[#00D9C0]">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Analyzing Document Structure ({uploadProgress}%)...</span>
            </div>
            <div className="w-full max-w-xs mx-auto h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-xs">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-[#3D5AFE]" />
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{currentFileName}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {fileSize} • Uploaded on {uploadedAt}
            </span>
          </div>
        </div>

        <button
          onClick={handleUploadClick}
          className="px-3 py-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
        >
          Re-analyze
        </button>
      </div>
    </div>
  );
};
