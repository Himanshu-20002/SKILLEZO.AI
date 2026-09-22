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
  timestamp?: string;
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
 * Generates a deterministic, collision-resistant identifier from input parts
 */
export function generateDeterministicId(prefix: string, ...parts: (string | number | undefined | null)[]): string {
  const payload = parts
    .filter((p) => p !== undefined && p !== null && String(p).trim() !== "")
    .map((p) => String(p).trim().toLowerCase())
    .join("::");
  const hash = crypto.createHash("sha256").update(payload || "empty").digest("hex").slice(0, 16);
  return `${prefix}_${hash}`;
}

/**
 * Normalizes date strings while strictly preserving source temporal precision.
 * Never invents month or day when only year or month-year is provided.
 */
export function normalizeDatePrecision(raw: string | Date | undefined | null): string | undefined {
  if (!raw) return undefined;
  if (raw instanceof Date) {
    if (isNaN(raw.getTime())) return undefined;
    return raw.toISOString().slice(0, 10);
  }

  const str = String(raw).trim();
  if (!str) return undefined;

  if (/^(present|current|now|ongoing)$/i.test(str)) {
    return "Present";
  }

  // Exact Year only: e.g. "2022"
  const yearMatch = str.match(/^(\d{4})$/);
  if (yearMatch) {
    return yearMatch[1];
  }

  // Month-Year formats: e.g. "2022-01", "2022/01"
  const isoMonthMatch = str.match(/^(\d{4})[-/](\d{1,2})$/);
  if (isoMonthMatch) {
    const month = isoMonthMatch[2].padStart(2, "0");
    return `${isoMonthMatch[1]}-${month}`;
  }

  // Slash or Dash Month-Year: e.g. "01/2022", "01-2022"
  const slashMonthMatch = str.match(/^(\d{1,2})[-/](\d{4})$/);
  if (slashMonthMatch) {
    const month = slashMonthMatch[1].padStart(2, "0");
    return `${slashMonthMatch[2]}-${month}`;
  }

  const textMonthMap: Record<string, string> = {
    jan: "01", january: "01",
    feb: "02", february: "02",
    mar: "03", march: "03",
    apr: "04", april: "04",
    may: "05",
    jun: "06", june: "06",
    jul: "07", july: "07",
    aug: "08", august: "08",
    sep: "09", september: "09",
    oct: "10", october: "10",
    nov: "11", november: "11",
    dec: "12", december: "12",
  };

  // Full date: e.g. "Jan 15, 2022" or "15 Jan 2022"
  const fullTextMatch = str.match(/^([a-z]+)\s+(\d{1,2}),?\s+(\d{4})$/i);
  if (fullTextMatch) {
    const month = textMonthMap[fullTextMatch[1].toLowerCase()];
    if (month) {
      const day = fullTextMatch[2].padStart(2, "0");
      return `${fullTextMatch[3]}-${month}-${day}`;
    }
  }

  // Month Year: e.g. "Jan 2022" or "January 2022"
  const monthTextMatch = str.match(/^([a-z]+)[,\s]+(\d{4})$/i);
  if (monthTextMatch) {
    const month = textMonthMap[monthTextMatch[1].toLowerCase()];
    if (month) {
      return `${monthTextMatch[2]}-${month}`;
    }
  }

  // ISO full date: e.g. "2022-01-15"
  const isoFullMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoFullMatch) {
    const month = isoFullMatch[2].padStart(2, "0");
    const day = isoFullMatch[3].padStart(2, "0");
    return `${isoFullMatch[1]}-${month}-${day}`;
  }

  return str;
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
    const timestamp = options.timestamp || new Date().toISOString();
    const userId = options.userId || "usr_anonymous";
    const title = options.title || options.fileName || "Canonical Resume";
    const docId = options.resumeId || generateDeterministicId("doc", userId, title);

    // 1. Contact Normalization
    const contact = this.normalizeContact(raw?.personalInfo, rawText, evidenceLedger, docId, timestamp);

    // 2. Summary Normalization
    const summary = this.normalizeSummary(raw?.summary, raw?.totalExperienceYears, evidenceLedger, docId, timestamp);

    // 3. Skills Normalization & Deduplication
    const skills = this.normalizeSkills(raw?.skills, rawText, evidenceLedger, docId, timestamp);

    // 4. Experience Normalization & Bullet Tokenization (preserves partial entries)
    const experience = this.normalizeExperience(raw?.experience, evidenceLedger, docId, timestamp);

    // 5. Projects Normalization
    const projects = this.normalizeProjects(raw?.projects, evidenceLedger, docId, timestamp);

    // 6. Education Normalization
    const education = this.normalizeEducation(raw?.education, evidenceLedger, docId, timestamp);

    // 7. Achievements / Certifications Normalization
    const achievements = this.normalizeAchievements(raw?.certifications, evidenceLedger, docId, timestamp);

    const versionId = generateDeterministicId("v", docId, 1);

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
        versionId,
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
      return this.repairDocument(candidateDoc, docId, timestamp);
    }

    return validationResult.data as ResumeDocument;
  }

  /**
   * Normalizes Personal Contact Info and Extracts Canonical Links (No Fabricated Fallbacks)
   */
  private normalizeContact(
    personalInfo?: any,
    rawText?: string | null,
    evidenceLedger?: ResumeEvidence[],
    sourceDocId?: string,
    timestamp = new Date().toISOString()
  ): ResumeContact {
    const rawName = personalInfo?.fullName || "";
    const cleanName = rawName
      .replace(/\s+/g, " ")
      .replace(/[\r\n\t]+/g, " ")
      .trim();

    const fullName = cleanName || "Resume";

    let email: string | undefined = undefined;
    const rawEmail = (personalInfo?.email || "").trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (rawEmail && emailRegex.test(rawEmail)) {
      email = rawEmail;
    } else if (rawText) {
      const textEmailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (textEmailMatch && emailRegex.test(textEmailMatch[0])) {
        email = textEmailMatch[0].toLowerCase().trim();
      }
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
              id: generateDeterministicId("ev", "link", canonical),
              type: "LINK",
              source: "PARSED",
              value: canonical,
              confidence: undefined,
              verified: false,
              sourceDocumentId: sourceDocId,
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
    sourceDocId?: string,
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

    if (evidenceLedger && cleanText) {
      evidenceLedger.push({
        id: generateDeterministicId("ev", "summary", cleanText),
        type: "PROJECT_CLAIM",
        source: "PARSED",
        value: cleanText,
        confidence: undefined,
        verified: false,
        sourceDocumentId: sourceDocId,
        createdAt: timestamp,
      });
    }

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
    sourceDocId?: string,
    timestamp = new Date().toISOString()
  ): ResumeSkillItem[] {
    const result: ResumeSkillItem[] = [];
    const seenSkillMap = new Map<string, ResumeSkillItem>();

    if (Array.isArray(rawSkills)) {
      for (const item of rawSkills) {
        if (!item || !item.name) continue;
        const rawName = item.name.replace(/\s+/g, " ").trim();
        if (!rawName || rawName.length < 1) continue;

        const normalizedKey = rawName.toLowerCase();
        if (!seenSkillMap.has(normalizedKey)) {
          const evidenceId = generateDeterministicId("ev", "skill", rawName);
          const skillId = generateDeterministicId("sk", rawName);
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
              confidence: undefined,
              verified: false,
              itemId: skillId,
              sourceDocumentId: sourceDocId,
              createdAt: timestamp,
            });
          }
        }
      }
    }

    return result;
  }

  /**
   * Normalizes Experience Items and Tokenizes Bullets.
   * DO NOT DROP PARTIAL ENTRIES: Entries with valid bullets are preserved even if company or title is undefined.
   */
  private normalizeExperience(
    rawExp?: IResumeExperience[] | null,
    evidenceLedger?: ResumeEvidence[],
    sourceDocId?: string,
    timestamp = new Date().toISOString()
  ): ResumeExperienceItem[] {
    const result: ResumeExperienceItem[] = [];
    if (!Array.isArray(rawExp)) return result;

    for (let i = 0; i < rawExp.length; i++) {
      const exp = rawExp[i];
      if (!exp) continue;

      const rawCompany = (exp.companyName || "").replace(/\s+/g, " ").trim();
      const rawTitle = (exp.jobTitle || "").replace(/\s+/g, " ").trim();
      const rawDesc = exp.description || "";

      // If there is no company, no job title, and no description, skip empty entry
      if (!rawCompany && !rawTitle && !rawDesc.trim()) continue;

      const companyName = rawCompany || undefined;
      const jobTitle = rawTitle || undefined;
      const isCurrent = Boolean(exp.isCurrent);

      const expId = generateDeterministicId("exp", companyName, jobTitle, i);

      const startDateStr = normalizeDatePrecision(exp.startDate);
      const endDateStr = isCurrent ? "Present" : normalizeDatePrecision(exp.endDate);

      // Tokenize bullets from description
      const bullets: ResumeExperienceBullet[] = [];
      const rawLines = rawDesc
        .split(/\n|•|\*|(?<=[.!?])\s+(?=[A-Z])/)
        .map((l) => l.replace(/^[-•*▪]\s*/, "").replace(/\s+/g, " ").trim())
        .filter((l) => l.length >= 8);

      for (let b = 0; b < rawLines.length; b++) {
        const line = rawLines[b];
        const bulletId = generateDeterministicId("blt", expId, b, line);
        const evidenceId = generateDeterministicId("ev", "bullet", line);

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
            confidence: undefined,
            verified: false,
            sectionId: expId,
            itemId: bulletId,
            sourceDocumentId: sourceDocId,
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
    sourceDocId?: string,
    timestamp = new Date().toISOString()
  ): ResumeProjectItem[] {
    const result: ResumeProjectItem[] = [];
    if (!Array.isArray(rawProjects)) return result;

    for (let i = 0; i < rawProjects.length; i++) {
      const proj = rawProjects[i];
      if (!proj || !proj.title) continue;

      const title = proj.title.replace(/\s+/g, " ").trim();
      const projId = generateDeterministicId("proj", title, i);
      const technologies = Array.isArray(proj.technologies)
        ? proj.technologies.map((t) => t.trim()).filter(Boolean)
        : [];

      // Extract and deduplicate bullets and description
      let bullets: string[] = [];
      let description: string | undefined = undefined;

      const splitBullets = (text: string): string[] => {
        return text
          .split(/(?:^|\n|\s+)[•\u2022\u25E6\u25AA]\s*|(?:\n\s*[-*]\s+)/)
          .map((s) => s.replace(/^[•\u2022\u25E6\u25AA\*\-]\s*/, "").replace(/\s+/g, " ").trim())
          .filter((s) => s.length > 0);
      };

      if (Array.isArray(proj.bullets) && proj.bullets.length > 0) {
        // Bullets were explicitly provided
        bullets = proj.bullets
          .flatMap((b) => splitBullets(b))
          .map((b) => b.replace(/^[•\u2022\u25E6\u25AA\*\-]\s*/, "").trim())
          .filter(Boolean)
          .slice(0, 4);

        // Check if proj.description is a distinct short summary or a duplicate of bullets
        if (proj.description) {
          const rawDescTrimmed = proj.description.replace(/\s+/g, " ").trim();
          const descNorm = rawDescTrimmed.replace(/^[•\u2022\u25E6\u25AA\*\-]\s*/, "").toLowerCase();
          const isBullet = /^[•\u2022\u25E6\u25AA\*\-]/.test(rawDescTrimmed);
          const isDuplicate = bullets.some((b) => b.toLowerCase() === descNorm);

          if (!isBullet && !isDuplicate) {
            description = rawDescTrimmed.slice(0, 250);
          }
        }
      } else if (proj.description) {
        // No explicit bullets, parse description
        const rawDesc = proj.description.trim();
        const hasBulletSymbols =
          /[•\u2022\u25E6\u25AA]/.test(rawDesc) ||
          /(?:^|\n)\s*[-*]\s+/.test(rawDesc);

        if (hasBulletSymbols) {
          const segments = splitBullets(rawDesc);
          const startsWithBullet = /^[•\u2022\u25E6\u25AA\*\-]/.test(rawDesc);

          if (!startsWithBullet && segments.length > 1) {
            description = segments[0].slice(0, 250);
            bullets = segments.slice(1, 5);
          } else {
            bullets = segments.slice(0, 4);
          }
        } else {
          // Plain short summary (max ~2 lines)
          description = rawDesc.replace(/\s+/g, " ").slice(0, 250);
          bullets = [];
        }
      }

      result.push({
        id: projId,
        title,
        description,
        technologies,
        link: proj.link ? canonicalizeUrl(proj.link) : undefined,
        repoUrl: proj.githubUrl ? canonicalizeUrl(proj.githubUrl) : undefined,
        bullets,
      });

      if (evidenceLedger) {
        const evidenceClaim = description || (bullets.length > 0 ? bullets[0] : "Project");
        evidenceLedger.push({
          id: generateDeterministicId("ev", "proj", title),
          type: "PROJECT_CLAIM",
          source: "PARSED",
          value: `${title}: ${evidenceClaim}`,
          confidence: undefined,
          verified: false,
          itemId: projId,
          sourceDocumentId: sourceDocId,
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
    sourceDocId?: string,
    timestamp = new Date().toISOString()
  ): ResumeEducationItem[] {
    const result: ResumeEducationItem[] = [];
    if (!Array.isArray(rawEdu)) return result;

    for (let i = 0; i < rawEdu.length; i++) {
      const edu = rawEdu[i];
      if (!edu || !edu.institution) continue;

      const institution = edu.institution.replace(/\s+/g, " ").trim();
      const eduId = generateDeterministicId("edu", institution, i);
      const degree = edu.degree ? edu.degree.replace(/\s+/g, " ").trim() : undefined;
      const fieldOfStudy = edu.fieldOfStudy ? edu.fieldOfStudy.replace(/\s+/g, " ").trim() : undefined;
      const startDate = normalizeDatePrecision(edu.startYear ? String(edu.startYear) : undefined);
      const endDate = normalizeDatePrecision(edu.endYear ? String(edu.endYear) : undefined);

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
          id: generateDeterministicId("ev", "edu", institution, degree),
          type: "DEGREE",
          source: "PARSED",
          value: `${degree || "Degree"} at ${institution}`,
          confidence: undefined,
          verified: false,
          itemId: eduId,
          sourceDocumentId: sourceDocId,
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
    sourceDocId?: string,
    timestamp = new Date().toISOString()
  ): ResumeAchievementItem[] {
    const result: ResumeAchievementItem[] = [];
    if (!Array.isArray(rawCerts)) return result;

    for (let i = 0; i < rawCerts.length; i++) {
      const cert = rawCerts[i];
      if (!cert || !cert.name) continue;

      const title = cert.name.replace(/\s+/g, " ").trim();
      const achId = generateDeterministicId("ach", title, i);
      const issuer = cert.issuer ? cert.issuer.replace(/\s+/g, " ").trim() : undefined;
      const date = normalizeDatePrecision(cert.issueDate);

      result.push({
        id: achId,
        title,
        issuer,
        date,
      });

      if (evidenceLedger) {
        evidenceLedger.push({
          id: generateDeterministicId("ev", "ach", title, issuer),
          type: "CERTIFICATION",
          source: "PARSED",
          value: title,
          confidence: undefined,
          verified: false,
          itemId: achId,
          sourceDocumentId: sourceDocId,
          createdAt: timestamp,
        });
      }
    }

    return result;
  }

  /**
   * Graceful repair without inventing fake candidate data
   */
  private repairDocument(doc: ResumeDocument, docId: string, timestamp: string): ResumeDocument {
    return {
      ...doc,
      contact: {
        fullName: doc.contact?.fullName || "Resume",
        email: doc.contact?.email && doc.contact.email.includes("@") ? doc.contact.email : undefined,
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
        versionId: generateDeterministicId("v", docId, 1),
        versionNumber: 1,
        name: "Initial Ingestion",
        createdAt: timestamp,
      },
      versions: Array.isArray(doc.versions) ? doc.versions : [],
      createdAt: doc.createdAt || timestamp,
      updatedAt: timestamp,
    };
  }
}

export const resumeDocumentNormalizer = new ResumeDocumentNormalizer();
