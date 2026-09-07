'use client';

import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  X,
  ExternalLink,
  Calendar,
  Sparkles,
  QrCode,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: {
    skillName: string;
    category?: string;
    candidateName?: string;
    score: number;
    proficiency?: string;
    credentialHash: string;
    issueDate?: string;
    assessor?: string;
  } | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !certificate) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(certificate.credentialHash);
    setCopied(true);
    toast.success('Cryptographic Credential Hash copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = certificate.issueDate
    ? new Date(certificate.issueDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Decorative Top Gradient Border */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-[#3D5AFE] to-[#00D9C0]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Certificate Header Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-[#00D9C0]/20 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" />
                  Verified Cryptographic Credential
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  SKILLEZO AI Verified Certificate
                </h3>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-slate-500 dark:text-slate-400">Proficiency Score</span>
              <span className="text-2xl font-black bg-gradient-to-r from-emerald-500 to-[#00D9C0] bg-clip-text text-transparent">
                {certificate.score}/100
              </span>
            </div>
          </div>

          {/* Certificate Preview Card */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/60 dark:from-slate-800/60 dark:to-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
                This is to certify that
              </p>
              <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {certificate.candidateName || 'Verified Candidate'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                has successfully passed the comprehensive assessment and demonstrated{' '}
                <strong className="text-emerald-500 font-semibold">{certificate.proficiency || 'Expert'}</strong>{' '}
                proficiency in
              </p>
              <div className="inline-block px-4 py-1.5 rounded-xl bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20 text-[#3D5AFE] dark:text-[#8098FF] font-bold text-lg border border-[#3D5AFE]/20 shadow-sm">
                {certificate.skillName}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Category</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {certificate.category || 'Technical Track'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Issue Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formattedDate}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-500 dark:text-slate-400 block">Assessor</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {certificate.assessor || 'SKILLEZO AI Engine v4.2'}
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic Hash Section */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5 text-left w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Verifiable Credential Hash (SHA-256)
              </span>
              <p className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 break-all">
                {certificate.credentialHash}
              </p>
            </div>

            <button
              onClick={handleCopyHash}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm cursor-pointer transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Hash'}</span>
            </button>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
            >
              Close
            </button>
            <button
              onClick={handleCopyHash}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00D9C0] text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20 hover:opacity-95 cursor-pointer transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Credential</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
