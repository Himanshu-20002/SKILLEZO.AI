'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Copy, Check } from 'lucide-react';
import { SAMPLE_RESUME_DOCUMENT_FIXTURE } from '@/types/resume-document.fixture';

export default function ResumeStudioDevPage() {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(SAMPLE_RESUME_DOCUMENT_FIXTURE, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1130] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/resume-studio"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Resume Studio</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Schema v1.0.0 Validated</span>
          </span>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#3D5AFE] text-white hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Phase 0 Developer Fixture: Canonical ResumeDocument
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Immutable single source of truth containing 7 canonical sections, evidence provenance ledger, versioning metadata, and deterministic section scores.
        </p>
      </div>

      {/* JSON Viewer */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs overflow-x-auto max-h-[75vh] shadow-inner">
        <pre>{jsonString}</pre>
      </div>
    </div>
  );
}
