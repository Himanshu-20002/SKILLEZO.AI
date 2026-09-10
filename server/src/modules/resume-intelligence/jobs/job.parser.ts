import {
  EducationRequirement,
  ExperienceRequirement,
  CertificationRequirement,
} from "../roles/role.types";
import { JobRequirementEvidence, JobResponsibility } from "./job.types";

export interface ParsedJDSections {
  title?: string;
  summary: string[];
  requirements: string[];
  qualifications: string[];
  preferred: string[];
  responsibilities: string[];
  other: string[];
}

export class JobParser {
  /**
   * Deterministically parses structured sections from normalized JD text.
   */
  public static parseSections(text: string): ParsedJDSections {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    const sections: ParsedJDSections = {
      summary: [],
      requirements: [],
      qualifications: [],
      preferred: [],
      responsibilities: [],
      other: [],
    };

    let currentSection: keyof ParsedJDSections = "summary";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // First line if short could be title
      if (i === 0 && line.length < 80 && !line.endsWith(".")) {
        sections.title = line;
        continue;
      }

      const isBullet = /^[-*•\d.)]\s*/.test(line);
      const isShortHeading = line.length <= 60 || line.endsWith(":");
      const lower = line.toLowerCase().replace(/[:#*-]/g, "").trim();

      // Heading detection (only if not a bullet point or if line is a standalone heading)
      if (!isBullet && isShortHeading) {
        if (
          /^(must have|minimum qualifications|basic qualifications|core requirements|required skills|requirements|what you need|what you'll need|what you bring)$/i.test(
            lower
          ) ||
          /^(requirements|qualifications|must have|core requirements):?$/i.test(lower)
        ) {
          currentSection = "requirements";
          continue;
        }
        if (
          /^(preferred qualifications|nice to have|bonus points|good to have|preferred skills|additional qualifications|desired skills)$/i.test(
            lower
          ) ||
          /^(preferred|nice to have):?$/i.test(lower)
        ) {
          currentSection = "preferred";
          continue;
        }
        if (
          /^(responsibilities|what you'll do|what you will do|key duties|role responsibilities|the role|your impact)$/i.test(
            lower
          ) ||
          /^(responsibilities|duties):?$/i.test(lower)
        ) {
          currentSection = "responsibilities";
          continue;
        }
        if (/^(qualifications|skills & experience|who you are|about you)$/i.test(lower)) {
          currentSection = "qualifications";
          continue;
        }
        if (/^(about us|company overview|benefits|perks|what we offer)$/i.test(lower)) {
          currentSection = "other";
          continue;
        }
      }

      // Add line to active section array
      (sections[currentSection] as string[]).push(line);
    }

    return sections;
  }

  /**
   * Extracts years of experience requirements (e.g., "3+ years of experience in React").
   */
  public static extractExperienceRequirements(
    text: string,
    evidenceList: JobRequirementEvidence[]
  ): ExperienceRequirement[] {
    const requirements: ExperienceRequirement[] = [];
    const expRegex = /\b(\d+)(?:\s*[-–to]\s*(\d+))?\+?\s*(?:years?|yrs?)\b(?:\s+(?:of\s+)?(?:experience|exp|background|proven\s+track\s+record))?(?:(?:\s+in|\s+with|\s+building)?\s+([a-zA-Z0-9\s/.,+#-]+?))?(?=[.;,]|\band\b|\n|$)/gi;

    let match: RegExpExecArray | null;
    let idx = 0;
    while ((match = expRegex.exec(text)) !== null) {
      const minYears = parseInt(match[1], 10);
      const maxYears = match[2] ? parseInt(match[2], 10) : undefined;
      const category = match[3] ? match[3].trim().slice(0, 50) : undefined;
      const matchedSnippet = match[0].trim();

      if (minYears >= 1 && minYears <= 20) {
        const evidenceId = `jd_exp_${idx++}`;
        const isPreferred = /\b(preferred|bonus|nice to have|plus)\b/i.test(matchedSnippet);
        const reqType = isPreferred ? "PREFERRED" : "REQUIRED";

        evidenceList.push({
          evidenceId,
          sourceSection: "REQUIREMENTS",
          sourceText: matchedSnippet,
          extractionMethod: "PATTERN",
          confidence: 0.95,
          requirementType: reqType,
        });

        requirements.push({
          minYears,
          maxYears,
          category: category || "Professional Software Engineering",
          requirementType: reqType,
          evidenceIds: [evidenceId],
        });
      }
    }

    return requirements;
  }

  /**
   * Extracts required / preferred education qualifications.
   */
  public static extractEducationRequirements(
    text: string,
    evidenceList: JobRequirementEvidence[]
  ): EducationRequirement[] {
    const education: EducationRequirement[] = [];
    let idx = 0;

    if (/\b(bachelor'?s?|b\.tech|b\.e\.|b\.s\.|bs in cs|undergraduate)\b/i.test(text)) {
      const evidenceId = `jd_edu_${idx++}`;
      education.push({
        degreeLevel: "BACHELORS",
        fieldOfStudy: "Computer Science, Engineering, or related technical field",
        requirementType: /\b(preferred|plus|bonus)\b/i.test(text) ? "PREFERRED" : "REQUIRED",
      });
      evidenceList.push({
        evidenceId,
        sourceSection: "QUALIFICATIONS",
        sourceText: "Bachelor's degree or equivalent in Computer Science or related field",
        extractionMethod: "PATTERN",
        confidence: 0.90,
        requirementType: "REQUIRED",
      });
    }

    if (/\b(master'?s?|m\.tech|m\.s\.|ms in cs|postgraduate|phd|doctorate)\b/i.test(text)) {
      const evidenceId = `jd_edu_${idx++}`;
      education.push({
        degreeLevel: "MASTERS",
        fieldOfStudy: "Computer Science or related advanced technical field",
        requirementType: "PREFERRED",
      });
      evidenceList.push({
        evidenceId,
        sourceSection: "PREFERRED",
        sourceText: "Master's degree or equivalent advanced degree",
        extractionMethod: "PATTERN",
        confidence: 0.85,
        requirementType: "PREFERRED",
      });
    }

    return education;
  }

  /**
   * Extracts explicit certification requirements (e.g., "AWS Certified", "CKA").
   */
  public static extractCertifications(
    text: string,
    evidenceList: JobRequirementEvidence[]
  ): CertificationRequirement[] {
    const certs: CertificationRequirement[] = [];
    const certPatterns = [
      { pattern: /\b(AWS Certified|Solutions Architect|AWS Developer Associate)\b/gi, name: "AWS Certified Solutions Architect" },
      { pattern: /\b(CKA|Certified Kubernetes Administrator|CKAD)\b/gi, name: "Certified Kubernetes Administrator (CKA)" },
      { pattern: /\b(Azure Solutions Architect|AZ-204|AZ-104)\b/gi, name: "Microsoft Certified: Azure Developer" },
      { pattern: /\b(Google Cloud Certified|GCP Professional Cloud Architect)\b/gi, name: "GCP Professional Cloud Architect" },
      { pattern: /\b(CISSP|CEH|Certified Ethical Hacker)\b/gi, name: "Cybersecurity Certification (CISSP/CEH)" },
    ];

    let idx = 0;
    certPatterns.forEach(({ pattern, name }) => {
      const match = text.match(pattern);
      if (match) {
        const evidenceId = `jd_cert_${idx++}`;
        const isReq = /\b(must have|required)\b/i.test(text);
        const reqType = isReq ? "REQUIRED" : "PREFERRED";

        certs.push({
          name,
          requirementType: reqType,
        });

        evidenceList.push({
          evidenceId,
          sourceSection: "QUALIFICATIONS",
          sourceText: match[0],
          extractionMethod: "PATTERN",
          confidence: 0.92,
          requirementType: reqType,
        });
      }
    });

    return certs;
  }

  /**
   * Extracts bullet responsibilities.
   */
  public static extractResponsibilities(
    sections: ParsedJDSections,
    evidenceList: JobRequirementEvidence[]
  ): JobResponsibility[] {
    const respList: JobResponsibility[] = [];
    sections.responsibilities.forEach((respText, idx) => {
      if (respText.length > 15) {
        const evidenceId = `jd_resp_${idx}`;
        respList.push({
          text: respText,
          evidenceId,
          confidence: 0.92,
        });
        evidenceList.push({
          evidenceId,
          sourceSection: "RESPONSIBILITIES",
          sourceText: respText.slice(0, 160),
          extractionMethod: "EXACT",
          confidence: 0.92,
          requirementType: "INFORMATIONAL",
        });
      }
    });
    return respList;
  }

  /**
   * Extracts industry keywords and business domains.
   */
  public static extractDomainsAndKeywords(text: string): { domains: string[]; keywords: string[] } {
    const lower = text.toLowerCase();
    const domains: string[] = [];
    const keywords: string[] = [];

    const domainList = [
      { name: "FinTech", regex: /\b(fintech|finance|payments|banking|trading|crypto)\b/i },
      { name: "E-Commerce", regex: /\b(e-commerce|ecommerce|retail|marketplace|cart|checkout)\b/i },
      { name: "SaaS", regex: /\b(saas|b2b|subscription|multi-tenant|enterprise)\b/i },
      { name: "Healthcare", regex: /\b(healthcare|healthtech|hipaa|medical|patient)\b/i },
      { name: "Cloud Infrastructure", regex: /\b(infrastructure|cloud platforms|sre|distributed systems)\b/i },
      { name: "Artificial Intelligence", regex: /\b(ai|llm|genai|machine learning|nlp|computer vision)\b/i },
    ];

    domainList.forEach((d) => {
      if (d.regex.test(lower)) domains.push(d.name);
    });

    const keywordList = [
      "microservices", "scalable", "high-throughput", "low-latency", "ci/cd",
      "restful", "agile", "tdd", "observability", "event-driven", "distributed systems"
    ];

    keywordList.forEach((kw) => {
      if (lower.includes(kw)) keywords.push(kw);
    });

    return { domains, keywords };
  }
}
