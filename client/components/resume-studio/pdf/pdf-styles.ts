import { StyleSheet } from '@react-pdf/renderer';
import {
  ResumeBuilderConfig,
  ResumeTemplateId,
  ResumeFontFamily,
  ResumeFontSize,
  ResumePageMargin,
  ResumeAccentStyle,
} from '@/types/resume-builder.types';

export interface ResolvedPdfTheme {
  fontFamily: string;
  fontFamilyBold: string;
  fontFamilyItalic: string;
  bodyFontSize: number;
  subheadFontSize: number;
  sectionTitleFontSize: number;
  nameFontSize: number;
  lineHeight: number;
  pagePadding: number;
  sectionSpacing: number;
  itemSpacing: number;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  bulletColor: string;
}

export function resolvePdfTheme(config?: ResumeBuilderConfig | null): ResolvedPdfTheme {
  const templateId: ResumeTemplateId = config?.templateId || 'classic';
  const fontFamilyKey: ResumeFontFamily = config?.fontFamily || (templateId === 'classic' ? 'serif' : 'sans');
  const fontSizeKey: ResumeFontSize = config?.fontSize || (templateId === 'compact' ? 'small' : 'default');
  const marginKey: ResumePageMargin = config?.pageMargin || (templateId === 'compact' ? 'compact' : 'normal');
  const accentKey: ResumeAccentStyle = config?.accentStyle || (templateId === 'modern' ? 'professional' : 'neutral');

  // Font Family Mapping using standard PDF built-in Type1 fonts (zero external network loading issues)
  let fontFamily = 'Helvetica';
  let fontFamilyBold = 'Helvetica-Bold';
  let fontFamilyItalic = 'Helvetica-Oblique';

  if (fontFamilyKey === 'serif') {
    fontFamily = 'Times-Roman';
    fontFamilyBold = 'Times-Bold';
    fontFamilyItalic = 'Times-Italic';
  } else if (fontFamilyKey === 'mono') {
    fontFamily = 'Courier';
    fontFamilyBold = 'Courier-Bold';
    fontFamilyItalic = 'Courier-Oblique';
  }

  // Font Size Scaling
  let bodyFontSize = 9.5;
  let subheadFontSize = 10.5;
  let sectionTitleFontSize = 12;
  let nameFontSize = 20;

  if (fontSizeKey === 'small') {
    bodyFontSize = 8.5;
    subheadFontSize = 9.5;
    sectionTitleFontSize = 11;
    nameFontSize = 17;
  } else if (fontSizeKey === 'large') {
    bodyFontSize = 10.5;
    subheadFontSize = 11.5;
    sectionTitleFontSize = 13.5;
    nameFontSize = 22;
  }

  // Page Margins
  let pagePadding = 36; // 0.5 in
  if (marginKey === 'compact') {
    pagePadding = 24; // 0.33 in
  } else if (marginKey === 'wide') {
    pagePadding = 48; // 0.67 in
  }

  // Section Spacing & Density
  let sectionSpacing = 12;
  let itemSpacing = 6;
  let lineHeight = 1.35;

  if (config?.sectionSpacing === 'compact' || templateId === 'compact') {
    sectionSpacing = 8;
    itemSpacing = 4;
    lineHeight = 1.25;
  } else if (config?.sectionSpacing === 'comfortable') {
    sectionSpacing = 16;
    itemSpacing = 8;
    lineHeight = 1.45;
  }

  // Accent Colors
  let primaryColor = '#1E293B'; // Slate 800
  let secondaryColor = '#475569';
  let borderColor = '#CBD5E1';
  let bulletColor = '#64748B';

  if (accentKey === 'professional' || templateId === 'modern') {
    primaryColor = '#3730A3'; // Indigo 800
    secondaryColor = '#4F46E5'; // Indigo 600
    borderColor = '#C7D2FE';
    bulletColor = '#4F46E5';
  } else if (accentKey === 'minimal') {
    primaryColor = '#115E59'; // Teal 800
    secondaryColor = '#0D9488'; // Teal 600
    borderColor = '#99F6E4';
    bulletColor = '#0D9488';
  }

  return {
    fontFamily,
    fontFamilyBold,
    fontFamilyItalic,
    bodyFontSize,
    subheadFontSize,
    sectionTitleFontSize,
    nameFontSize,
    lineHeight,
    pagePadding,
    sectionSpacing,
    itemSpacing,
    primaryColor,
    secondaryColor,
    textColor: '#1E293B',
    mutedColor: '#64748B',
    borderColor,
    bulletColor,
  };
}

export function createPdfStyles(theme: ResolvedPdfTheme, templateId: ResumeTemplateId = 'classic') {
  return StyleSheet.create({
    page: {
      padding: theme.pagePadding,
      fontFamily: theme.fontFamily,
      fontSize: theme.bodyFontSize,
      color: theme.textColor,
      lineHeight: theme.lineHeight,
      backgroundColor: '#FFFFFF',
    },
    // Header
    headerContainer: {
      marginBottom: theme.sectionSpacing + 2,
      borderBottomWidth: templateId === 'classic' ? 1.5 : 1,
      borderBottomColor: templateId === 'classic' ? '#0F172A' : theme.borderColor,
      paddingBottom: theme.itemSpacing + 2,
    },
    candidateName: {
      fontFamily: theme.fontFamilyBold,
      fontSize: theme.nameFontSize,
      color: templateId === 'modern' ? theme.primaryColor : '#0F172A',
      letterSpacing: -0.2,
      marginBottom: 3,
    },
    targetRoleText: {
      fontFamily: theme.fontFamilyBold,
      fontSize: theme.subheadFontSize,
      color: templateId === 'modern' ? theme.secondaryColor : '#334155',
      marginBottom: 4,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 2,
    },
    contactItem: {
      fontSize: theme.bodyFontSize - 0.5,
      color: theme.mutedColor,
    },
    linkItem: {
      fontSize: theme.bodyFontSize - 0.5,
      color: theme.secondaryColor,
      textDecoration: 'none',
    },
    // Section Header
    sectionContainer: {
      marginBottom: theme.sectionSpacing,
    },
    sectionTitleClassic: {
      fontFamily: theme.fontFamilyBold,
      fontSize: theme.sectionTitleFontSize,
      color: '#0F172A',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      borderBottomWidth: 1,
      borderBottomColor: '#CBD5E1',
      paddingBottom: 2,
      marginBottom: theme.itemSpacing,
    },
    sectionTitleModern: {
      fontFamily: theme.fontFamilyBold,
      fontSize: theme.sectionTitleFontSize,
      color: theme.primaryColor,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      borderLeftWidth: 3,
      borderLeftColor: theme.secondaryColor,
      paddingLeft: 6,
      paddingBottom: 1,
      marginBottom: theme.itemSpacing,
    },
    sectionTitleCompact: {
      fontFamily: theme.fontFamilyBold,
      fontSize: theme.sectionTitleFontSize - 1,
      color: '#1E293B',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      borderBottomWidth: 0.75,
      borderBottomColor: '#E2E8F0',
      paddingBottom: 1.5,
      marginBottom: theme.itemSpacing - 1,
    },
    // Body Items
    itemBlock: {
      marginBottom: theme.itemSpacing + 2,
    },
    itemHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 1.5,
    },
    itemTitle: {
      fontFamily: theme.fontFamilyBold,
      fontSize: theme.subheadFontSize,
      color: '#0F172A',
    },
    itemSubtitle: {
      fontFamily: theme.fontFamilyBold,
      fontSize: theme.bodyFontSize,
      color: templateId === 'modern' ? theme.secondaryColor : '#334155',
    },
    itemDateText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.bodyFontSize - 0.5,
      color: theme.mutedColor,
    },
    itemLocationText: {
      fontFamily: theme.fontFamilyItalic,
      fontSize: theme.bodyFontSize - 0.5,
      color: theme.mutedColor,
    },
    // Bullets
    bulletRow: {
      flexDirection: 'row',
      marginTop: 2,
      paddingLeft: 4,
    },
    bulletSymbol: {
      width: 10,
      fontSize: theme.bodyFontSize,
      color: theme.bulletColor,
      lineHeight: theme.lineHeight,
    },
    bulletText: {
      flex: 1,
      fontSize: theme.bodyFontSize,
      color: theme.textColor,
      lineHeight: theme.lineHeight,
    },
    // Skills
    skillsCategoryRow: {
      flexDirection: 'row',
      marginBottom: 3.5,
    },
    skillCategoryLabel: {
      fontFamily: theme.fontFamilyBold,
      fontSize: theme.bodyFontSize,
      color: '#0F172A',
      width: 100,
    },
    skillCategoryValues: {
      flex: 1,
      fontFamily: theme.fontFamily,
      fontSize: theme.bodyFontSize,
      color: theme.textColor,
      lineHeight: theme.lineHeight,
    },
    // Summary paragraph
    summaryParagraph: {
      fontSize: theme.bodyFontSize,
      lineHeight: theme.lineHeight + 0.1,
      color: theme.textColor,
    },
    // Footer / Page numbers
    pageNumber: {
      position: 'absolute',
      fontSize: 8,
      bottom: 16,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: '#94A3B8',
    },
  });
}
