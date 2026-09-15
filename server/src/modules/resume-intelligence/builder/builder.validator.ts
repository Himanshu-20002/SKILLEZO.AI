import { z } from 'zod';
import {
  ResumeBuilderConfig,
  CANONICAL_SECTION_ORDER,
  DEFAULT_BUILDER_CONFIG,
} from './builder.types';

const ALLOWED_TEMPLATES = ['classic', 'modern', 'compact'] as const;
const ALLOWED_FONTS = ['sans', 'serif', 'mono'] as const;
const ALLOWED_FONT_SIZES = ['small', 'default', 'large'] as const;
const ALLOWED_LINE_HEIGHTS = ['compact', 'comfortable', 'relaxed'] as const;
const ALLOWED_SPACINGS = ['compact', 'balanced', 'comfortable'] as const;
const ALLOWED_MARGINS = ['compact', 'normal', 'wide'] as const;
const ALLOWED_DENSITIES = ['compact', 'balanced', 'comfortable'] as const;
const ALLOWED_ACCENTS = ['neutral', 'professional', 'minimal'] as const;
const ALLOWED_SECTIONS = [
  'summary',
  'skills',
  'experience',
  'projects',
  'education',
  'achievements',
] as const;

export const resumeBuilderConfigSchema = z.object({
  templateId: z.enum(ALLOWED_TEMPLATES),
  fontFamily: z.enum(ALLOWED_FONTS),
  fontSize: z.enum(ALLOWED_FONT_SIZES),
  lineHeight: z.enum(ALLOWED_LINE_HEIGHTS),
  sectionSpacing: z.enum(ALLOWED_SPACINGS),
  pageMargin: z.enum(ALLOWED_MARGINS),
  sectionOrder: z
    .array(z.enum(ALLOWED_SECTIONS))
    .refine(
      (arr) => {
        // Must contain unique sections
        const set = new Set(arr);
        return set.size === arr.length;
      },
      { message: 'sectionOrder must contain unique sections' }
    )
    .refine(
      (arr) => {
        // Must contain all canonical sections
        return CANONICAL_SECTION_ORDER.every((sec) => arr.includes(sec));
      },
      { message: 'sectionOrder must contain all required body sections' }
    ),
  density: z.enum(ALLOWED_DENSITIES),
  accentStyle: z.enum(ALLOWED_ACCENTS),
});

export function validateBuilderConfig(input: unknown): {
  success: boolean;
  data?: ResumeBuilderConfig;
  errors?: string[];
} {
  const result = resumeBuilderConfigSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      ),
    };
  }
  return {
    success: true,
    data: result.data as ResumeBuilderConfig,
  };
}

export { ResumeBuilderConfig, DEFAULT_BUILDER_CONFIG };
