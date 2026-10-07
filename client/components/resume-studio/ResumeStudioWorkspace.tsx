'use client';

import React from 'react';
import { Sliders, Wand2, Eye, ShieldCheck, ListOrdered } from 'lucide-react';
import { StudioViewMode } from './ResumeStudioSidebar';

export interface ResumeStudioWorkspaceProps {
  viewMode: StudioViewMode;
  mobileView: 'navigation' | 'editor' | 'preview' | 'insights' | string;
  onMobileViewChange: (view: any) => void;
  navigationPanel?: React.ReactNode;
  canvasPanel?: React.ReactNode;
  previewPanel?: React.ReactNode;
  contextPanel?: React.ReactNode;
  editorPanel?: React.ReactNode;
  insightsPanel?: React.ReactNode;
}

export const ResumeStudioWorkspace: React.FC<ResumeStudioWorkspaceProps> = ({
  viewMode,
  mobileView,
  onMobileViewChange,
  navigationPanel,
  canvasPanel,
  previewPanel,
  contextPanel,
  editorPanel,
  insightsPanel,
}) => {
  const isAudit = viewMode === 'audit' || viewMode === 'analysis';
  const effectiveCanvas = canvasPanel || previewPanel;
  const effectiveContext = contextPanel || editorPanel;
  const effectiveNavigation = navigationPanel;

  return (
    <div className="relative w-full">
      {/* CASE 1: FULL ATS AUDIT & SCORE DASHBOARD */}
      {isAudit ? (
        <div className="w-full animate-fadeIn">
          {insightsPanel}
        </div>
      ) : (
        /* CASE 2: 3-ZONE RESUME WORKSPACE */
        <div className="w-full">
          {/* DESKTOP & TABLET UNIFIED RESPONSIVE GRID (lg+) */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start">
            {effectiveNavigation && (
              <div className="hidden xl:block xl:col-span-3 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
                {effectiveNavigation}
              </div>
            )}

            <div className={`${effectiveNavigation ? 'lg:col-span-7 xl:col-span-5 2xl:col-span-5' : 'lg:col-span-7 xl:col-span-7'} min-w-0 flex justify-center`}>
              {effectiveCanvas}
            </div>

            <div className={`${effectiveNavigation ? 'lg:col-span-5 xl:col-span-4 2xl:col-span-4' : 'lg:col-span-5 xl:col-span-5'} sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar`}>
              {effectiveContext}
            </div>
          </div>

          {/* MOBILE PROGRESSIVE VIEW (< lg) - Only renders active tab to minimize DOM & memory */}
          <div className="lg:hidden pb-24">
            {mobileView === 'navigation' && effectiveNavigation ? (
              <div className="animate-fadeIn">{effectiveNavigation}</div>
            ) : mobileView === 'preview' ? (
              <div className="animate-fadeIn">{effectiveCanvas}</div>
            ) : mobileView === 'insights' && insightsPanel ? (
              <div className="animate-fadeIn">{insightsPanel}</div>
            ) : (
              <div className="animate-fadeIn">{effectiveContext}</div>
            )}
          </div>

          {/* MOBILE FLOATING PILL SWITCHER */}
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden flex items-center p-1 rounded-full bg-slate-900/95 dark:bg-slate-800/95 text-white shadow-2xl backdrop-blur-md border border-slate-700/80">
            {effectiveNavigation && (
              <button
                onClick={() => onMobileViewChange('navigation')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  mobileView === 'navigation'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Outline</span>
              </button>
            )}

            <button
              onClick={() => onMobileViewChange('preview')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mobileView === 'preview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Paper</span>
            </button>

            <button
              onClick={() => onMobileViewChange('editor')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mobileView === 'editor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {viewMode === 'builder' ? (
                <>
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Layout</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Editor</span>
                </>
              )}
            </button>

            <button
              onClick={() => onMobileViewChange('insights')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mobileView === 'insights'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ATS</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
