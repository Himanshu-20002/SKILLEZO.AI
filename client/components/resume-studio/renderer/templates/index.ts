/**
 * SKILLEZO RESUME STUDIO — PHASE 7 TEMPLATE REGISTRY & PRESENTATION STYLES
 * Pure presentation layer consuming canonical ResumeDocument.
 */

import { ResumeBuilderConfig, ResumeTemplateId } from '@/types/resume-builder.types';

export interface TemplateDefinition {
  id: ResumeTemplateId;
  name: string;
  description: string;
  badge: string;
  headerStyle: string;
  sectionHeaderStyle: string;
  sectionContainerStyle: string;
  bulletStyle: string;
  dividerStyle: string;
}

export const TEMPLATE_REGISTRY: Record<ResumeTemplateId, TemplateDefinition> = {
  classic: {
    id: 'classic',
    name: 'Classic Executive',
    description: 'Traditional academic & executive hierarchy with clean dividing rules and formal structure.',
    badge: 'Formal & ATS Standard',
    headerStyle: 'border-b-2 border-slate-900 dark:border-slate-100 pb-4 mb-5',
    sectionHeaderStyle: 'text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-700 pb-1 mb-2.5 font-serif',
    sectionContainerStyle: 'space-y-3.5',
    bulletStyle: 'list-disc list-outside pl-4 space-y-1',
    dividerStyle: 'border-slate-300 dark:border-slate-700',
  },
  modern: {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean sans-serif design with subtle accent borders and crisp contemporary typography.',
    badge: 'Tech & Modern ATS',
    headerStyle: 'border-b border-indigo-500/30 dark:border-indigo-500/20 pb-4 mb-5',
    sectionHeaderStyle: 'text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 border-l-3 border-indigo-600 pl-2 pb-0.5 mb-2.5 font-sans',
    sectionContainerStyle: 'space-y-3',
    bulletStyle: 'list-disc list-outside pl-4 space-y-1',
    dividerStyle: 'border-indigo-100 dark:border-indigo-900/40',
  },
  compact: {
    id: 'compact',
    name: 'Compact High-Density',
    description: 'Space-optimized layout with inline details designed to fit extensive experience cleanly.',
    badge: 'Space-Saver / 1-Page',
    headerStyle: 'border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-3',
    sectionHeaderStyle: 'text-[11px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-0.5 mb-1.5 font-mono',
    sectionContainerStyle: 'space-y-2',
    bulletStyle: 'list-disc list-outside pl-3.5 space-y-0.5',
    dividerStyle: 'border-slate-200 dark:border-slate-800',
  },
};

/**
 * Resolves Tailwind styling classes from a ResumeBuilderConfig
 */
export function resolveConfigClasses(config?: ResumeBuilderConfig | null) {
  const templateId = config?.templateId || 'classic';
  const template = TEMPLATE_REGISTRY[templateId] || TEMPLATE_REGISTRY.classic;

  // 1. Font Family
  const fontFamilyClass =
    config?.fontFamily === 'serif'
      ? 'font-serif'
      : config?.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // 2. Base Font Size
  const fontSizeClass =
    config?.fontSize === 'small'
      ? 'text-[12.5px]'
      : config?.fontSize === 'large'
      ? 'text-[14.5px]'
      : 'text-[13.5px]';

  // 3. Line Height
  const lineHeightClass =
    config?.lineHeight === 'compact'
      ? 'leading-snug'
      : config?.lineHeight === 'relaxed'
      ? 'leading-relaxed'
      : 'leading-normal';

  // 4. Section Spacing
  const sectionSpacingClass =
    config?.sectionSpacing === 'compact'
      ? 'mb-3'
      : config?.sectionSpacing === 'comfortable'
      ? 'mb-6'
      : 'mb-4.5';

  // 5. Page Margins
  const pageMarginClass =
    config?.pageMargin === 'compact'
      ? 'p-5 sm:p-7'
      : config?.pageMargin === 'wide'
      ? 'p-8 sm:p-12'
      : 'p-6 sm:p-9';

  // 6. Accent Color
  const accentBorderClass =
    config?.accentStyle === 'neutral'
      ? 'border-slate-500'
      : config?.accentStyle === 'minimal'
      ? 'border-teal-600 dark:border-teal-500'
      : 'border-indigo-600 dark:border-indigo-400';

  const accentTextClass =
    config?.accentStyle === 'neutral'
      ? 'text-slate-800 dark:text-slate-200'
      : config?.accentStyle === 'minimal'
      ? 'text-teal-700 dark:text-teal-400'
      : 'text-indigo-600 dark:text-indigo-400';

  return {
    template,
    fontFamilyClass,
    fontSizeClass,
    lineHeightClass,
    sectionSpacingClass,
    pageMarginClass,
    accentBorderClass,
    accentTextClass,
  };
}
