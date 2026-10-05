'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileText,
  Sparkles,
  ShieldCheck,
  Target,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface ResumeStudioUploadGatewayProps {
  onFileUpload: (file: File) => void;
  isUploading?: boolean;
}

export const ResumeStudioUploadGateway: React.FC<ResumeStudioUploadGatewayProps> = ({
  onFileUpload,
  isUploading = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1130] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-900/5 p-6 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Resume Studio Gateway</span>
        </div>

        {/* Headline & Explanation */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Upload Your Resume to Enter Studio
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Upload your existing resume to initialize your Master Resume. Our AI will automatically parse your facts, unlock 4-pillar ATS diagnostics, and enable job tailoring.
          </p>
        </div>

        {/* Interactive Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!isUploading) {
              fileInputRef.current?.click();
            }
          }}
          className={`relative group rounded-2xl border-2 border-dashed p-8 sm:p-10 transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
            {isUploading ? (
              <RefreshCw className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isUploading ? (
                <span className="text-indigo-600 dark:text-indigo-400">Uploading and parsing your resume...</span>
              ) : (
                <>
                  <span className="text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              PDF documents only • Up to 10MB
            </p>
          </div>

          <button
            type="button"
            disabled={isUploading}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Resume...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Browse Computer</span>
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Features / Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Deterministic ATS</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">4-pillar scoring & formatting audit</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
            <Target className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Role Tailoring</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tailored variants for targeted roles</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Profile Hydration</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Auto-fills experience, skills & edu</p>
            </div>
          </div>
        </div>

        {/* Alternative Link: Profile Builder */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>Prefer to fill out your details manually? </span>
          <Link
            href="/dashboard/profile"
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span>Complete Career Profile</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
