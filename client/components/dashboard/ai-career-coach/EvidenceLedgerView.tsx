'use client';

import React, { useState } from 'react';
import { OrchestrationEvidenceItem } from '@/services/coach.service';
import { ShieldCheck, Copy, Check, Layers, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface EvidenceLedgerViewProps {
  evidence: OrchestrationEvidenceItem[];
  selectedEvidenceId?: string | null;
}

export const EvidenceLedgerView: React.FC<EvidenceLedgerViewProps> = ({
  evidence,
  selectedEvidenceId,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success(`Copied evidence ID: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (evidence.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <Layers className="w-10 h-10 opacity-30 mb-2 stroke-1" />
        <p className="text-xs font-medium">No verified evidence recorded yet</p>
        <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
          Evidence is extracted and verified from your active resume, profile, and skill assessments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          <strong>Deterministic Evidence Ledger:</strong> Guaranteed factual truth computed by verified engines.
        </span>
      </div>

      <div className="space-y-2.5">
        {evidence.map((item) => {
          const isSelected = selectedEvidenceId === item.id;

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                  {item.type}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(item.id)}
                  title="Copy Evidence ID"
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-mono"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{item.id}</span>
                </button>
              </div>

              {/* Summary */}
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                {item.summary}
              </p>

              {/* Source Provenance */}
              <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Source: <strong>{item.source}</strong></span>
                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Verified
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
