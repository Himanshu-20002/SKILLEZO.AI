import crypto from "crypto";
import {
  ResumeDocument,
  ResumeContact,
  ResumeSummary,
  ResumeSkillItem,
  ResumeExperienceItem,
  ResumeExperienceBullet,
  ResumeProjectItem,
  ResumeEducationItem,
  ResumeAchievementItem,
  ResumeEvidence,
  ResumeLink,
} from "./resume-document.types";
import { ResumeDocumentSchema } from "./resume-document.schema";
import { IResumeExtractedData, IResumeSkill, IResumeExperience, IResumeProject, IResumeEducation, IResumeCertification } from "@/database/models/Resume.model";

export interface NormalizationOptions {
  userId?: string;
  resumeId?: string;
  title?: string;
  fileName?: string;
}

const ACTION_VERBS = [
  "built", "developed", "architected", "engineered", "designed", "implemented",
  "spearheaded", "created", "led", "managed", "optimized", "refactored",
  "deployed", "integrated", "automated", "delivered", "scaled", "reduced",
  "increased", "improved", "launched", "migrated", "collaborated", "mentored",
  "formulated", "established", "directed", "initiated", "facilitated"
];

const URL_LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?/i;
const URL_GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)\/?/i;
const URL_TWITTER_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/?/i;
const URL_PORTFOLIO_REGEX = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:dev|io|me|app|tech|design|space|site|co|com))(?:\/[^\s]*)?/i;
const GENERIC_URL_REGEX = /https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/gi;
const METRIC_REGEX = /(?:\b\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?(?:k|m|b)?\b|\b\d+(?:\+)?\s*(?:users|ms|s|hours|days|teams|microservices|clients|requests|endpoints|engineers|x|times|fold|queries|records|rps)\b)/gi;

export function extractMetricsFromText(text: string): string[] | undefined {
  const matches = Array.from(
    text.matchAll(/(?:\b\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?(?:k|m|b)?\b|\b\d+(?:\+)?\s*(?:users|ms|s|hours|days|teams|microservices|clients|requests|endpoints|engineers|x|times|fold|queries|records|rps)\b)/gi),
    (m) => m[0].trim()
  );
  return matches.length > 0 ? Array.from(new Set(matches)) : undefined;
}

/**
 * Normalizes raw skill category strings to canonical ResumeSkillItem category enum
 */
export function normalizeSkillCategory(
  skillName: string,
  rawCategory?: string | null
): ResumeSkillItem["category"] {
  const nameLower = skillName.trim().toLowerCase();
  const catLower = (rawCategory || "").toLowerCase();

  if (catLower.includes("mobile") || /react\s*native|flutter|ios|android/i.test(nameLower)) {
    return "MOBILE";
  }
  if (catLower.includes("front") || /react|next\.?js|vue|angular|tailwind|gsap|framer|redux|html|css|svelte|ui|ux/i.test(nameLower)) {
    return "FRONTEND";
  }
  if (catLower.includes("back") || /node\.?js|express|nest|fastapi|django|spring|flask|rest|graphql|grpc|jwt|microservice/i.test(nameLower)) {
    return "BACKEND";
  }
  if (catLower.includes("data") || /mongo|postgres|mysql|redis|dynamodb|firebase|sql|sqlite|cassandra|prisma/i.test(nameLower)) {
    return "DATABASE";
  }
  if (catLower.includes("cloud") || /aws|gcp|azure|vercel|netlify|cloudflare|heroku/i.test(nameLower)) {
    return "CLOUD";
  }
  if (catLower.includes("devops") || catLower.includes("platform") || /docker|kubernetes|k8s|ci[\/-]?cd|terraform|ansible|jenkins|linux|nginx/i.test(nameLower)) {
    return "DEVOPS";
  }
  if (catLower.includes("lang") || /typescript|javascript|python|java\b|c\+\+|c#|golang|go\b|rust|php|ruby|kotlin|swift/i.test(nameLower)) {
    return "LANGUAGE";
  }
  if (catLower.includes("test") || /jest|vitest|cypress|playwright|selenium|mocha|testing|e2e/i.test(nameLower)) {
    return "TESTING";
  }
  if (catLower.includes("ai") || catLower.includes("ml") || /machine\s*learning|genai|generative\s*ai|pytorch|tensorflow|llm|nlp|rag|langchain|deep\s*learning/i.test(nameLower)) {
    return "AI_ML";
  }
  if (catLower.includes("tool") || /postman|figma|git\b|github|jira|vite|webpack|vscode/i.test(nameLower)) {
    return "TOOLS";
  }

  return "OTHER";
}

/**
 * Ensures URL has valid protocol
 */
export function canonicalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export class ResumeDocumentNormalizer {
  /**
   * Master normalization pipeline: Transforms raw parser output into canonical, validated ResumeDocument
   */
  normalize(
    raw?: IResumeExtractedData | null,
    rawText?: string | null,
    options: NormalizationOptions = {}
  ): ResumeDocument {
    const evidenceLedger: ResumeEvidence[] = [];
    const timestamp = new Date().toISOString();
    const docId = options.resumeId || `doc_${crypto.randomUUID()}`;
    const userId = options.userId || "usr_anonymous";
    const title = options.title || options.fileName || "Canonical Resume";

    // 1. Contact Normalization
    const contact = this.normalizeContact(raw?.personalInfo, rawText, evidenceLedger, timestamp);

    // 2. Summary Normalization
    const summary = this.normalizeSummary(raw?.summary, raw?.totalExperienceYears, evidenceLedger, timestamp);

    // 3. Skills Normalization & Deduplication
    const skills = this.normalizeSkills(raw?.skills, rawText, evidenceLedger, timestamp);

    // 4. Experience Normalization & Bullet Tokenization
    const experience = this.normalizeExperience(raw?.experience, evidenceLedger, timestamp);

    // 5. Projects Normalization
    const projects = this.normalizeProjects(raw?.projects, evidenceLedger, timestamp);

    // 6. Education Normalization
    const education = this.normalizeEducation(raw?.education, evidenceLedger, timestamp);

    // 7. Achievements / Certifications Normalization
    const achievements = this.normalizeAchievements(raw?.certifications, evidenceLedger, timestamp);

    // Build candidate document
    const candidateDoc: ResumeDocument = {
      id: docId,
      userId,
      title,
      contact,
      summary,
      skills,
      experience,
      projects,
      education,
      achievements,
      evidence: evidenceLedger,
      targetRole: summary.targetRole || "Software Engineer",
      templateConfig: {
        templateId: "modern",
        fontSize: "regular",
        margins: "normal",
      },
      currentVersion: {
        versionId: `v_${crypto.randomUUID()}`,
        versionNumber: 1,
        name: "Initial Ingestion",
        createdAt: timestamp,
        changeSummary: "Normalized from raw resume extraction (Phase 1).",
      },
      versions: [],
      schemaVersion: "1.0.0",
      isMaster: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Schema Validation
    const validationResult = ResumeDocumentSchema.safeParse(candidateDoc);
    if (!validationResult.success) {
      // Graceful repair to maintain contract integrity
      return this.repairDocument(candidateDoc);
    }

    return validationResult.data as ResumeDocument;
  }

  /**
   * Normalizes Personal Contact Info and Extracts Canonical Links
   */
  private normalizeContact(
    personalInfo?: any,
    rawText?: string | null,
    evidenceLedger?: ResumeEvidence[],
    timestamp = new Date().toISOString()
  ): ResumeContact {
    const rawName = personalInfo?.fullName || "";
    const cleanName = rawName
      .replace(/\s+/g, " ")
      .replace(/[\r\n\t]+/g, " ")
      .trim();

    const fullName = cleanName && cleanName.length >= 2 ? cleanName : "Candidate";

    let email = (personalInfo?.email || "").trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      if (rawText) {
        const textEmailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (textEmailMatch) {
          email = textEmailMatch[0].toLowerCase().trim();
        }
      }
    }
    if (!email || !emailRegex.test(email)) {
      email = "candidate@example.com";
    }

    let phone: string | undefined = undefined;
    const rawPhone = personalInfo?.phone || "";
    if (rawPhone && typeof rawPhone === "string") {
      const cleanPhone = rawPhone.replace(/[^\d+()\s-]/g, "").replace(/\s+/g, " ").trim();
      if (cleanPhone.length >= 7) {
        phone = cleanPhone;
      }
    }

    let location: string | undefined = undefined;
    const rawLoc = personalInfo?.location || "";
    if (rawLoc && typeof rawLoc === "string") {
      const cleanLoc = rawLoc.replace(/\s+/g, " ").trim();
      if (cleanLoc.length >= 2 && !/^(location|address|based in)$/i.test(cleanLoc)) {
        location = cleanLoc;
      }
    }

    // Extract links
    const links: ResumeLink[] = [];
    const linkSet = new Set<string>();

    const checkAndAddLink = (url: string, label: ResumeLink["label"]) => {
      const canonical = canonicalizeUrl(url);
      if (canonical && !linkSet.has(canonical.toLowerCase())) {
        try {
          new URL(canonical); // Check URL validity
          linkSet.add(canonical.toLowerCase());
          links.push({ label, url: canonical });

          if (evidenceLedger) {
            evidenceLedger.push({
              id: `ev_link_${crypto.randomUUID()}`,
              type: "LINK",
              source: "PARSED",
              value: canonical,
              confidence: 0.95,
              verified: false,
              createdAt: timestamp,
            });
          }
        } catch {
          // Invalid URL format ignored safely
        }
      }
    };

    if (rawText) {
      const liMatch = rawText.match(URL_LINKEDIN_REGEX);
      if (liMatch) checkAndAddLink(liMatch[0], "LinkedIn");

      const ghMatch = rawText.match(URL_GITHUB_REGEX);
      if (ghMatch) checkAndAddLink(ghMatch[0], "GitHub");

      const twMatch = rawText.match(URL_TWITTER_REGEX);
      if (twMatch) checkAndAddLink(twMatch[0], "Twitter");

      const genericMatches = rawText.match(GENERIC_URL_REGEX) || [];
      for (const match of genericMatches) {
        if (/linkedin\.com/i.test(match)) {
          checkAndAddLink(match, "LinkedIn");
        } else if (/github\.com/i.test(match)) {
          checkAndAddLink(match, "GitHub");
        } else if (/twitter\.com|x\.com/i.test(match)) {
          checkAndAddLink(match, "Twitter");
        } else if (URL_PORTFOLIO_REGEX.test(match)) {
          checkAndAddLink(match, "Portfolio");
        }
      }
    }

    return {
      fullName,
      email,
      phone,
      location,
      links,
    };
  }

  /**
   * Normalizes Summary Section
   */
  private normalizeSummary(
    rawSummary?: string | null,
    totalExperienceYears?: number | null,
    evidenceLedger?: ResumeEvidence[],
    timestamp = new Date().toISOString()
  ): ResumeSummary {
    let cleanText = "";
    if (rawSummary && typeof rawSummary === "string") {
      cleanText = rawSummary
        .replace(/\s+/g, " ")
        .replace(/^(summary|profile|about me|objective|professional summary)\s*[:\-]?\s*/i, "")
        .trim();
    }

    const years = typeof totalExperienceYears === "number" && totalExperienceYears > 0
      ? totalExperienceYears
      : undefined;

    return {
      text: cleanText,
      yearsOfExperience: years,
    };
  }

  /**
   * Normalizes and Deduplicates Skills with Taxonomy Classification & Provenance Evidence
   */
  private normalizeSkills(
    rawSkills?: IResumeSkill[] | null,
    rawText?: string | null,
    evidenceLedger?: ResumeEvidence[],
    timestamp = new Date().toISOString()
  ): ResumeSkillItem[] {
    const result: ResumeSkillItem[] = [];
    const seenSkillMap = new Map<string, ResumeSkillItem>();

    if (Array.isArray(rawSkills)) {
      for (const item of rawSkills) {
        if (!item || !item.name) continue;
        const rawName = item.name.replace(/\s+/g, " ").trim();
        if (!rawName || rawName.length < 2) continue;

        const normalizedKey = rawName.toLowerCase();
        if (!seenSkillMap.has(normalizedKey)) {
          const evidenceId = `ev_skill_${crypto.randomUUID()}`;
          const skillId = `sk_${crypto.randomUUID()}`;
          const category = normalizeSkillCategory(rawName, item.category);

          const skillItem: ResumeSkillItem = {
            id: skillId,
            name: rawName,
            category,
            proficiency: "ADVANCED",
            evidenceIds: [evidenceId],
          };

          seenSkillMap.set(normalizedKey, skillItem);
          result.push(skillItem);

          if (evidenceLedger) {
            evidenceLedger.push({
              id: evidenceId,
              type: "SKILL",
              source: "PARSED",
              value: rawName,
              confidence: 0.9,
              verified: false,
              itemId: skillId,
              createdAt: timestamp,
            });
          }
        }
      }
    }

    return result;
  }

  /**
   * Normalizes Experience Items and Tokenizes Bullets
   */
  private normalizeExperience(
    rawExp?: IResumeExperience[] | null,
    evidenceLedger?: ResumeEvidence[],
    timestamp = new Date().toISOString()
  ): ResumeExperienceItem[] {
    const result: ResumeExperienceItem[] = [];
    if (!Array.isArray(rawExp)) return result;

    for (const exp of rawExp) {
      if (!exp || (!exp.companyName && !exp.jobTitle)) continue;

      const expId = `exp_${crypto.randomUUID()}`;
      const companyName = (exp.companyName || "Organization").replace(/\s+/g, " ").trim();
      const jobTitle = (exp.jobTitle || "Software Engineer").replace(/\s+/g, " ").trim();
      const isCurrent = Boolean(exp.isCurrent);

      let startDateStr: string | undefined = undefined;
      if (exp.startDate) {
        startDateStr = exp.startDate instanceof Date
          ? exp.startDate.toISOString().slice(0, 7)
          : String(exp.startDate).slice(0, 10);
      }

      let endDateStr: string | undefined = undefined;
      if (exp.endDate && !isCurrent) {
        endDateStr = exp.endDate instanceof Date
          ? exp.endDate.toISOString().slice(0, 7)
          : String(exp.endDate).slice(0, 10);
      } else if (isCurrent) {
        endDateStr = "Present";
      }

      // Tokenize bullets from description
      const bullets: ResumeExperienceBullet[] = [];
      const rawDesc = exp.description || "";
      const rawLines = rawDesc
        .split(/\n|•|\*|(?<=[.!?])\s+(?=[A-Z])/)
        .map((l) => l.replace(/^[-•*]\s*/, "").replace(/\s+/g, " ").trim())
        .filter((l) => l.length >= 10);

      for (const line of rawLines) {
        const bulletId = `blt_${crypto.randomUUID()}`;
        const evidenceId = `ev_bullet_${crypto.randomUUID()}`;

        // Detect action verbs
        const words = line.toLowerCase().split(/\W+/);
        const verbs = words.filter((w) => ACTION_VERBS.includes(w));

        // Detect metrics
        const metrics = extractMetricsFromText(line);

        bullets.push({
          id: bulletId,
          text: line,
          verbs: verbs.length > 0 ? Array.from(new Set(verbs)) : undefined,
          metrics,
          evidenceIds: [evidenceId],
        });

        if (evidenceLedger) {
          evidenceLedger.push({
            id: evidenceId,
            type: metrics && metrics.length > 0 ? "METRIC" : "PROJECT_CLAIM",
            source: "PARSED",
            value: line,
            confidence: 0.85,
            verified: false,
            sectionId: expId,
            itemId: bulletId,
            createdAt: timestamp,
          });
        }
      }

      result.push({
        id: expId,
        companyName,
        jobTitle,
        startDate: startDateStr,
        endDate: endDateStr,
        isCurrent,
        bullets,
      });
    }

    return result;
  }

  /**
   * Normalizes Projects Section
   */
  private normalizeProjects(
    rawProjects?: IResumeProject[] | null,
    evidenceLedger?: ResumeEvidence[],
    timestamp = new Date().toISOString()
  ): ResumeProjectItem[] {
    const result: ResumeProjectItem[] = [];
    if (!Array.isArray(rawProjects)) return result;

    for (const proj of rawProjects) {
      if (!proj || !proj.title) continue;

      const projId = `proj_${crypto.randomUUID()}`;
      const title = proj.title.replace(/\s+/g, " ").trim();
      const description = proj.description ? proj.description.replace(/\s+/g, " ").trim() : undefined;
      const technologies = Array.isArray(proj.technologies)
        ? proj.technologies.map((t) => t.trim()).filter(Boolean)
        : [];

      let link: string | undefined = undefined;
      if (proj.link && typeof proj.link === "string") {
        const canonicalLink = canonicalizeUrl(proj.link);
        try {
          new URL(canonicalLink);
          link = canonicalLink;
        } catch {
          // Ignore invalid URL
        }
      }

      // Generate bullets from description lines if multiline
      const bullets: string[] = [];
      if (description) {
        const lines = description
          .split(/\n|•|\*/)
          .map((l) => l.replace(/^[-•*]\s*/, "").replace(/\s+/g, " ").trim())
          .filter((l) => l.length >= 10);
        if (lines.length > 1) {
          bullets.push(...lines);
        } else {
          bullets.push(description);
        }
      }

      result.push({
        id: projId,
        title,
        description,
        technologies,
        link,
        bullets,
      });

      if (evidenceLedger) {
        evidenceLedger.push({
          id: `ev_proj_${crypto.randomUUID()}`,
          type: "PROJECT_CLAIM",
          source: "PARSED",
          value: title,
          confidence: 0.9,
          verified: false,
          itemId: projId,
          createdAt: timestamp,
        });
      }
    }

    return result;
  }

  /**
   * Normalizes Education Section
   */
  private normalizeEducation(
    rawEdu?: IResumeEducation[] | null,
    evidenceLedger?: ResumeEvidence[],
    timestamp = new Date().toISOString()
  ): ResumeEducationItem[] {
    const result: ResumeEducationItem[] = [];
    if (!Array.isArray(rawEdu)) return result;

    for (const edu of rawEdu) {
      if (!edu || !edu.institution) continue;

      const eduId = `edu_${crypto.randomUUID()}`;
      const institution = edu.institution.replace(/\s+/g, " ").trim();
      const degree = edu.degree ? edu.degree.replace(/\s+/g, " ").trim() : undefined;
      const fieldOfStudy = edu.fieldOfStudy ? edu.fieldOfStudy.replace(/\s+/g, " ").trim() : undefined;
      const startDate = edu.startYear ? String(edu.startYear) : undefined;
      const endDate = edu.endYear ? String(edu.endYear) : undefined;

      result.push({
        id: eduId,
        institution,
        degree,
        fieldOfStudy,
        startDate,
        endDate,
      });

      if (evidenceLedger) {
        evidenceLedger.push({
          id: `ev_edu_${crypto.randomUUID()}`,
          type: "DEGREE",
          source: "PARSED",
          value: `${degree || "Degree"} at ${institution}`,
          confidence: 0.95,
          verified: false,
          itemId: eduId,
          createdAt: timestamp,
        });
      }
    }

    return result;
  }

  /**
   * Normalizes Achievements & Certifications Section
   */
  private normalizeAchievements(
    rawCerts?: IResumeCertification[] | null,
    evidenceLedger?: ResumeEvidence[],
    timestamp = new Date().toISOString()
  ): ResumeAchievementItem[] {
    const result: ResumeAchievementItem[] = [];
    if (!Array.isArray(rawCerts)) return result;

    for (const cert of rawCerts) {
      if (!cert || !cert.name) continue;

      const achId = `ach_${crypto.randomUUID()}`;
      const title = cert.name.replace(/\s+/g, " ").trim();
      const issuer = cert.issuer ? cert.issuer.replace(/\s+/g, " ").trim() : undefined;
      let date: string | undefined = undefined;
      if (cert.issueDate) {
        date = cert.issueDate instanceof Date
          ? cert.issueDate.toISOString().slice(0, 10)
          : String(cert.issueDate).slice(0, 10);
      }

      result.push({
        id: achId,
        title,
        issuer,
        date,
      });

      if (evidenceLedger) {
        evidenceLedger.push({
          id: `ev_ach_${crypto.randomUUID()}`,
          type: "CERTIFICATION",
          source: "PARSED",
          value: title,
          confidence: 0.9,
          verified: false,
          itemId: achId,
          createdAt: timestamp,
        });
      }
    }

    return result;
  }

  /**
   * Graceful repair in case of minor validation constraints
   */
  private repairDocument(doc: ResumeDocument): ResumeDocument {
    return {
      ...doc,
      contact: {
        fullName: doc.contact?.fullName || "Candidate",
        email: doc.contact?.email && doc.contact.email.includes("@") ? doc.contact.email : "candidate@example.com",
        phone: doc.contact?.phone,
        location: doc.contact?.location,
        links: Array.isArray(doc.contact?.links) ? doc.contact.links : [],
      },
      summary: {
        text: doc.summary?.text || "",
        yearsOfExperience: doc.summary?.yearsOfExperience,
        targetRole: doc.summary?.targetRole,
      },
      skills: Array.isArray(doc.skills) ? doc.skills : [],
      experience: Array.isArray(doc.experience) ? doc.experience : [],
      projects: Array.isArray(doc.projects) ? doc.projects : [],
      education: Array.isArray(doc.education) ? doc.education : [],
      achievements: Array.isArray(doc.achievements) ? doc.achievements : [],
      evidence: Array.isArray(doc.evidence) ? doc.evidence : [],
      templateConfig: doc.templateConfig || {
        templateId: "modern",
        fontSize: "regular",
        margins: "normal",
      },
      schemaVersion: "1.0.0",
      isMaster: true,
      currentVersion: doc.currentVersion || {
        versionId: `v_${crypto.randomUUID()}`,
        versionNumber: 1,
        name: "Initial Ingestion",
        createdAt: new Date().toISOString(),
      },
      versions: Array.isArray(doc.versions) ? doc.versions : [],
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const resumeDocumentNormalizer = new ResumeDocumentNormalizer();
