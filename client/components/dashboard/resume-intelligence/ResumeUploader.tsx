'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, Sparkles, FileUp, ChevronDown, Eye, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ResumeRecord } from '@/types/resume';
import { resumeService } from '@/services/resume.service';

interface ResumeUploaderProps {
  currentFileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  isUploading?: boolean;
  onUpload?: (file: File) => Promise<void> | void;
  userResumes?: ResumeRecord[];
  selectedResumeId?: string;
  onSelectResume?: (resume: ResumeRecord) => void;
  onDeleteResume?: (resumeId: string) => Promise<void> | void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  currentFileName = "Resume.pdf",
  fileSize = "1.2 MB",
  uploadedAt = "Just now",
  isUploading = false,
  onUpload,
  userResumes = [],
  selectedResumeId,
  onSelectResume,
  onDeleteResume,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const processFile = async (file: File) => {
    const isAllowed =
      file.name.toLowerCase().endsWith('.pdf') ||
      file.name.toLowerCase().endsWith('.docx') ||
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isAllowed) {
      toast.error('Please upload a .PDF or .DOCX document.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    onUpload?.(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleView = async () => {
    if (!selectedResumeId) return;
    setIsViewing(true);
    try {
      const blob = await resumeService.getResumeBlob(selectedResumeId, true);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err: any) {
      toast.error(err.message || 'Failed to open resume.');
    } finally {
      setIsViewing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedResumeId || !onDeleteResume) return;
    if (!window.confirm(`Delete "${currentFileName}" permanently?`)) return;
    setIsDeleting(true);
    try {
      await onDeleteResume(selectedResumeId);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

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
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
        }}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isUploading
            ? 'border-[#3D5AFE] bg-[#3D5AFE]/5 cursor-not-allowed'
            : isDragging
            ? 'border-[#00D9C0] bg-[#00D9C0]/10 scale-[0.99]'
            : 'border-slate-300 dark:border-slate-700 hover:border-[#3D5AFE] dark:hover:border-[#00D9C0] hover:bg-slate-50 dark:hover:bg-slate-800/40'
        }`}
      >
        {!isUploading ? (
          <div className="space-y-2">
            <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-[#3D5AFE] dark:text-[#00D9C0]">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isDragging ? 'Drop resume to upload' : 'Click to select or drag & drop resume'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Supports .PDF, .DOCX — Uploads live to secure storage & runs ATS audit
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#3D5AFE] dark:text-[#00D9C0]">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Uploading & Parsing Document...</span>
            </div>
            <div className="w-full max-w-xs mx-auto h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] animate-pulse rounded-full w-full" />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-xs gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText className="w-4 h-4 text-[#3D5AFE] shrink-0" />
          <div className="min-w-0">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[180px] sm:max-w-[240px]">
              {currentFileName}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {fileSize} • Uploaded on {uploadedAt}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userResumes.length > 1 && onSelectResume && (
            <div className="relative">
              <select
                aria-label="Select uploaded resume"
                value={selectedResumeId || ''}
                onChange={(e) => {
                  const target = userResumes.find((r) => (r._id || r.id) === e.target.value);
                  if (target) onSelectResume(target);
                }}
                className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-1.5 px-2.5 pr-6 rounded-lg font-medium cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-[#3D5AFE]"
              >
                {userResumes.map((r) => (
                  <option key={r._id || r.id} value={r._id || r.id}>
                    {r.title || r.fileName} {r.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          )}

          {selectedResumeId && (
            <button
              type="button"
              onClick={handleView}
              disabled={isViewing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3D5AFE]/10 hover:bg-[#3D5AFE]/20 text-[#3D5AFE] dark:text-[#00D9C0] dark:bg-[#00D9C0]/10 dark:hover:bg-[#00D9C0]/20 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isViewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
              <span>View</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => !isUploading && fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Upload New
          </button>

          {selectedResumeId && onDeleteResume && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isUploading || isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 border border-rose-500/20"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};




