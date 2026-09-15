import React from 'react';
import { Document, Page, View, Text, Link } from '@react-pdf/renderer';
import { ResumeDocument } from '@/types/resume-document';
import {
  ResumeBuilderConfig,
  CANONICAL_SECTION_ORDER,
  ReorderableSectionId,
} from '@/types/resume-builder.types';
import { resolvePdfTheme, createPdfStyles } from './pdf-styles';

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

    return (
      <View style={styles.headerContainer}>
        <Text style={styles.candidateName}>{contact.fullName || 'Candidate Name'}</Text>

        {document.summary?.targetRole ? (
          <Text style={styles.targetRoleText}>{document.summary.targetRole}</Text>
        ) : null}

        <View style={styles.contactRow}>
          {contact.email ? (
            <Text style={styles.contactItem}>{contact.email}</Text>
          ) : null}
          {contact.phone ? (
            <Text style={styles.contactItem}>• {contact.phone}</Text>
          ) : null}
          {contact.location ? (
            <Text style={styles.contactItem}>• {contact.location}</Text>
          ) : null}
          {contact.links?.map((link, idx) => {
            if (!link.url) return null;
            return (
              <Link key={idx} src={link.url} style={styles.linkItem}>
                • {link.label || 'Link'}
              </Link>
            );
          })}
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
    return (
      <View style={styles.sectionContainer}>
        {renderSectionHeader('Professional Summary')}
        <Text style={styles.summaryParagraph}>{document.summary.text}</Text>
      </View>
    );
  };

  // Skills Section
  const renderSkills = () => {
    if (!document.skills || document.skills.length === 0) return null;

    // Group skills by category
    const grouped: Record<string, string[]> = {};
    document.skills.forEach((s) => {
      const cat = s.category || 'TECHNICAL';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s.name);
    });

    return (
      <View style={styles.sectionContainer} wrap={false} minPresenceAhead={25}>
        {renderSectionHeader('Technical Skills')}
        {Object.entries(grouped).map(([category, skillList]) => (
          <View key={category} style={styles.skillsCategoryRow}>
            <Text style={styles.skillCategoryLabel}>
              {category.charAt(0) + category.slice(1).toLowerCase()}:
            </Text>
            <Text style={styles.skillCategoryValues}>{skillList.join(', ')}</Text>
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
          const dateRange = item.isCurrent
            ? `${item.startDate || ''} – Present`
            : `${item.startDate || ''} – ${item.endDate || ''}`;

          return (
            <View key={item.id} style={styles.itemBlock} wrap={false}>
              <View style={styles.itemHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.jobTitle}</Text>
                  <Text style={styles.itemSubtitle}>{item.companyName}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.itemDateText}>{dateRange}</Text>
                  {item.location ? (
                    <Text style={styles.itemLocationText}>{item.location}</Text>
                  ) : null}
                </View>
              </View>

              {item.bullets?.map((bullet, idx) => (
                <View key={bullet.id || idx} style={styles.bulletRow}>
                  <Text style={styles.bulletSymbol}>•</Text>
                  <Text style={styles.bulletText}>{bullet.text}</Text>
                </View>
              ))}
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
        {document.projects.map((proj) => (
          <View key={proj.id} style={styles.itemBlock} wrap={false}>
            <View style={styles.itemHeaderRow}>
              <Text style={styles.itemTitle}>{proj.title}</Text>
              {proj.link ? (
                <Link src={proj.link} style={styles.linkItem}>
                  Live Demo
                </Link>
              ) : proj.repoUrl ? (
                <Link src={proj.repoUrl} style={styles.linkItem}>
                  Repository
                </Link>
              ) : null}
            </View>

            {proj.technologies?.length ? (
              <Text style={styles.itemSubtitle}>
                Stack: {proj.technologies.join(', ')}
              </Text>
            ) : null}

            {proj.description ? (
              <Text style={[styles.summaryParagraph, { marginTop: 2 }]}>
                {proj.description}
              </Text>
            ) : null}

            {proj.bullets?.map((b, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.bulletSymbol}>•</Text>
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        ))}
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
          const dateRange = `${edu.startDate || ''} – ${edu.endDate || ''}`.trim();
          const degreeText = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ');

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
                  {dateRange !== '–' ? (
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
      <View style={styles.sectionContainer}>
        {renderSectionHeader('Certifications & Achievements')}
        {document.achievements.map((item) => (
          <View key={item.id} style={styles.itemBlock} wrap={false}>
            <View style={styles.itemHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.issuer ? (
                  <Text style={styles.itemSubtitle}>{item.issuer}</Text>
                ) : null}
              </View>
              {item.date ? (
                <Text style={styles.itemDateText}>{item.date}</Text>
              ) : null}
            </View>
            {item.description ? (
              <Text style={styles.summaryParagraph}>{item.description}</Text>
            ) : null}
            {item.url ? (
              <Link src={item.url} style={[styles.linkItem, { marginTop: 1.5 }]}>
                View Certificate
              </Link>
            ) : null}
          </View>
        ))}
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
