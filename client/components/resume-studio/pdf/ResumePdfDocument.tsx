import React from 'react';
import { Document, Page, View, Text, Link } from '@react-pdf/renderer';
import { ResumeDocument } from '@/types/resume-document';
import {
  ResumeBuilderConfig,
  CANONICAL_SECTION_ORDER,
  ReorderableSectionId,
} from '@/types/resume-builder.types';
import { resolvePdfTheme, createPdfStyles } from './pdf-styles';
import {
  CATEGORY_LABELS,
  getCategoryLabel,
  groupAndFormatSkills,
  cleanBulletText,
  cleanProjectContent,
  formatAchievementItem,
} from '../utils/resume-content.util';

interface ResumePdfDocumentProps {
  document: ResumeDocument;
  config?: ResumeBuilderConfig | null;
}

export const ResumePdfDocument: React.FC<ResumePdfDocumentProps> = ({
  document,
  config,
}) => {
  const theme = resolvePdfTheme(config);
  const templateId = config?.templateId || 'classic';
  const styles = createPdfStyles(theme, templateId);

  const sectionOrder: ReorderableSectionId[] =
    config?.sectionOrder && config.sectionOrder.length > 0
      ? config.sectionOrder
      : CANONICAL_SECTION_ORDER;

  // Header Component
  const renderHeader = () => {
    const contact = document.contact;
    if (!contact) return null;

    const contactParts: React.ReactNode[] = [];

    if (contact.location) {
      contactParts.push(
        <Text key="loc" style={styles.contactItem}>
          {contact.location}
        </Text>
      );
    }
    if (contact.phone) {
      contactParts.push(
        <Text key="phone" style={styles.contactItem}>
          {contactParts.length > 0 ? '· ' : ''}{contact.phone}
        </Text>
      );
    }
    if (contact.email) {
      contactParts.push(
        <Text key="email" style={styles.contactItem}>
          {contactParts.length > 0 ? '· ' : ''}{contact.email}
        </Text>
      );
    }
    contact.links?.forEach((link, idx) => {
      if (!link.url) return;
      contactParts.push(
        <Link key={`link-${idx}`} src={link.url} style={styles.linkItem}>
          {contactParts.length > 0 ? '· ' : ''}{link.label || 'Link'}
        </Link>
      );
    });

    const displayName =
      contact.fullName && contact.fullName.trim().toLowerCase() !== 'resume'
        ? contact.fullName.trim()
        : 'Candidate Name';

    return (
      <View style={styles.headerContainer}>
        <View style={{ marginBottom: 4 }}>
          <Text style={styles.candidateName}>{displayName}</Text>

          {document.summary?.targetRole ? (
            <Text style={styles.targetRoleText}>{document.summary.targetRole}</Text>
          ) : null}
        </View>

        <View style={styles.contactRow}>
          {contactParts}
        </View>
      </View>
    );
  };

  // Section Header Helper
  const renderSectionHeader = (title: string) => {
    let headerStyle: any = styles.sectionTitleClassic;
    if (templateId === 'modern') headerStyle = styles.sectionTitleModern;
    if (templateId === 'compact') headerStyle = styles.sectionTitleCompact;

    return (
      <View wrap={false} minPresenceAhead={20}>
        <Text style={headerStyle}>{title}</Text>
      </View>
    );
  };

  // Summary Section
  const renderSummary = () => {
    if (!document.summary?.text) return null;
    const cleanText = cleanBulletText(document.summary.text);
    return (
      <View style={styles.sectionContainer}>
        {renderSectionHeader('Professional Summary')}
        <Text style={styles.summaryParagraph}>{cleanText}</Text>
      </View>
    );
  };

  // Skills Section
  const renderSkills = () => {
    if (!document.skills || document.skills.length === 0) return null;

    const formattedGroups = groupAndFormatSkills(document.skills);
    if (!formattedGroups || formattedGroups.length === 0) return null;

    return (
      <View style={styles.sectionContainer} wrap={false} minPresenceAhead={25}>
        {renderSectionHeader('Technical Skills')}
        {formattedGroups.map((group) => (
          <View key={group.label} style={styles.skillsCategoryRow}>
            <Text style={styles.skillCategoryLabel}>
              {group.label}:
            </Text>
            <Text style={styles.skillCategoryValues}>{group.formattedLine}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Experience Section
  const renderExperience = () => {
    if (!document.experience || document.experience.length === 0) return null;

    return (
      <View style={styles.sectionContainer}>
        {renderSectionHeader('Work Experience')}
        {document.experience.map((item) => {
          const hasDate = Boolean(item.startDate || item.endDate || item.isCurrent);
          const dateRange = item.isCurrent
            ? `${item.startDate || ''} – Present`.trim()
            : hasDate
            ? `${item.startDate || ''} – ${item.endDate || ''}`.trim()
            : '';

          return (
            <View key={item.id} style={styles.itemBlock} wrap={false}>
              <View style={styles.itemHeaderRow}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Text style={styles.itemTitle}>{item.jobTitle}</Text>
                  {item.companyName ? (
                    <Text style={[styles.itemSubtitle, { marginLeft: 4 }]}>
                      | {item.companyName}
                    </Text>
                  ) : null}
                  {item.location ? (
                    <Text style={[styles.itemLocationText, { marginLeft: 4 }]}>
                      ({item.location})
                    </Text>
                  ) : null}
                </View>
                <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                  {dateRange && dateRange !== '–' ? (
                    <Text style={styles.itemDateText}>{dateRange}</Text>
                  ) : null}
                </View>
              </View>

              {item.bullets?.map((bullet, idx) => {
                const text = cleanBulletText(bullet.text);
                if (!text) return null;
                return (
                  <View key={bullet.id || idx} style={styles.bulletRow}>
                    <Text style={styles.bulletSymbol}>•</Text>
                    <Text style={styles.bulletText}>{text}</Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    );
  };

  // Projects Section
  const renderProjects = () => {
    if (!document.projects || document.projects.length === 0) return null;

    return (
      <View style={styles.sectionContainer}>
        {renderSectionHeader('Projects')}
        {document.projects.map((proj) => {
          const { cleanSummary, cleanBullets } = cleanProjectContent(proj);

          return (
            <View key={proj.id} style={styles.itemBlock} wrap={false}>
              <View style={styles.itemHeaderRow}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Text style={styles.itemTitle}>{proj.title}</Text>
                  {proj.subtitle ? (
                    <Text style={[styles.itemSubtitle, { marginLeft: 4 }]}>
                      — {proj.subtitle}
                    </Text>
                  ) : null}
                </View>
                <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                  {proj.link ? (
                    <Link src={proj.link} style={styles.linkItem}>
                      Live Demo
                    </Link>
                  ) : proj.repoUrl ? (
                    <Link src={proj.repoUrl} style={styles.linkItem}>
                      Code
                    </Link>
                  ) : null}
                </View>
              </View>

              {proj.technologies?.length ? (
                <Text style={[styles.itemSubtitle, { marginTop: 1, marginBottom: 2 }]}>
                  Stack: {proj.technologies.join(' · ')}
                </Text>
              ) : null}

              {cleanSummary ? (
                <Text style={[styles.summaryParagraph, { marginTop: 1, marginBottom: 2 }]}>
                  {cleanSummary}
                </Text>
              ) : null}

              {cleanBullets.map((b, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bulletSymbol}>•</Text>
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  // Education Section
  const renderEducation = () => {
    if (!document.education || document.education.length === 0) return null;

    return (
      <View style={styles.sectionContainer}>
        {renderSectionHeader('Education')}
        {document.education.map((edu) => {
          const hasDate = Boolean(edu.startDate || edu.endDate);
          const dateRange = hasDate
            ? `${edu.startDate || ''} – ${edu.endDate || ''}`.trim()
            : '';

          let degreeText = '';
          if (edu.degree && edu.fieldOfStudy) {
            if (edu.fieldOfStudy.toLowerCase().includes(edu.degree.toLowerCase())) {
              degreeText = edu.fieldOfStudy;
            } else if (edu.degree.toLowerCase().includes(edu.fieldOfStudy.toLowerCase())) {
              degreeText = edu.degree;
            } else {
              degreeText = `${edu.degree} in ${edu.fieldOfStudy}`;
            }
          } else {
            degreeText = edu.degree || edu.fieldOfStudy || '';
          }

          return (
            <View key={edu.id} style={styles.itemBlock} wrap={false}>
              <View style={styles.itemHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{edu.institution}</Text>
                  {degreeText ? (
                    <Text style={styles.itemSubtitle}>{degreeText}</Text>
                  ) : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {dateRange && dateRange !== '–' ? (
                    <Text style={styles.itemDateText}>{dateRange}</Text>
                  ) : null}
                  {edu.gradeOrGpa ? (
                    <Text style={styles.itemDateText}>GPA: {edu.gradeOrGpa}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // Achievements & Certifications Section
  const renderAchievements = () => {
    if (!document.achievements || document.achievements.length === 0) return null;

    return (
      <View style={styles.sectionContainer} wrap={false}>
        {renderSectionHeader('Achievements and Certifications')}
        {document.achievements.map((item) => {
          const formatted = formatAchievementItem(item);
          return (
            <View key={item.id} style={styles.bulletRow}>
              <Text style={styles.bulletSymbol}>•</Text>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
                  <Text style={styles.bulletText}>
                    {formatted.boldPrefix ? (
                      <Text style={{ fontFamily: theme.fontFamilyBold, color: '#0F172A' }}>
                        {formatted.boldPrefix}{' '}
                      </Text>
                    ) : null}
                    {formatted.normalText ? (
                      <Text style={{ fontFamily: theme.fontFamily, color: theme.textColor }}>
                        {formatted.normalText}
                      </Text>
                    ) : null}
                  </Text>
                </View>
                {formatted.formattedDate ? (
                  <Text style={[styles.itemDateText, { marginLeft: 6, flexShrink: 0 }]}>
                    {formatted.formattedDate}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // Dispatch section rendering according to reordered array
  const renderSection = (secId: ReorderableSectionId) => {
    switch (secId) {
      case 'summary':
        return renderSummary();
      case 'skills':
        return renderSkills();
      case 'experience':
        return renderExperience();
      case 'projects':
        return renderProjects();
      case 'education':
        return renderEducation();
      case 'achievements':
        return renderAchievements();
      default:
        return null;
    }
  };

  return (
    <Document
      title={`${document.contact?.fullName || 'Candidate'}_Resume`}
      author={document.contact?.fullName || 'Skillezo Candidate'}
      subject="Curriculum Vitae"
      creator="Skillezo AI Resume Studio"
    >
      <Page size="A4" style={styles.page}>
        {/* Contact info remains anchored first */}
        {renderHeader()}

        {/* Dynamic Section Ordering */}
        {sectionOrder.map((secId) => (
          <React.Fragment key={secId}>{renderSection(secId)}</React.Fragment>
        ))}

        {/* Page Numbering */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `Page ${pageNumber} of ${totalPages}` : ''
          }
          fixed
        />
      </Page>
    </Document>
  );
};
