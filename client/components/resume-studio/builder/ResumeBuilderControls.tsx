'use client';

import React from 'react';
import {
  ResumeBuilderConfig,
  ResumeTemplateId,
  ResumeFontFamily,
  ResumeFontSize,
  ResumeLineHeight,
  ResumeSectionSpacing,
  ResumePageMargin,
  ResumeDensity,
  ResumeAccentStyle,
  ReorderableSectionId,
  DEFAULT_BUILDER_CONFIG,
  CANONICAL_SECTION_ORDER,
} from '@/types/resume-builder.types';
import { TEMPLATE_REGISTRY } from '../renderer/templates';
import {
  FileText,
  Briefcase,
  Code2,
  FolderGit2,
  GraduationCap,
  Award,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  Type,
  Layout,
  Maximize2,
  Sparkles,
  Sliders,
  Palette,
} from 'lucide-react';

interface ResumeBuilderControlsProps {
  config: ResumeBuilderConfig;
  onChange: (newConfig: ResumeBuilderConfig) => void;
  isSaving?: boolean;
}

const SECTION_LABELS: Record<
  ReorderableSectionId,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  summary: { label: 'Professional Summary', icon: FileText },
  skills: { label: 'Technical Skills', icon: Code2 },
  experience: { label: 'Work Experience', icon: Briefcase },
  projects: { label: 'Projects', icon: FolderGit2 },
  education: { label: 'Education', icon: GraduationCap },
  achievements: { label: 'Achievements & Certifications', icon: Award },
};

export const ResumeBuilderControls: React.FC<ResumeBuilderControlsProps> = React.memo(({
  config,
  onChange,
  isSaving = false,
}) => {
  const currentOrder = config.sectionOrder?.length
    ? config.sectionOrder
    : CANONICAL_SECTION_ORDER;

  const handleTemplateChange = (templateId: ResumeTemplateId) => {
    onChange({ ...config, templateId });
  };

  const handleFontFamilyChange = (fontFamily: ResumeFontFamily) => {
    onChange({ ...config, fontFamily });
  };

  const handleFontSizeChange = (fontSize: ResumeFontSize) => {
    onChange({ ...config, fontSize });
  };

  const handleLineHeightChange = (lineHeight: ResumeLineHeight) => {
    onChange({ ...config, lineHeight });
  };

  const handleSectionSpacingChange = (sectionSpacing: ResumeSectionSpacing) => {
    onChange({ ...config, sectionSpacing });
  };

  const handlePageMarginChange = (pageMargin: ResumePageMargin) => {
    onChange({ ...config, pageMargin });
  };

  const handleDensityChange = (density: ResumeDensity) => {
    // When changing density preset, adjust section spacing and line height proportionally
    let spacing: ResumeSectionSpacing = 'balanced';
    let lineH: ResumeLineHeight = 'comfortable';
    if (density === 'compact') {
      spacing = 'compact';
      lineH = 'compact';
    } else if (density === 'comfortable') {
      spacing = 'comfortable';
      lineH = 'relaxed';
    }
    onChange({
      ...config,
      density,
      sectionSpacing: spacing,
      lineHeight: lineH,
    });
  };

  const handleAccentChange = (accentStyle: ResumeAccentStyle) => {
    onChange({ ...config, accentStyle });
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    onChange({ ...config, sectionOrder: newOrder });
  };

  const handleResetOrder = () => {
    onChange({ ...config, sectionOrder: [...CANONICAL_SECTION_ORDER] });
  };

  const handleResetAll = () => {
    onChange({ ...DEFAULT_BUILDER_CONFIG });
  };

  return (
    <div className="space-y-6 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      
      {/* Header with Save Indicator & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Builder & Style Controls</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control template, layout, and styling. Content remains canonical.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSaving ? (
            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 animate-pulse flex items-center gap-1">
              Saving...
            </span>
          ) : (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Auto-saved
            </span>
          )}
          <button
            onClick={handleResetAll}
            title="Reset all builder settings to default"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. Template Selector */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono">
          <Layout className="w-3.5 h-3.5 text-indigo-500" />
          <span>Resume Template</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {(Object.values(TEMPLATE_REGISTRY) as typeof TEMPLATE_REGISTRY[ResumeTemplateId][]).map((tmpl) => {
            const isSelected = config.templateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => handleTemplateChange(tmpl.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {tmpl.name}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 w-fit">
                  {tmpl.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Section Reordering */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono">
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span>Section Order</span>
          </label>
          <button
            onClick={handleResetOrder}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
          >
            Reset Order
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          Header & contact remain first. Reorder body sections below:
        </p>

        <div className="space-y-1.5">
          {currentOrder.map((sectionId, idx) => {
            const item = SECTION_LABELS[sectionId] || { label: sectionId, icon: FileText };
            const Icon = item.icon;
            const isFirst = idx === 0;
            const isLast = idx === currentOrder.length - 1;

            return (
              <div
                key={sectionId}
                className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={isFirst}
                    onClick={() => handleMoveSection(idx, 'up')}
                    title="Move section up"
                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                      isFirst
                        ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={isLast}
                    onClick={() => handleMoveSection(idx, 'down')}
                    title="Move section down"
                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                      isLast
                        ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Typography & Sizing */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono">
          <Type className="w-3.5 h-3.5 text-indigo-500" />
          <span>Typography & Text Size</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Font Family */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Font Family</span>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['sans', 'serif', 'mono'] as const).map((font) => (
                <button
                  key={font}
                  onClick={() => handleFontFamilyChange(font)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    config.fontFamily === font
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Base Font Size</span>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['small', 'default', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    config.fontSize === size
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Line Height */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Line Height</span>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['compact', 'comfortable', 'relaxed'] as const).map((lh) => (
                <button
                  key={lh}
                  onClick={() => handleLineHeightChange(lh)}
                  className={`px-1.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer truncate ${
                    config.lineHeight === lh
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  {lh === 'comfortable' ? 'Regular' : lh}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Spacing, Margins & Density */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono">
          <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
          <span>Spacing & Page Margins</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Section Spacing */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Section Spacing</span>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['compact', 'balanced', 'comfortable'] as const).map((sp) => (
                <button
                  key={sp}
                  onClick={() => handleSectionSpacingChange(sp)}
                  className={`px-1.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer truncate ${
                    config.sectionSpacing === sp
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* Page Margins */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Page Margins</span>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['compact', 'normal', 'wide'] as const).map((mg) => (
                <button
                  key={mg}
                  onClick={() => handlePageMarginChange(mg)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    config.pageMargin === mg
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  {mg}
                </button>
              ))}
            </div>
          </div>

          {/* Density Preset */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Density Preset</span>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['compact', 'balanced', 'comfortable'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDensityChange(d)}
                  className={`px-1.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer truncate ${
                    config.density === d
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Accent Style */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono">
          <Palette className="w-3.5 h-3.5 text-indigo-500" />
          <span>Accent Style</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'neutral', label: 'Neutral Slate', desc: 'Minimal monochrome' },
            { id: 'professional', label: 'Navy / Indigo', desc: 'Executive contrast' },
            { id: 'minimal', label: 'Teal Accent', desc: 'Subtle fresh highlight' },
          ].map((acc) => {
            const isSelected = config.accentStyle === acc.id;
            return (
              <button
                key={acc.id}
                onClick={() => handleAccentChange(acc.id as ResumeAccentStyle)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                  {acc.label}
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {acc.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
});

ResumeBuilderControls.displayName = 'ResumeBuilderControls';
