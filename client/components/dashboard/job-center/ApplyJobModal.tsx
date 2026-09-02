'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  X,
  Send,
  Building,
  Globe,
  MapPin,
  Briefcase,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  FileText,
  Eye,
  Loader2,
  AlertCircle,
  UploadCloud,
  PenTool,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { Job } from '@/types/job-center';
import { resumeService } from '@/services/resume.service';
import { ResumeRecord } from '@/types/resume';
import { toast } from 'sonner';

interface ApplyJobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmApply: (job: Job, resumeId?: string, coverLetter?: string) => void;
  children?: React.ReactNode;
  isSubmitting?: boolean;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onConfirmApply,
  children,
  isSubmitting = false,
}) => {
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [isLoadingResumes, setIsLoadingResumes] = useState<boolean>(false);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);

  // FE-210 State: Cover Letter & Inline Upload
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [showCoverLetter, setShowCoverLetter] = useState<boolean>(false);
  const [isUploadingNew, setIsUploadingNew] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isExternal = (job?.sourceType || '').toUpperCase() === 'EXTERNAL';

  // Fetch candidate's uploaded resumes when modal opens
  const fetchResumes = useCallback(async () => {
    if (isExternal) return;
    try {
      setIsLoadingResumes(true);
      const list = await resumeService.getUserResumes();
      setResumes(list);

      if (list.length > 0) {
        const defaultResume = list.find((r) => r.isDefault) || list[0];
        setSelectedResumeId(defaultResume._id);
      } else {
        setSelectedResumeId('');
      }
    } catch (err: any) {
      console.error('Failed to fetch resumes:', err);
      toast.error('Unable to load your uploaded resumes');
    } finally {
      setIsLoadingResumes(false);
    }
  }, [isExternal]);

  useEffect(() => {
    if (isOpen) {
      fetchResumes();
      setCoverLetter('');
      setShowCoverLetter(false);
    }
  }, [isOpen, fetchResumes]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Quick Preview of Selected Resume
  const handleQuickPreview = async () => {
    if (!selectedResumeId) return;
    try {
      setIsPreviewing(true);
      const blob = await resumeService.getResumeBlob(selectedResumeId, true);
      const fileUrl = window.URL.createObjectURL(blob);
      window.open(fileUrl, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(fileUrl), 60000);
    } catch (err: any) {
      toast.error('Failed to open resume preview');
    } finally {
      setIsPreviewing(false);
    }
  };

  // Inline Upload Handler (FE-210)
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please select a valid PDF document (.pdf)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds maximum limit of 5MB');
      return;
    }

    try {
      setIsUploadingNew(true);
      const uploaded = await resumeService.uploadResume(file);
      setResumes((prev) => [uploaded, ...prev]);
      setSelectedResumeId(uploaded._id);
      toast.success(`"${uploaded.originalFileName || uploaded.fileName}" uploaded & selected!`);
    } catch (err: any) {
      console.error('Inline resume upload failed:', err);
      toast.error(err.message || 'Failed to upload resume');
    } finally {
      setIsUploadingNew(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen || !job) return null;

  const selectedResume = resumes.find((r) => r._id === selectedResumeId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Hidden File Input for Inline Upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE]">
              {isExternal ? <ExternalLink className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isExternal ? 'External Job Application' : 'Apply for Position'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {isExternal ? 'Apply on partner website' : 'Direct platform submission with AI Resume'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close apply dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          {/* Job Summary Card Header */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800/70 space-y-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shrink-0 border ${
                  isExternal
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-gradient-to-tr from-[#3D5AFE]/20 to-[#00D9C0]/20 text-[#3D5AFE] dark:text-[#00D9C0] border-[#3D5AFE]/20'
                }`}
              >
                {job.company ? job.company.substring(0, 2).toUpperCase() : 'SK'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                    {job.title}
                  </h4>

                  {isExternal ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      <Globe className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      {job.sourceName || 'Jooble'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#00D9C0] border border-[#3D5AFE]/30">
                      <Building className="w-3 h-3" />
                      Direct Platform
                    </span>
                  )}

                  {job.verified && !isExternal && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                  {job.company} • {job.department || 'Engineering'}
                </p>
              </div>
            </div>

            {/* Pill Attributes Grid */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium">
                <MapPin className="w-3 h-3 text-slate-400" />
                {job.location}
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium">
                <Briefcase className="w-3 h-3 text-slate-400" />
                {job.workMode} • {job.employmentType}
              </span>

              {job.salaryText && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-emerald-600 dark:text-emerald-400 font-semibold">
                  <DollarSign className="w-3 h-3" />
                  {job.salaryText}
                </span>
              )}
            </div>
          </div>

          {/* External Job Notice */}
          {isExternal ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Partner Job Listing Notice
              </p>
              <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90">
                This job is aggregated from <strong>{job.sourceName || 'Jooble'}</strong>. Clicking continue will open the official job posting in a new tab where you can submit your application directly.
              </p>
            </div>
          ) : (
            /* Platform Resume Selector Section (FE-209 & FE-210) */
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                  <FileText className="w-4 h-4 text-[#3D5AFE]" />
                  Select Resume
                </span>

                <div className="flex items-center gap-2">
                  {/* Inline Upload Trigger Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingNew}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingNew ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#3D5AFE]" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                    <span>{isUploadingNew ? 'Uploading...' : 'Upload New'}</span>
                  </button>

                  {resumes.length > 0 && selectedResume && (
                    <button
                      type="button"
                      onClick={handleQuickPreview}
                      disabled={isPreviewing}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-[#3D5AFE] hover:bg-[#3D5AFE]/10 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isPreviewing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                      <span>Preview</span>
                    </button>
                  )}
                </div>
              </div>

              {isLoadingResumes ? (
                <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-[#3D5AFE]" />
                  <span className="text-xs">Loading candidate resumes...</span>
                </div>
              ) : resumes.length === 0 ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-4 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    isDragging
                      ? 'border-[#3D5AFE] bg-[#3D5AFE]/10'
                      : 'border-slate-300 dark:border-slate-700 hover:border-[#3D5AFE]/60 bg-white dark:bg-slate-900'
                  }`}
                >
                  <UploadCloud className="w-6 h-6 text-[#3D5AFE]" />
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    No resume found. Click to upload PDF
                  </p>
                  <p className="text-[10px] text-slate-500">PDF up to 5MB supported</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/40 cursor-pointer"
                  >
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.title || r.fileName} {r.isDefault ? '(Default Resume)' : ''}
                      </option>
                    ))}
                  </select>

                  {selectedResume && (
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500">
                      <span className="truncate max-w-[240px]">
                        File: <strong>{selectedResume.originalFileName || selectedResume.fileName}</strong>
                      </span>
                      {selectedResume.isDefault ? (
                        <span className="px-1.5 py-0.5 rounded font-extrabold text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          PRIMARY
                        </span>
                      ) : (
                        <span className="text-[10px]">
                          {new Date(selectedResume.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Optional Cover Letter Section (FE-210) */}
          {!isExternal && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
              <button
                type="button"
                onClick={() => setShowCoverLetter(!showCoverLetter)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#3D5AFE] dark:hover:text-[#00D9C0] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#3D5AFE]" />
                  Add a Note / Cover Letter (Optional)
                </span>
                {showCoverLetter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCoverLetter && (
                <div className="space-y-1.5 pt-1 animate-fade-in">
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly highlight relevant experience, why you're interested in this role, or a note for the recruiter..."
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/40 resize-none"
                  />
                  <div className="flex justify-end text-[10px] text-slate-400">
                    {coverLetter.length} / 1000 characters
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Child Slot for additional fields */}
          {children}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {isExternal ? (
            <a
              href={job.sourceUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                onConfirmApply(job, selectedResumeId, coverLetter);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Continue to {job.sourceName || 'Job Listing'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onConfirmApply(job, selectedResumeId, coverLetter)}
              disabled={isSubmitting || (!selectedResumeId && resumes.length === 0)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Confirm & Apply'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
