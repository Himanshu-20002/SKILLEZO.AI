/**
 * SKILLEZO RESUME STUDIO — PHASE 7 BUILDER TYPES (SERVER)
 * Strictly separates presentation configuration from canonical ResumeDocument.
 */

export type ResumeTemplateId = 'classic' | 'modern' | 'compact';

export type ResumeFontFamily = 'sans' | 'serif' | 'mono';

export type ResumeFontSize = 'small' | 'default' | 'large';

export type ResumeLineHeight = 'compact' | 'comfortable' | 'relaxed';

export type ResumeSectionSpacing = 'compact' | 'balanced' | 'comfortable';

export type ResumePageMargin = 'compact' | 'normal' | 'wide';

export type ResumeDensity = 'compact' | 'balanced' | 'comfortable';

export type ResumeAccentStyle = 'neutral' | 'professional' | 'minimal';

export type ReorderableSectionId = 
  | 'summary'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'education'
  | 'achievements';

export interface ResumeBuilderConfig {
  templateId: ResumeTemplateId;
  fontFamily: ResumeFontFamily;
  fontSize: ResumeFontSize;
  lineHeight: ResumeLineHeight;
  sectionSpacing: ResumeSectionSpacing;
  pageMargin: ResumePageMargin;
  sectionOrder: ReorderableSectionId[];
  density: ResumeDensity;
  accentStyle: ResumeAccentStyle;
}

export const CANONICAL_SECTION_ORDER: ReorderableSectionId[] = [
  'summary',
  'skills',
  'experience',
  'projects',
  'education',
  'achievements',
];

export const DEFAULT_BUILDER_CONFIG: ResumeBuilderConfig = {
  templateId: 'classic',
  fontFamily: 'sans',
  fontSize: 'default',
  lineHeight: 'comfortable',
  sectionSpacing: 'balanced',
  pageMargin: 'normal',
  sectionOrder: [...CANONICAL_SECTION_ORDER],
  density: 'balanced',
  accentStyle: 'professional',
};
