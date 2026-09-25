import {
  IJobProfile,
  IJobRequirementItem,
} from "@/database/models/JobProfile.model";
import {
  IProfile,
  IProfileSkill,
  IProfileExperience,
  IProfileProject,
  IProfileEducation,
} from "@/database/models/Profile.model";
import { IResume } from "@/database/models/Resume.model";
import {
  IJobRequirementMatch,
  ICareerEvidenceReference,
  IJobMatchSummary,
  MatchState,
} from "@/database/models/JobMatchResult.model";
import { SkillNormalizer } from "@/modules/resume-intelligence/skills/skill.normalizer";
import { modelGateway } from "@/core/ai/gateway";
import { z } from "zod";

interface CandidateFactIndex {
  skills: Map<string, { skill: IProfileSkill; cleanKey: string; canonicalId?: string }>;
  projects: Array<{
    project: IProfileProject;
    cleanTech: string[];
    title: string;
    description: string;
  }>;
  experiences: Array<{
    exp: IProfileExperience;
    cleanTech: string[];
    roleTitle: string;
    company: string;
    bullets: string[];
  }>;
  education: IProfileEducation[];
  masterResumeKeywords: Set<string>;
}

export class CareerJobMatcher {
  /**
   * Main deterministic-first matching coordinator.
   */
  public static async match(
    jobProfile: IJobProfile,
    profile: IProfile,
    masterResume?: IResume | null
  ): Promise<{
    requirementMatches: IJobRequirementMatch[];
    summary: IJobMatchSummary;
    overallMatch: { score: number; label: string } | null;
  }> {
    const requirements = jobProfile.analysis?.requirements || [];
    const index = this.buildCandidateIndex(profile, masterResume);

    const matches: IJobRequirementMatch[] = [];

    for (let i = 0; i < requirements.length; i++) {
      const req = requirements[i];
      const match = await this.evaluateRequirement(req, `req_${i}`, index);
      matches.push(match);
    }

    const summary = this.computeSummary(matches);
    const overallMatch = this.deriveOverallMatch(summary);

    return {
      requirementMatches: matches,
      summary,
      overallMatch,
    };
  }

  /**
   * Build candidate facts indexing for rapid, deterministic lookup.
   */
  private static buildCandidateIndex(
    profile: IProfile,
    masterResume?: IResume | null
  ): CandidateFactIndex {
    const skillsMap = new Map<string, { skill: IProfileSkill; cleanKey: string; canonicalId?: string }>();

    for (const s of profile.skills || []) {
      const cleanKey = SkillNormalizer.cleanKey(s.name);
      const canonical = SkillNormalizer.normalize(s.name);
      const entry = { skill: s, cleanKey, canonicalId: canonical?.id };
      skillsMap.set(cleanKey, entry);
      if (canonical?.id) {
        skillsMap.set(canonical.id, entry);
      }
      for (const alias of canonical?.aliases || []) {
        skillsMap.set(SkillNormalizer.cleanKey(alias), entry);
      }
    }

    const projects = (profile.projects || []).map((p) => ({
      project: p,
      cleanTech: (p.techStack || []).map((t) => SkillNormalizer.cleanKey(t)),
      title: p.title,
      description: p.description || "",
    }));

    const experiences = (profile.experience || []).map((e) => ({
      exp: e,
      cleanTech: (e.technologiesUsed || []).map((t) => SkillNormalizer.cleanKey(t)),
      roleTitle: e.jobTitle || "",
      company: e.companyName || "",
      bullets: e.bullets || [],
    }));

    // Track master resume mentions to detect PROVEN_UNDERREPRESENTED
    const masterResumeKeywords = new Set<string>();
    if (masterResume?.extractedData) {
      for (const s of masterResume.extractedData.skills || []) {
        const clean = SkillNormalizer.cleanKey(s.name);
        masterResumeKeywords.add(clean);
        const canon = SkillNormalizer.normalize(s.name);
        if (canon?.id) masterResumeKeywords.add(canon.id);
        if (canon?.canonicalName) masterResumeKeywords.add(SkillNormalizer.cleanKey(canon.canonicalName));
      }
    }

    return {
      skills: skillsMap,
      projects,
      experiences,
      education: profile.education || [],
      masterResumeKeywords,
    };
  }

  /**
   * Evaluates a single job requirement against the candidate index.
   */
  private static async evaluateRequirement(
    req: IJobRequirementItem,
    reqId: string,
    index: CandidateFactIndex
  ): Promise<IJobRequirementMatch> {
    const reqCleanKey = SkillNormalizer.cleanKey(req.name);
    const reqCanonical = SkillNormalizer.normalize(req.name);

    // ---------------------------------------------------------
    // 1. Education Requirements
    // ---------------------------------------------------------
    if (req.category === "EDUCATION") {
      return this.evaluateEducationRequirement(req, reqId, index);
    }

    // ---------------------------------------------------------
    // 2. Experience Duration Requirements
    // ---------------------------------------------------------
    if (req.category === "EXPERIENCE" || /\b(\d+)\+?\s*years?\b/i.test(req.name)) {
      return this.evaluateExperienceRequirement(req, reqId, index);
    }

    // ---------------------------------------------------------
    // 3. Skills, Technologies, Tools
    // ---------------------------------------------------------
    const evidenceList: ICareerEvidenceReference[] = [];

    // Check Candidate Skills (exact, canonical, or word boundary match)
    let matchedSkillEntry = index.skills.get(reqCleanKey);
    if (!matchedSkillEntry && reqCanonical?.id) {
      matchedSkillEntry = index.skills.get(reqCanonical.id);
    }
    if (!matchedSkillEntry) {
      // Check word-boundary match for multi-token requirements (e.g. "GraphQL Architecture" matches "graphql")
      for (const [key, entry] of index.skills.entries()) {
        if (key.length >= 3) {
          const wordRegex = new RegExp(`\\b${this.escapeRegex(key)}\\b`, "i");
          if (wordRegex.test(req.name) || wordRegex.test(reqCleanKey)) {
            matchedSkillEntry = entry;
            break;
          }
        }
      }
    }

    if (matchedSkillEntry) {
      evidenceList.push({
        sourceType: "SKILL",
        sourceId: matchedSkillEntry.skill.name,
        label: `Skill: ${matchedSkillEntry.skill.name}${
          matchedSkillEntry.canonicalId && matchedSkillEntry.canonicalId !== matchedSkillEntry.cleanKey
            ? ` (Canonical: ${matchedSkillEntry.canonicalId})`
            : ""
        }`,
        excerpt: `Proficiency level: ${matchedSkillEntry.skill.level}/5 (${matchedSkillEntry.skill.source})`,
      });
    }

    // Check Candidate Experience (technologiesUsed and bullet points)
    for (const exp of index.experiences) {
      const hasTech = exp.cleanTech.some(
        (t) => t === reqCleanKey || (reqCanonical?.id && SkillNormalizer.normalize(t)?.id === reqCanonical.id)
      );

      const matchingBullet = exp.bullets.find((b) =>
        new RegExp(`\\b${this.escapeRegex(req.name)}\\b`, "i").test(b)
      );

      if (hasTech || matchingBullet) {
        evidenceList.push({
          sourceType: "EXPERIENCE",
          sourceId: exp.company || exp.roleTitle,
          label: `${exp.roleTitle} at ${exp.company || "Company"}`,
          excerpt: matchingBullet || `Utilized ${req.name} in role responsibilities.`,
        });
      }
    }

    // Check Candidate Projects (techStack and description)
    for (const proj of index.projects) {
      const hasTech = proj.cleanTech.some(
        (t) => t === reqCleanKey || (reqCanonical?.id && SkillNormalizer.normalize(t)?.id === reqCanonical.id)
      );

      const mentionsInDesc = new RegExp(`\\b${this.escapeRegex(req.name)}\\b`, "i").test(proj.description);

      if (hasTech || mentionsInDesc) {
        evidenceList.push({
          sourceType: "PROJECT",
          sourceId: proj.title,
          label: `Project: ${proj.title}`,
          excerpt: proj.description ? proj.description.slice(0, 160) : `Tech stack: ${proj.project.techStack?.join(", ")}`,
        });
      }
    }

    // If Direct Evidence Found: Check if PROVEN_RELEVANT or PROVEN_UNDERREPRESENTED
    if (evidenceList.length > 0) {
      let isUnderrepresented = false;

      // Check if master resume exists and underrepresents this verified evidence
      if (index.masterResumeKeywords.size > 0) {
        const isPresent =
          index.masterResumeKeywords.has(reqCleanKey) ||
          (reqCanonical?.id && index.masterResumeKeywords.has(reqCanonical.id)) ||
          (matchedSkillEntry && index.masterResumeKeywords.has(matchedSkillEntry.cleanKey)) ||
          (matchedSkillEntry?.canonicalId && index.masterResumeKeywords.has(matchedSkillEntry.canonicalId));

        if (!isPresent) {
          isUnderrepresented = true;
        }
      }

      const matchState: MatchState = isUnderrepresented
        ? "PROVEN_UNDERREPRESENTED"
        : "PROVEN_RELEVANT";

      const explanation = isUnderrepresented
        ? `Verified in your Career Profile across ${evidenceList.length} evidence sources, but not prominently showcased in your current Master Resume.`
        : `Verified across ${evidenceList.length} authentic Career Profile sources.`;

      return {
        requirementId: reqId,
        name: req.name,
        normalizedName: req.normalizedName,
        category: req.category,
        importance: req.importance,
        matchState,
        evidence: evidenceList,
        confidence: 0.98,
        explanation,
      };
    }

    // ---------------------------------------------------------
    // 4. Catalog Related Evidence (RELATED_EVIDENCE !== PROVEN_RELEVANT)
    // ---------------------------------------------------------
    if (reqCanonical?.relatedSkillIds && reqCanonical.relatedSkillIds.length > 0) {
      for (const relId of reqCanonical.relatedSkillIds) {
        if (index.skills.has(relId)) {
          const relSkill = index.skills.get(relId)!;
          const relDef = SkillNormalizer.getById(relId);
          const relName = relDef?.displayName || relSkill.skill.name;

          return {
            requirementId: reqId,
            name: req.name,
            normalizedName: req.normalizedName,
            category: req.category,
            importance: req.importance,
            matchState: "RELATED_EVIDENCE",
            evidence: [
              {
                sourceType: "SKILL",
                sourceId: relSkill.skill.name,
                label: `Related Skill: ${relName}`,
                excerpt: `Candidate possesses related competency ${relName}. Note: Does not prove ${req.name}.`,
              },
            ],
            confidence: 0.85,
            explanation: `Related technology experience (${relName}) found in your Career Profile. ⚠ Does not prove ${req.name}.`,
          };
        }
      }
    }

    // ---------------------------------------------------------
    // 5. Selective Semantic AI Reasoning for Domain or Unclassified
    // ---------------------------------------------------------
    if (req.category === "DOMAIN" || req.category === "QUALIFICATION" || req.importance === "UNKNOWN") {
      const semanticMatch = await this.evaluateSemanticRequirement(req, reqId, index);
      if (semanticMatch) {
        return semanticMatch;
      }
    }

    // ---------------------------------------------------------
    // 6. Default Fallback: MISSING (Zero Invention Invariant)
    // ---------------------------------------------------------
    return {
      requirementId: reqId,
      name: req.name,
      normalizedName: req.normalizedName,
      category: req.category,
      importance: req.importance,
      matchState: "MISSING",
      evidence: [],
      confidence: 1.0,
      explanation: `No verified evidence found in your Career Profile. SKILLEZO will not add this claim.`,
    };
  }

  /**
   * Evaluates Education requirements against candidate profile education.
   */
  private static evaluateEducationRequirement(
    req: IJobRequirementItem,
    reqId: string,
    index: CandidateFactIndex
  ): IJobRequirementMatch {
    if (index.education.length === 0) {
      return {
        requirementId: reqId,
        name: req.name,
        normalizedName: req.normalizedName,
        category: req.category,
        importance: req.importance,
        matchState: "MISSING",
        evidence: [],
        confidence: 1.0,
        explanation: "No education records found in your Career Profile.",
      };
    }

    const reqLower = req.name.toLowerCase();

    for (const edu of index.education) {
      const degLower = (edu.degree || "").toLowerCase();
      const fieldLower = (edu.fieldOfStudy || "").toLowerCase();

      // Check degree match e.g. "bachelor", "b.tech", "master", "computer science"
      const degMatch =
        (reqLower.includes("bachelor") && (degLower.includes("bachelor") || degLower.includes("b.tech") || degLower.includes("b.e") || degLower.includes("bs"))) ||
        (reqLower.includes("master") && (degLower.includes("master") || degLower.includes("m.tech") || degLower.includes("ms")));

      const fieldMatch =
        reqLower.includes("computer science") &&
        (fieldLower.includes("computer science") || fieldLower.includes("information technology") || fieldLower.includes("software"));

      if (degMatch || fieldMatch) {
        return {
          requirementId: reqId,
          name: req.name,
          normalizedName: req.normalizedName,
          category: req.category,
          importance: req.importance,
          matchState: "PROVEN_RELEVANT",
          evidence: [
            {
              sourceType: "EDUCATION",
              sourceId: edu.institution,
              label: `${edu.degree || "Degree"} in ${edu.fieldOfStudy || "Major"} - ${edu.institution}`,
              excerpt: `Graduated: ${edu.endYear || "N/A"}`,
            },
          ],
          confidence: 0.95,
          explanation: `Verified degree: ${edu.degree || ""} in ${edu.fieldOfStudy || ""} from ${edu.institution}.`,
        };
      }
    }

    // Has education but not matching degree
    const firstEdu = index.education[0];
    return {
      requirementId: reqId,
      name: req.name,
      normalizedName: req.normalizedName,
      category: req.category,
      importance: req.importance,
      matchState: "PARTIAL_MATCH",
      evidence: [
        {
          sourceType: "EDUCATION",
          sourceId: firstEdu.institution,
          label: `${firstEdu.degree || "Degree"} - ${firstEdu.institution}`,
          excerpt: `Field of study: ${firstEdu.fieldOfStudy || "N/A"}`,
        },
      ],
      confidence: 0.8,
      explanation: `Candidate has an academic degree (${firstEdu.degree || ""}), but not matching the requested specialization (${req.name}).`,
    };
  }

  /**
   * Evaluates Experience Duration requirements (e.g. "5+ years", "3 years").
   */
  private static evaluateExperienceRequirement(
    req: IJobRequirementItem,
    reqId: string,
    index: CandidateFactIndex
  ): IJobRequirementMatch {
    const match = req.name.match(/(\d+)\+?\s*years?/i);
    const requiredYears = match ? parseInt(match[1], 10) : 1;

    let totalMonths = 0;
    let hasIncompleteDates = false;
    const evidenceList: ICareerEvidenceReference[] = [];

    for (const exp of index.experiences) {
      if (!exp.exp.startDate) {
        hasIncompleteDates = true;
        continue;
      }

      const start = new Date(exp.exp.startDate);
      const end = exp.exp.isCurrent || !exp.exp.endDate ? new Date() : new Date(exp.exp.endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        hasIncompleteDates = true;
        continue;
      }

      const months = Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
      totalMonths += months;

      evidenceList.push({
        sourceType: "EXPERIENCE",
        sourceId: exp.company || exp.roleTitle,
        label: `${exp.roleTitle} at ${exp.company || "Company"}`,
        excerpt: `${start.toLocaleDateString(undefined, { month: "short", year: "numeric" })} – ${
          exp.exp.isCurrent ? "Present" : end.toLocaleDateString(undefined, { month: "short", year: "numeric" })
        } (~${Math.round(months / 12 * 10) / 10} yrs)`,
      });
    }

    if (evidenceList.length === 0) {
      if (index.experiences.length > 0 && hasIncompleteDates) {
        return {
          requirementId: reqId,
          name: req.name,
          normalizedName: req.normalizedName,
          category: req.category,
          importance: req.importance,
          matchState: "INSUFFICIENT_EVIDENCE",
          evidence: index.experiences.map((exp) => ({
            sourceType: "EXPERIENCE",
            sourceId: exp.company || exp.roleTitle,
            label: `${exp.roleTitle} at ${exp.company || "Company"}`,
            excerpt: "Dates are incomplete or missing in Career Profile.",
          })),
          confidence: 0.7,
          explanation: "Candidate has professional experience records, but dates are incomplete or missing to safely establish duration.",
        };
      }
      return {
        requirementId: reqId,
        name: req.name,
        normalizedName: req.normalizedName,
        category: req.category,
        importance: req.importance,
        matchState: "MISSING",
        evidence: [],
        confidence: 1.0,
        explanation: "No professional experience records found in your Career Profile.",
      };
    }

    if (hasIncompleteDates && totalMonths < requiredYears * 12) {
      return {
        requirementId: reqId,
        name: req.name,
        normalizedName: req.normalizedName,
        category: req.category,
        importance: req.importance,
        matchState: "INSUFFICIENT_EVIDENCE",
        evidence: evidenceList,
        confidence: 0.75,
        explanation: `Experience records have incomplete start/end dates. Verifiable duration is ~${Math.round(
          totalMonths / 12 * 10
        ) / 10} years, which is insufficient to safely confirm ${requiredYears}+ years.`,
      };
    }

    const calculatedYears = Math.round((totalMonths / 12) * 10) / 10;
    if (calculatedYears >= requiredYears) {
      return {
        requirementId: reqId,
        name: req.name,
        normalizedName: req.normalizedName,
        category: req.category,
        importance: req.importance,
        matchState: "PROVEN_RELEVANT",
        evidence: evidenceList,
        confidence: 0.95,
        explanation: `Verifiable professional experience total: ${calculatedYears} years (meets ${requiredYears}+ years requirement).`,
      };
    }

    return {
      requirementId: reqId,
      name: req.name,
      normalizedName: req.normalizedName,
      category: req.category,
      importance: req.importance,
      matchState: "PARTIAL_MATCH",
      evidence: evidenceList,
      confidence: 0.9,
      explanation: `Verifiable experience is ${calculatedYears} years, which is less than the requested ${requiredYears}+ years.`,
    };
  }

  /**
   * Selective guarded semantic evaluation using ModelGateway.
   */
  private static async evaluateSemanticRequirement(
    req: IJobRequirementItem,
    reqId: string,
    index: CandidateFactIndex
  ): Promise<IJobRequirementMatch | null> {
    // Collect authentic candidate facts only
    const candidateFacts = [
      ...index.experiences.map((e) => ({
        id: e.company || e.roleTitle,
        type: "EXPERIENCE",
        title: `${e.roleTitle} at ${e.company}`,
        text: e.bullets.join(" "),
      })),
      ...index.projects.map((p) => ({
        id: p.title,
        type: "PROJECT",
        title: p.title,
        text: `${p.description} Tech: ${p.project.techStack?.join(", ")}`,
      })),
    ];

    if (candidateFacts.length === 0) return null;

    const validSourceIds = new Set(candidateFacts.map((f) => f.id));

    // Controlled test / mock check
    if (process.env.JOB_ANALYSIS_MODE === "mock") {
      const matched = candidateFacts.find((f) =>
        f.text.toLowerCase().includes(req.name.toLowerCase())
      );
      if (matched) {
        return {
          requirementId: reqId,
          name: req.name,
          normalizedName: req.normalizedName,
          category: req.category,
          importance: req.importance,
          matchState: "PROVEN_RELEVANT",
          evidence: [
            {
              sourceType: matched.type as any,
              sourceId: matched.id,
              label: matched.title,
              excerpt: matched.text.slice(0, 150),
            },
          ],
          confidence: 0.9,
          explanation: `Semantic match confirmed from candidate background in ${matched.title}.`,
        };
      }
      return null;
    }

    const SemanticOutputSchema = z.object({
      matchState: z.enum([
        "PROVEN_RELEVANT",
        "PARTIAL_MATCH",
        "RELATED_EVIDENCE",
        "MISSING",
      ]),
      citedSourceIds: z.array(z.string()),
      explanation: z.string(),
      confidence: z.number().min(0).max(1),
    });

    const prompt = `You are SKILLEZO's Career ↔ Job Evidence Matcher.
Task: Determine if the candidate's existing background proves, relates to, or is missing the given job requirement.

CRITICAL RULES:
1. You MUST NEVER invent candidate experience or skills.
2. Every citedSourceId in citedSourceIds MUST be an exact ID from the list below.
3. If no candidate fact establishes the requirement, you MUST output matchState "MISSING" and citedSourceIds [].
4. "RELATED_EVIDENCE" must be used if the candidate has adjacent domain/tech experience that does not directly prove the requirement.

JOB REQUIREMENT:
Name: ${req.name}
Category: ${req.category}
Importance: ${req.importance}

CANDIDATE BACKGROUND FACTS:
${candidateFacts.map((f) => `[ID: ${f.id}] (${f.type}: ${f.title}): ${f.text.slice(0, 300)}`).join("\n\n")}`;

    try {
      const response = await modelGateway.generateStructured<z.infer<typeof SemanticOutputSchema>>(
        { prompt, temperature: 0.1 },
        "Semantic Career Requirement Evaluation",
        SemanticOutputSchema
      );

      // Verify all cited IDs actually exist in candidate facts
      const verifiedEvidence: ICareerEvidenceReference[] = [];
      for (const id of response.data.citedSourceIds) {
        if (validSourceIds.has(id)) {
          const fact = candidateFacts.find((f) => f.id === id)!;
          verifiedEvidence.push({
            sourceType: fact.type as any,
            sourceId: fact.id,
            label: fact.title,
            excerpt: fact.text.slice(0, 160),
          });
        }
      }

      if (response.data.matchState === "MISSING" || verifiedEvidence.length === 0) {
        return null;
      }

      return {
        requirementId: reqId,
        name: req.name,
        normalizedName: req.normalizedName,
        category: req.category,
        importance: req.importance,
        matchState: response.data.matchState as MatchState,
        evidence: verifiedEvidence,
        confidence: response.data.confidence,
        explanation: response.data.explanation,
      };
    } catch {
      return null;
    }
  }

  /**
   * Computes explicit requirement counts for truthful explainability.
   */
  private static computeSummary(matches: IJobRequirementMatch[]): IJobMatchSummary {
    let proven = 0;
    let underrepresented = 0;
    let partial = 0;
    let related = 0;
    let missing = 0;
    let insufficient = 0;
    let needsReview = 0;
    let requiredTotal = 0;
    let requiredProven = 0;

    for (const m of matches) {
      if (m.importance === "REQUIRED") {
        requiredTotal++;
        if (m.matchState === "PROVEN_RELEVANT" || m.matchState === "PROVEN_UNDERREPRESENTED") {
          requiredProven++;
        }
      }

      switch (m.matchState) {
        case "PROVEN_RELEVANT":
          proven++;
          break;
        case "PROVEN_UNDERREPRESENTED":
          underrepresented++;
          break;
        case "PARTIAL_MATCH":
          partial++;
          break;
        case "RELATED_EVIDENCE":
          related++;
          break;
        case "MISSING":
          missing++;
          break;
        case "INSUFFICIENT_EVIDENCE":
          insufficient++;
          break;
        case "NEEDS_REVIEW":
        default:
          needsReview++;
          break;
      }
    }

    return {
      totalRequirements: matches.length,
      proven,
      underrepresented,
      partial,
      related,
      missing,
      insufficient,
      needsReview,
      requiredTotal,
      requiredProven,
    };
  }

  /**
   * Derives overall match score and strength label.
   */
  private static deriveOverallMatch(summary: IJobMatchSummary): { score: number; label: string } | null {
    if (summary.totalRequirements === 0) return null;

    // Weight required items higher than preferred
    // Proven (1.0), Underrepresented (0.95), Partial (0.5), Related (0.3), Missing/Insufficient (0)
    const effectiveSatisfied =
      summary.proven * 1.0 +
      summary.underrepresented * 0.95 +
      summary.partial * 0.5 +
      summary.related * 0.3;

    const score = Math.min(
      100,
      Math.max(0, Math.round((effectiveSatisfied / summary.totalRequirements) * 100))
    );

    let label = "Low Match";
    if (score >= 85) label = "Strong Match";
    else if (score >= 70) label = "Good Match";
    else if (score >= 50) label = "Moderate Match";
    else if (score >= 30) label = "Weak Match";

    return { score, label };
  }

  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
