import {
  ITailoringProposal,
  ITailoringPlanSummary,
  TailoringIntensity,
  ITailoringEvidenceRef,
} from "@/database/models/TailoringPlan.model";
import { IJobProfile } from "@/database/models/JobProfile.model";
import { IJobMatchResult, IJobRequirementMatch } from "@/database/models/JobMatchResult.model";
import { ResumeDocument } from "@/modules/resume-intelligence/document/resume-document.types";
import { modelGateway } from "@/core/ai/gateway";
import {
  TailoringFactualValidator,
  CandidateVerificationContext,
} from "./tailoring-factual.validator";

export interface TailoringEngineOptions {
  intensity?: TailoringIntensity;
}

export class TailoringPlanEngine {
  /**
   * Generates a complete, evidence-grounded Tailoring Plan.
   * Deterministic-first architecture: rule-based decisions for skills, projects, and do-not-add;
   * targeted ModelGateway AI exclusively for summary and bullet point wording.
   */
  public static async generatePlan(
    jobProfile: IJobProfile,
    matchResult: IJobMatchResult,
    profileFacts: any,
    masterResumeDoc: ResumeDocument | null,
    options: TailoringEngineOptions = {}
  ): Promise<{
    proposals: ITailoringProposal[];
    summary: ITailoringPlanSummary;
    proposedSectionOrder?: string[];
    currentSectionOrder?: string[];
  }> {
    const intensity = options.intensity || "BALANCED";
    const verificationContext = TailoringFactualValidator.buildVerificationContext(
      profileFacts,
      masterResumeDoc
    );

    const proposals: ITailoringProposal[] = [];

    // 1. Evaluate Skills Proposals (Deterministic)
    const skillProposals = this.evaluateSkillsProposals(
      jobProfile,
      matchResult,
      masterResumeDoc,
      intensity
    );
    proposals.push(...skillProposals);

    // 2. Evaluate Projects Proposals (Deterministic)
    const projectProposals = this.evaluateProjectsProposals(
      jobProfile,
      matchResult,
      masterResumeDoc,
      intensity
    );
    proposals.push(...projectProposals);

    // 3. Evaluate Summary Proposal (Targeted AI with Factual Validation)
    const summaryProposal = await this.evaluateSummaryProposal(
      jobProfile,
      matchResult,
      masterResumeDoc,
      verificationContext
    );
    if (summaryProposal) {
      proposals.push(summaryProposal);
    }

    // 4. Evaluate Experience Bullet Refinement (Targeted AI with Factual Validation)
    if (intensity !== "LIGHT") {
      const experienceProposals = await this.evaluateExperienceBulletProposals(
        jobProfile,
        matchResult,
        masterResumeDoc,
        verificationContext,
        intensity
      );
      proposals.push(...experienceProposals);
    }

    // 5. Evaluate Section Order (Deterministic)
    const currentSectionOrder = (masterResumeDoc as any)?.metadata?.sectionOrder || [
      "contact",
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
    ];
    let proposedSectionOrder: string[] | undefined = undefined;

    if (intensity === "AGGRESSIVE" && projectProposals.length > 0) {
      // Propose moving projects before experience if high relevant project evidence exists
      proposedSectionOrder = [
        "contact",
        "summary",
        "skills",
        "projects",
        "experience",
        "education",
      ];
      proposals.push({
        id: "prop_layout_section_order",
        action: "REORDER",
        target: {
          section: "SECTION_ORDER",
          field: "layout.sectionOrder",
        },
        title: "Reorder Sections: Elevate Featured Projects",
        currentValue: currentSectionOrder.join(" → "),
        proposedValue: proposedSectionOrder.join(" → "),
        reason:
          "Target role demands verified project demonstration. Positioning Projects above Work Experience immediately showcases proven architectural capabilities.",
        requirementIds: [],
        evidence: [],
        confidence: 0.9,
        priority: "MEDIUM",
        userDecision: "PENDING",
        groupKey: "SECTION_ORDER",
        isProtected: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Compute plan summary metrics
    const summary = this.computeSummary(proposals);

    return {
      proposals,
      summary,
      proposedSectionOrder,
      currentSectionOrder,
    };
  }

  /**
   * Helper to retrieve requirement name safely across schema variations.
   */
  private static getReqName(req: IJobRequirementMatch): string {
    return req.name || (req as any).requirementName || "";
  }

  /**
   * Helper to normalize evidence references.
   */
  private static getReqEvidence(req: IJobRequirementMatch): ITailoringEvidenceRef[] {
    const raw = req.evidence || (req as any).evidenceReferences || [];
    return raw.map((e: any) => ({
      sourceType: e.sourceType,
      sourceId: e.sourceId,
      label: e.label,
      excerpt: e.excerpt || null,
    }));
  }

  /**
   * Deterministic Skills evaluation:
   * Handles PROVEN_UNDERREPRESENTED, PROVEN_RELEVANT, RELATED_EVIDENCE, and MISSING (DO_NOT_ADD).
   */
  private static evaluateSkillsProposals(
    jobProfile: IJobProfile,
    matchResult: IJobMatchResult,
    masterResumeDoc: ResumeDocument | null,
    intensity: TailoringIntensity
  ): ITailoringProposal[] {
    const proposals: ITailoringProposal[] = [];
    const resumeSkillsLower = new Set(
      (masterResumeDoc?.skills || []).map((s) => s.name.toLowerCase().trim())
    );

    const underrepresentedSkills: Array<{ name: string; reqId: string; evidence: ITailoringEvidenceRef[] }> = [];
    const keepSkills: Array<{ name: string; reqId: string }> = [];
    const doNotAddSkills: Array<{ name: string; reqId: string; reason: string }> = [];

    for (const reqMatch of matchResult.requirementMatches) {
      const reqName = this.getReqName(reqMatch);
      const cleanReq = reqName.toLowerCase().trim();
      const evidenceRefs: ITailoringEvidenceRef[] = this.getReqEvidence(reqMatch);

      if (reqMatch.matchState === "PROVEN_UNDERREPRESENTED") {
        // Check if canonical resume already naturally features it in skills or experience bullets
        const naturallyInResume =
          resumeSkillsLower.has(cleanReq) ||
          (masterResumeDoc?.experience || []).some((e) =>
            (e.bullets || []).some((b) => (b.text || "").toLowerCase().includes(cleanReq))
          );

        if (!naturallyInResume) {
          underrepresentedSkills.push({ name: reqName, reqId: reqMatch.requirementId, evidence: evidenceRefs });
        } else {
          keepSkills.push({ name: reqName, reqId: reqMatch.requirementId });
        }
      } else if (reqMatch.matchState === "PROVEN_RELEVANT") {
        keepSkills.push({ name: reqName, reqId: reqMatch.requirementId });
      } else if (reqMatch.matchState === "MISSING") {
        doNotAddSkills.push({
          name: reqName,
          reqId: reqMatch.requirementId,
          reason: "No verified evidence found in your Career Profile. SKILLEZO will not add this claim.",
        });
      } else if (reqMatch.matchState === "RELATED_EVIDENCE") {
        doNotAddSkills.push({
          name: reqName,
          reqId: reqMatch.requirementId,
          reason: `Related evidence exists in profile, but adjacent experience does not prove hands-on proficiency in ${reqName}. SKILLEZO will not add this claim.`,
        });
      }
    }

    // 1. Grouped Promote Proposal for Underrepresented Skills
    if (underrepresentedSkills.length > 0) {
      const names = underrepresentedSkills.map((s) => s.name);
      const reqIds = underrepresentedSkills.map((s) => s.reqId);
      const allEvidence = underrepresentedSkills.flatMap((s) => s.evidence);

      proposals.push({
        id: "prop_skills_promote_group",
        action: "PROMOTE",
        target: {
          section: "SKILLS",
          field: "skills.list",
        },
        title: `Promote Underrepresented Skills: ${names.join(", ")}`,
        currentValue: "Not prominently listed in Master Resume technical skills.",
        proposedValue: `Add to Technical Skills section: ${names.join(", ")}`,
        reason: `These skills are verified in your Career Profile and required for ${jobProfile.jobTitle}, but are currently missing from your Master Resume skills section.`,
        requirementIds: reqIds,
        evidence: allEvidence,
        confidence: 0.95,
        priority: "HIGH",
        userDecision: "PENDING",
        groupKey: "SKILLS_PROMOTIONS",
        isProtected: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 2. DO_NOT_ADD Advisory Shields (Protected: cannot be bypassed or ungrounded)
    for (let i = 0; i < doNotAddSkills.length; i++) {
      const item = doNotAddSkills[i];
      proposals.push({
        id: `prop_skills_do_not_add_${i + 1}`,
        action: "DO_NOT_ADD",
        target: {
          section: "SKILLS",
          field: "skills.list",
        },
        title: `Protected Exclusion: Do Not Add "${item.name}"`,
        currentValue: null,
        proposedValue: null,
        reason: item.reason,
        requirementIds: [item.reqId],
        evidence: [],
        confidence: 1.0,
        priority: "HIGH",
        userDecision: "ACCEPTED", // System-protected
        groupKey: "SKILLS_DO_NOT_ADD",
        isProtected: true, // Advisory shield: zero user action required
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 3. De-emphasize Off-Target Skills (in Balanced or Aggressive)
    if (intensity === "AGGRESSIVE" && masterResumeDoc?.skills) {
      const reqItems = jobProfile.analysis?.requirements || (jobProfile as any).requirements || [];
      const jdKeywords = new Set([
        ...reqItems.map((r: any) => (r.name || "").toLowerCase()),
        ...(jobProfile.analysis?.keywords || []).map((k) => k.toLowerCase()),
      ]);

      const offTargetSkills = masterResumeDoc.skills
        .map((s) => s.name)
        .filter((name) => !jdKeywords.has(name.toLowerCase()));

      if (offTargetSkills.length > 2) {
        const topOffTarget = offTargetSkills.slice(0, 3);
        proposals.push({
          id: "prop_skills_de_emphasize",
          action: "DE_EMPHASIZE",
          target: {
            section: "SKILLS",
            field: "skills.list",
          },
          title: `De-emphasize Less Relevant Skills: ${topOffTarget.join(", ")}`,
          currentValue: `Displayed prominently in skills section.`,
          proposedValue: `Move ${topOffTarget.join(", ")} to secondary section or omit for this role.`,
          reason: `These skills are not requested in the job description for ${jobProfile.jobTitle}. De-emphasizing them keeps the resume focused on core qualifications.`,
          requirementIds: [],
          evidence: [],
          confidence: 0.8,
          priority: "LOW",
          userDecision: "PENDING",
          groupKey: "SKILLS_DE_EMPHASIZE",
          isProtected: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return proposals;
  }

  /**
   * Deterministic Project selection & promotion evaluation.
   */
  private static evaluateProjectsProposals(
    jobProfile: IJobProfile,
    matchResult: IJobMatchResult,
    masterResumeDoc: ResumeDocument | null,
    intensity: TailoringIntensity
  ): ITailoringProposal[] {
    const proposals: ITailoringProposal[] = [];
    const projects = masterResumeDoc?.projects || [];
    if (projects.length === 0) return proposals;

    const provenReqs = new Set(
      matchResult.requirementMatches
        .filter((r) => r.matchState === "PROVEN_RELEVANT" || r.matchState === "PROVEN_UNDERREPRESENTED")
        .map((r) => this.getReqName(r).toLowerCase())
    );

    // Score projects by number of matching verified technologies
    const scoredProjects = projects.map((p) => {
      const pTechs = (p.technologies || []).map((t) => t.toLowerCase());
      const matches = pTechs.filter((t) => provenReqs.has(t));
      return { project: p, matches, matchCount: matches.length };
    });

    scoredProjects.sort((a, b) => b.matchCount - a.matchCount);
    const topProject = scoredProjects[0];

    if (topProject && topProject.matchCount > 0) {
      proposals.push({
        id: `prop_project_promote_${topProject.project.id}`,
        action: "PROMOTE",
        target: {
          section: "PROJECTS",
          field: "projects.selection",
          entityId: topProject.project.id,
        },
        title: `Promote Featured Project: "${topProject.project.title}"`,
        currentValue: `Project #${projects.findIndex((p) => p.id === topProject.project.id) + 1} in Master Resume`,
        proposedValue: `Position "${topProject.project.title}" as primary featured project`,
        reason: `Demonstrates verified hands-on proficiency with target requirements: ${topProject.matches.join(", ")}.`,
        requirementIds: matchResult.requirementMatches
          .filter((r) => topProject.matches.includes(this.getReqName(r).toLowerCase()))
          .map((r) => r.requirementId),
        evidence: [
          {
            sourceType: "PROJECT",
            sourceId: topProject.project.id,
            label: topProject.project.title,
            excerpt: topProject.project.description || topProject.project.bullets?.[0] || null,
          },
        ],
        confidence: 0.95,
        priority: "HIGH",
        userDecision: "PENDING",
        groupKey: "PROJECTS_ELEVATION",
        isProtected: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return proposals;
  }

  /**
   * Evaluates and synthesizes a grounded professional summary proposal using ModelGateway AI.
   * Strictly fact-checked by TailoringFactualValidator.
   */
  private static async evaluateSummaryProposal(
    jobProfile: IJobProfile,
    matchResult: IJobMatchResult,
    masterResumeDoc: ResumeDocument | null,
    context: CandidateVerificationContext
  ): Promise<ITailoringProposal | null> {
    const currentSummary = masterResumeDoc?.summary?.text || "";

    const provenSkills = matchResult.requirementMatches
      .filter((r) => r.matchState === "PROVEN_RELEVANT" || r.matchState === "PROVEN_UNDERREPRESENTED")
      .map((r) => this.getReqName(r));

    if (provenSkills.length === 0) return null;

    const topSkills = provenSkills.slice(0, 4);

    // Default grounded synthesis template
    const defaultProposed = currentSummary
      ? `${jobProfile.jobTitle} with proven expertise in ${topSkills.join(", ")}. Demonstrates structured track record delivering scalable solutions aligned with role specifications.`
      : `Experienced software professional specializing in ${topSkills.join(", ")} with a background in building high-reliability systems and applications.`;

    let proposedSummary = defaultProposed;

    // Call ModelGateway if available
    try {
      const prompt = `You are a strict, evidence-grounded Resume Tailoring Engine.
Generate an authentic, grounded 2-3 sentence Professional Summary tailored for the role "${jobProfile.jobTitle}".

CANDIDATE FACTS (VERIFIED ONLY - DO NOT INVENT ANYTHING):
- Current Summary: "${currentSummary}"
- Verified Matching Skills: ${topSkills.join(", ")}
- Verified Duration: ~${context.maxVerifiedYears} years

CRITICAL INVARIANTS:
1. ONLY mention skills from: [${topSkills.join(", ")}].
2. DO NOT claim unverified years, companies, metrics, scale, or leadership titles.
3. Keep tone professional, impactful, and concise.

Respond with ONLY the proposed summary text.`;

      const response = await modelGateway.generateText({
        prompt,
        temperature: 0.2,
        maxOutputTokens: 250,
      });

      if (response?.text && response.text.trim().length > 30) {
        const cleaned = response.text.trim().replace(/^["']|["']$/g, "");
        // Run factual validation
        const valResult = TailoringFactualValidator.validateProposedText(cleaned, context);
        if (valResult.isValid) {
          proposedSummary = cleaned;
        }
      }
    } catch {
      // Graceful fallback to deterministic template
      proposedSummary = defaultProposed;
    }

    return {
      id: "prop_summary_targeted_rewrite",
      action: "REWRITE",
      target: {
        section: "SUMMARY",
        field: "summary.text",
      },
      title: "Tailor Professional Summary for Target Role",
      currentValue: currentSummary || "(No professional summary in Master Resume)",
      proposedValue: proposedSummary,
      reason: `Aligns candidate summary with target role (${jobProfile.jobTitle}) while emphasizing verified matching capabilities: ${topSkills.join(", ")}.`,
      requirementIds: matchResult.requirementMatches
        .filter((r) => topSkills.includes(this.getReqName(r)))
        .map((r) => r.requirementId),
      evidence: [
        {
          sourceType: "SKILL",
          sourceId: "verified_skills_summary",
          label: topSkills.join(", "),
          excerpt: `Verified skills: ${topSkills.join(", ")}`,
        },
      ],
      confidence: 0.9,
      priority: "HIGH",
      userDecision: "PENDING",
      groupKey: "SUMMARY",
      isProtected: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Evaluates experience bullets for targeted refinement using ModelGateway AI.
   * Strictly fact-checked by TailoringFactualValidator.
   */
  private static async evaluateExperienceBulletProposals(
    jobProfile: IJobProfile,
    matchResult: IJobMatchResult,
    masterResumeDoc: ResumeDocument | null,
    context: CandidateVerificationContext,
    intensity: TailoringIntensity
  ): Promise<ITailoringProposal[]> {
    const proposals: ITailoringProposal[] = [];
    const experience = masterResumeDoc?.experience || [];
    if (experience.length === 0) return proposals;

    const provenSkills = matchResult.requirementMatches
      .filter((r) => r.matchState === "PROVEN_RELEVANT" || r.matchState === "PROVEN_UNDERREPRESENTED")
      .map((r) => this.getReqName(r).toLowerCase());

    for (const exp of experience) {
      for (let bIdx = 0; bIdx < (exp.bullets || []).length; bIdx++) {
        const bullet = exp.bullets[bIdx];
        const bulletLower = bullet.text.toLowerCase();

        // Find matching proven skill in bullet
        const matchedSkill = provenSkills.find((s) => bulletLower.includes(s));
        if (matchedSkill && proposals.length < (intensity === "AGGRESSIVE" ? 3 : 1)) {
          const originalText = bullet.text;

          let proposedBullet = originalText;
          try {
            const prompt = `Refine this resume bullet point to elevate relevance for "${jobProfile.jobTitle}", while STRICTLY preserving all metrics, technologies, and facts.
Original: "${originalText}"
Verified Skill to highlight: "${matchedSkill}"

INVARIANTS:
1. Do not invent metrics or technologies.
2. Preserve all factual claims.
3. Start with a strong action verb.

Return ONLY the refined bullet string.`;

            const res = await modelGateway.generateText({
              prompt,
              temperature: 0.2,
              maxOutputTokens: 150,
            });

            if (res?.text && res.text.trim().length > 20) {
              const cleaned = res.text.trim().replace(/^["'-]|["']$/g, "").trim();
              const val = TailoringFactualValidator.validateProposedText(cleaned, context);
              if (val.isValid) {
                proposedBullet = cleaned;
              }
            }
          } catch {
            proposedBullet = originalText;
          }

          if (proposedBullet !== originalText) {
            proposals.push({
              id: `prop_exp_bullet_${exp.id}_${bIdx}`,
              action: "REWRITE",
              target: {
                section: "EXPERIENCE",
                field: "experience.bullet",
                entityId: exp.id,
                subEntityId: bullet.id,
                bulletIndex: bIdx,
              },
              title: `Sharpen Work Experience Bullet (${exp.companyName || "Experience"})`,
              currentValue: originalText,
              proposedValue: proposedBullet,
              reason: `Highlights proven ${matchedSkill} experience directly aligned with target role qualifications.`,
              requirementIds: matchResult.requirementMatches
                .filter((r) => this.getReqName(r).toLowerCase() === matchedSkill)
                .map((r) => r.requirementId),
              evidence: [
                {
                  sourceType: "EXPERIENCE",
                  sourceId: exp.id,
                  label: exp.companyName || "Work Experience",
                  excerpt: originalText,
                },
              ],
              confidence: 0.88,
              priority: "MEDIUM",
              userDecision: "PENDING",
              groupKey: "EXPERIENCE_BULLETS",
              isProtected: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      }
    }

    return proposals;
  }

  /**
   * Helper to compute summary counts across proposals.
   */
  public static computeSummary(proposals: ITailoringProposal[]): ITailoringPlanSummary {
    let pending = 0;
    let accepted = 0;
    let edited = 0;
    let rejected = 0;
    let doNotAdd = 0;
    let actionableTotal = 0;

    for (const p of proposals) {
      if (p.isProtected || p.action === "DO_NOT_ADD") {
        doNotAdd++;
      } else {
        actionableTotal++;
        if (p.userDecision === "ACCEPTED") accepted++;
        else if (p.userDecision === "EDITED") edited++;
        else if (p.userDecision === "REJECTED") rejected++;
        else pending++;
      }
    }

    return {
      totalProposals: proposals.length,
      actionableTotal,
      pending,
      accepted,
      edited,
      rejected,
      doNotAdd,
    };
  }
}
