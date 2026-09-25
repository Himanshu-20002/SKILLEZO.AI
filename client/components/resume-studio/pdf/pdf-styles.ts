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

  // Font Size Scaling (calibrated for clean 1-page visual parity)
  let bodyFontSize = 9;
  let subheadFontSize = 10;
  let sectionTitleFontSize = 11.5;
  let nameFontSize = 19;

  if (fontSizeKey === 'small') {
    bodyFontSize = 8.2;
    subheadFontSize = 9.2;
    sectionTitleFontSize = 10.5;
    nameFontSize = 16.5;
  } else if (fontSizeKey === 'large') {
    bodyFontSize = 10;
    subheadFontSize = 11;
    sectionTitleFontSize = 12.5;
    nameFontSize = 21;
  }

  // Page Margins (compact professional print margins to eliminate awkward overflows)
  let pagePadding = 28; // ~0.39 in
  if (marginKey === 'compact') {
    pagePadding = 20; // ~0.28 in
  } else if (marginKey === 'wide') {
    pagePadding = 38; // ~0.53 in
  }

  // Section Spacing & Density
  let sectionSpacing = 10;
  let itemSpacing = 4;
  let lineHeight = 1.25;

  if (config?.sectionSpacing === 'compact' || templateId === 'compact') {
    sectionSpacing = 7;
    itemSpacing = 2.5;
    lineHeight = 1.18;
  } else if (config?.sectionSpacing === 'comfortable') {
    sectionSpacing = 14;
    itemSpacing = 6;
    lineHeight = 1.35;
  }

  // Accent Colors
  let primaryColor = '#1E293B'; // Slate 800
  let secondaryColor = '#475569';
  let borderColor = '#CBD5E1';
  let bulletColor = '#334155'; // Clean neutral bullets matching preview

  if (accentKey === 'professional' || templateId === 'modern') {
    primaryColor = '#3730A3'; // Indigo 800
    secondaryColor = '#4F46E5'; // Indigo 600
    borderColor = '#CBD5E1';
    bulletColor = templateId === 'modern' ? '#4F46E5' : '#334155';
  } else if (accentKey === 'minimal') {
    primaryColor = '#115E59'; // Teal 800
    secondaryColor = '#0D9488'; // Teal 600
    borderColor = '#99F6E4';
    bulletColor = '#334155';
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
      backgroundColor: '#FFFFFF',
    },
    // Header
    headerContainer: {
      marginBottom: theme.sectionSpacing,
      borderBottomWidth: 1,
      borderBottomColor: '#CBD5E1',
      paddingBottom: theme.itemSpacing + 2,
    },
    candidateName: {
      fontFamily: theme.fontFamilyBold,
      fontSize: theme.nameFontSize,
      lineHeight: 1.2,
      color: templateId === 'modern' ? theme.primaryColor : '#0F172A',
      letterSpacing: -0.2,
      marginBottom: 3,
    },
    targetRoleText: {
      fontFamily: theme.fontFamilyBold,
      fontSize: theme.subheadFontSize,
      lineHeight: 1.25,
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
      marginTop: 1.5,
      paddingLeft: 3,
    },
    bulletSymbol: {
      width: 9,
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
      marginBottom: 2.5,
      alignItems: 'flex-start',
    },
    skillCategoryLabel: {
      fontFamily: theme.fontFamilyBold,
      fontSize: theme.bodyFontSize,
      color: '#0F172A',
      width: 125,
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
      lineHeight: theme.lineHeight + 0.08,
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
