import {
  ResumeDocument,
  ResumeContact,
  ResumeSummary,
  ResumeSkillItem,
  ResumeExperienceItem,
  ResumeProjectItem,
  ResumeEducationItem,
  ResumeAchievementItem,
  ResumeEvidence,
  ResumeTemplateConfig,
  ResumeVersionMetadata,
} from "./resume-document.types";
import { ResumeBuilderConfig, DEFAULT_BUILDER_CONFIG } from "../builder/builder.types";

/**
 * Deep-clones a ResumeContact object immutably.
 */
function cloneContact(contact: ResumeContact): ResumeContact {
  return {
    fullName: contact.fullName,
    email: contact.email,
    phone: contact.phone,
    location: contact.location,
    links: Array.isArray(contact.links)
      ? contact.links.map((link) => ({ label: link.label, url: link.url }))
      : [],
  };
}

/**
 * Deep-clones a ResumeSummary object immutably.
 */
function cloneSummary(summary: ResumeSummary): ResumeSummary {
  return {
    text: summary.text,
    targetRole: summary.targetRole,
    yearsOfExperience: summary.yearsOfExperience,
  };
}

/**
 * Deep-clones ResumeSkillItem array immutably.
 */
function cloneSkills(skills: ResumeSkillItem[]): ResumeSkillItem[] {
  if (!Array.isArray(skills)) return [];
  return skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    category: skill.category,
    proficiency: skill.proficiency,
    evidenceIds: Array.isArray(skill.evidenceIds) ? [...skill.evidenceIds] : [],
  }));
}

/**
 * Deep-clones ResumeExperienceItem array immutably with bullets and tech stacks.
 */
function cloneExperience(experience: ResumeExperienceItem[]): ResumeExperienceItem[] {
  if (!Array.isArray(experience)) return [];
  return experience.map((exp) => ({
    id: exp.id,
    companyName: exp.companyName,
    jobTitle: exp.jobTitle,
    location: exp.location,
    startDate: exp.startDate,
    endDate: exp.endDate,
    isCurrent: Boolean(exp.isCurrent),
    bullets: Array.isArray(exp.bullets)
      ? exp.bullets.map((b) => ({
          id: b.id,
          text: b.text,
          verbs: Array.isArray(b.verbs) ? [...b.verbs] : [],
          metrics: Array.isArray(b.metrics) ? [...b.metrics] : [],
          evidenceIds: Array.isArray(b.evidenceIds) ? [...b.evidenceIds] : [],
        }))
      : [],
    technologiesUsed: Array.isArray(exp.technologiesUsed) ? [...exp.technologiesUsed] : [],
  }));
}

/**
 * Deep-clones ResumeProjectItem array immutably.
 */
function cloneProjects(projects: ResumeProjectItem[]): ResumeProjectItem[] {
  if (!Array.isArray(projects)) return [];
  return projects.map((proj) => ({
    id: proj.id,
    title: proj.title,
    subtitle: proj.subtitle,
    description: proj.description,
    technologies: Array.isArray(proj.technologies) ? [...proj.technologies] : [],
    link: proj.link,
    repoUrl: proj.repoUrl,
    bullets: Array.isArray(proj.bullets) ? [...proj.bullets] : [],
  }));
}

/**
 * Deep-clones ResumeEducationItem array immutably.
 */
function cloneEducation(education: ResumeEducationItem[]): ResumeEducationItem[] {
  if (!Array.isArray(education)) return [];
  return education.map((edu) => ({
    id: edu.id,
    institution: edu.institution,
    degree: edu.degree,
    fieldOfStudy: edu.fieldOfStudy,
    startDate: edu.startDate,
    endDate: edu.endDate,
    gradeOrGpa: edu.gradeOrGpa,
    honors: Array.isArray(edu.honors) ? [...edu.honors] : [],
  }));
}

/**
 * Deep-clones ResumeAchievementItem array immutably.
 */
function cloneAchievements(achievements: ResumeAchievementItem[]): ResumeAchievementItem[] {
  if (!Array.isArray(achievements)) return [];
  return achievements.map((ach) => ({
    id: ach.id,
    title: ach.title,
    issuer: ach.issuer,
    date: ach.date,
    description: ach.description,
    url: ach.url,
  }));
}

/**
 * Deep-clones ResumeEvidence ledger array immutably.
 */
function cloneEvidence(evidence: ResumeEvidence[]): ResumeEvidence[] {
  if (!Array.isArray(evidence)) return [];
  return evidence.map((ev) => ({
    id: ev.id,
    type: ev.type,
    source: ev.source,
    value: ev.value,
    confidence: ev.confidence,
    verified: Boolean(ev.verified),
    sectionId: ev.sectionId,
    itemId: ev.itemId,
    sourceDocumentId: ev.sourceDocumentId,
    createdAt: ev.createdAt,
  }));
}

/**
 * Deep-clones ResumeTemplateConfig immutably.
 */
function cloneTemplateConfig(config?: ResumeTemplateConfig): ResumeTemplateConfig {
  return {
    templateId: config?.templateId || "modern",
    primaryColor: config?.primaryColor || "#0284c7",
    fontFamily: config?.fontFamily || "Inter",
    fontSize: config?.fontSize || "regular",
    margins: config?.margins || "normal",
  };
}

/**
 * Deep-clones ResumeVersionMetadata immutably.
 */
function cloneVersionMetadata(meta: ResumeVersionMetadata): ResumeVersionMetadata {
  return {
    versionId: meta.versionId,
    versionNumber: meta.versionNumber,
    name: meta.name,
    parentVersionId: meta.parentVersionId,
    createdAt: meta.createdAt,
    changeSummary: meta.changeSummary,
  };
}

/**
 * Strictly clones a canonical ResumeDocument AST without JSON.parse/stringify.
 * Guarantees that mutating the clone never mutates the original document.
 */
export function cloneResumeDocument(
  doc: ResumeDocument,
  overrides: Partial<ResumeDocument> = {}
): ResumeDocument {
  const cloned: ResumeDocument = {
    id: overrides.id || `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    userId: overrides.userId || doc.userId,
    title: overrides.title || doc.title,
    contact: cloneContact(doc.contact),
    summary: cloneSummary(doc.summary),
    skills: cloneSkills(doc.skills),
    experience: cloneExperience(doc.experience),
    projects: cloneProjects(doc.projects),
    education: cloneEducation(doc.education),
    achievements: cloneAchievements(doc.achievements),
    evidence: cloneEvidence(doc.evidence),
    targetRole: overrides.targetRole !== undefined ? overrides.targetRole : doc.targetRole,
    targetJobDescription:
      overrides.targetJobDescription !== undefined
        ? overrides.targetJobDescription
        : doc.targetJobDescription,
    templateConfig: cloneTemplateConfig(doc.templateConfig),
    scores: doc.scores
      ? {
          overall: { ...doc.scores.overall },
          sections: {
            contact: { ...doc.scores.sections.contact, strengths: [...doc.scores.sections.contact.strengths], weaknesses: [...doc.scores.sections.contact.weaknesses] },
            summary: { ...doc.scores.sections.summary, strengths: [...doc.scores.sections.summary.strengths], weaknesses: [...doc.scores.sections.summary.weaknesses] },
            skills: { ...doc.scores.sections.skills, strengths: [...doc.scores.sections.skills.strengths], weaknesses: [...doc.scores.sections.skills.weaknesses] },
            experience: { ...doc.scores.sections.experience, strengths: [...doc.scores.sections.experience.strengths], weaknesses: [...doc.scores.sections.experience.weaknesses] },
            projects: { ...doc.scores.sections.projects, strengths: [...doc.scores.sections.projects.strengths], weaknesses: [...doc.scores.sections.projects.weaknesses] },
            education: { ...doc.scores.sections.education, strengths: [...doc.scores.sections.education.strengths], weaknesses: [...doc.scores.sections.education.weaknesses] },
            achievements: { ...doc.scores.sections.achievements, strengths: [...doc.scores.sections.achievements.strengths], weaknesses: [...doc.scores.sections.achievements.weaknesses] },
          },
        }
      : undefined,
    currentVersion: doc.currentVersion
      ? cloneVersionMetadata(doc.currentVersion)
      : {
          versionId: "v1",
          versionNumber: 1,
          name: overrides.title || "Resume Variant",
          createdAt: new Date().toISOString(),
        },
    versions: Array.isArray(doc.versions)
      ? doc.versions.map(cloneVersionMetadata)
      : [],
    schemaVersion: doc.schemaVersion || "1.0.0",
    isMaster: overrides.isMaster !== undefined ? overrides.isMaster : false,
    createdAt: overrides.createdAt || new Date().toISOString(),
    updatedAt: overrides.updatedAt || new Date().toISOString(),
  };

  return cloned;
}

/**
 * Deep-clones a ResumeBuilderConfig object immutably.
 */
export function cloneBuilderConfig(config?: ResumeBuilderConfig | null): ResumeBuilderConfig {
  if (!config) return { ...DEFAULT_BUILDER_CONFIG };
  return {
    templateId: config.templateId,
    fontFamily: config.fontFamily,
    fontSize: config.fontSize,
    lineHeight: config.lineHeight,
    sectionSpacing: config.sectionSpacing,
    pageMargin: config.pageMargin,
    sectionOrder: Array.isArray(config.sectionOrder) ? [...config.sectionOrder] : [...DEFAULT_BUILDER_CONFIG.sectionOrder],
    density: config.density,
    accentStyle: config.accentStyle,
  };
}
