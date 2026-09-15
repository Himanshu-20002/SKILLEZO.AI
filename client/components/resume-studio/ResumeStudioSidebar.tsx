'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  UserCheck,
  Code2,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  LayoutGrid,
  ShieldCheck,
  Wand2,
  X,
  Sliders,
} from 'lucide-react';

export type StudioViewMode = 'audit' | 'editor' | 'split' | 'builder' | 'visual' | 'analysis';

interface ResumeStudioSidebarProps {
  viewMode: StudioViewMode;
  onViewModeChange: (mode: StudioViewMode) => void;
  activeSectionKey?: string;
  onSectionClick?: (sectionId: string) => void;
  overallScore?: number;
  scoreTier?: string;
  templateId?: string;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavOption {
  id: 'audit' | 'editor' | 'builder';
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_OPTIONS: NavOption[] = [
  {
    id: 'audit',
    label: 'ATS Audit & Score',
    sublabel: 'Role match, pillars & keywords',
    icon: ShieldCheck,
    badge: 'AI',
  },
  {
    id: 'editor',
    label: 'Edit Content & AI',
    sublabel: 'Live section AI editor & canvas',
    icon: Wand2,
  },
  {
    id: 'builder',
    label: 'Design & Layout',
    sublabel: 'Templates, typography & order',
    icon: Sliders,
    badge: 'Builder',
  },
];

const SECTION_SHORTCUTS = [
  { id: 'contact', title: 'Contact Information', icon: UserCheck },
  { id: 'summary', title: 'Professional Summary', icon: FileText },
  { id: 'skills', title: 'Technical Skills', icon: Code2 },
  { id: 'experience', title: 'Work Experience', icon: Briefcase },
  { id: 'projects', title: 'Projects', icon: FolderGit2 },
  { id: 'education', title: 'Education', icon: GraduationCap },
  { id: 'achievements', title: 'Certifications', icon: Award },
];

export const ResumeStudioSidebar: React.FC<ResumeStudioSidebarProps> = React.memo(({
  viewMode,
  onViewModeChange,
  activeSectionKey,
  onSectionClick,
  overallScore,
  scoreTier,
  templateId = 'classic',
  className = '',
  isOpen = false,
  onClose,
}) => {
  const isAudit = viewMode === 'audit' || viewMode === 'analysis';
  const isEditor = viewMode === 'editor' || viewMode === 'split';
  const isBuilder = viewMode === 'builder';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 select-none">
      {/* Studio Brand & Return Navigation Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-150" />
            <span>Dashboard</span>
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Resume Studio
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Unified AI Workspace
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
            AI
          </span>
        </div>
      </div>

      {/* Scrollable Sidebar Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 overscroll-contain">
        {/* The 2 Clear Destinations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Workspace
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
              {templateId}
            </span>
          </div>

          <div className="space-y-1.5">
            {NAV_OPTIONS.map((opt) => {
              const isSelected =
                opt.id === 'audit' ? isAudit : opt.id === 'builder' ? isBuilder : isEditor;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    onViewModeChange(opt.id);
                    onClose?.();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-[background-color,border-color,color] duration-150 cursor-pointer group ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs'
                      : 'border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold truncate ${
                            isSelected
                              ? 'text-indigo-900 dark:text-indigo-200'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {opt.label}
                        </span>
                        {opt.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {opt.sublabel}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                      isSelected
                        ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5'
                        : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Resume Health Score Summary Card */}
        {typeof overallScore === 'number' && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-800/40 dark:to-indigo-950/20 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Resume Health</span>
              </span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                {overallScore} <span className="text-slate-400 text-[10px] font-normal">/ 100</span>
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, overallScore))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span>Rating: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{scoreTier || 'Good'}</strong></span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">Deterministic</span>
            </div>
          </div>
        )}

        {/* Section Quick Jump Links */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Resume Sections
            </span>
            <span className="text-[10px] text-slate-400">Jump to edit</span>
          </div>

          <div className="space-y-0.5">
            {SECTION_SHORTCUTS.map((sec) => {
              const isSelected = activeSectionKey === sec.id;
              const Icon = sec.icon;

              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    onSectionClick?.(sec.id);
                    onClose?.();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer text-left ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{sec.title}</span>
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <span>Active Template: <strong className="text-slate-600 dark:text-slate-300 uppercase">{templateId}</strong></span>
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Synchronized" />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Sidebar (lg+) */}
      <aside
        className={`hidden lg:block w-72 xl:w-80 shrink-0 border-r border-slate-200/80 dark:border-slate-800 lg:h-screen lg:sticky lg:top-0 z-30 select-none transform-gpu ${className}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay & Slide-Over (< lg) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
});

ResumeStudioSidebar.displayName = 'ResumeStudioSidebar';


