'use client';

import React, { useState } from 'react';
import { AIOrchestrationResult } from '@/services/coach.service';
import { TargetRoleSelector } from './TargetRoleSelector';
import { MetricsSummaryView } from './MetricsSummaryView';
import { EvidenceLedgerView } from './EvidenceLedgerView';
import { InsightsRoadmapView } from './InsightsRoadmapView';
import {
  TrendingUp,
  Layers,
  Compass,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface IntelligencePanelProps {
  intelligence: AIOrchestrationResult | null;
  targetRole?: string;
  onUpdateTargetRole: (role: string | undefined) => void;
  selectedEvidenceId?: string | null;
  onSelectEvidence?: (evidenceId: string) => void;
  activeTab?: 'metrics' | 'evidence' | 'actions';
  onTabChange?: (tab: 'metrics' | 'evidence' | 'actions') => void;
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({
  intelligence,
  targetRole,
  onUpdateTargetRole,
  selectedEvidenceId,
  onSelectEvidence,
  activeTab: externalTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'metrics' | 'evidence' | 'actions'>('metrics');
  const activeTab = externalTab || internalTab;

  const setTab = (tab: 'metrics' | 'evidence' | 'actions') => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  const metrics = intelligence?.metrics || [];
  const evidence = intelligence?.evidence || [];
  const recommendations = intelligence?.recommendations || [];
  const insights = intelligence?.insights || [];

  return (
    <div className="flex flex-col h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
      {/* 1. Header & Target Benchmark Role */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Career Intelligence Workbench
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            Live Ground-Truth
          </span>
        </div>

        <TargetRoleSelector
          targetRole={targetRole}
          onUpdateRole={onUpdateTargetRole}
        />
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200/80 dark:border-slate-800/80 px-2 pt-1 gap-1 bg-slate-50/50 dark:bg-slate-950/40">
        <button
          type="button"
          onClick={() => setTab('metrics')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'metrics'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Scores</span>
          {metrics.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              {metrics.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab('evidence')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'evidence'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Evidence</span>
          {evidence.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              {evidence.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab('actions')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'actions'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Roadmap</span>
          {recommendations.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
              {recommendations.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. Tab Body Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'metrics' && (
          <MetricsSummaryView
            metrics={metrics}
            onSelectEvidence={(evId) => {
              onSelectEvidence?.(evId);
              setTab('evidence');
            }}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceLedgerView
            evidence={evidence}
            selectedEvidenceId={selectedEvidenceId}
          />
        )}

        {activeTab === 'actions' && (
          <InsightsRoadmapView
            insights={insights}
            recommendations={recommendations}
            onSelectEvidence={(evId) => {
              onSelectEvidence?.(evId);
              setTab('evidence');
            }}
          />
        )}
      </div>
    </div>
  );
};
