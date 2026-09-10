import {
  ResumeOptimizationDraft,
  OptimizationTarget,
  OptimizationValidationResult,
  ResumeScoreSnapshot,
  OptimizationHistoryEntry,
  TargetOption,
} from "./optimization.types";
import { OptimizationTargetResolver } from "./optimization.target";
import { OptimizationValidator } from "./optimization.validator";
import { OptimizationRescorer } from "./optimization.rescore";
import { OptimizationPromptBuilder } from "./optimization.prompt";
import { OptimizationDiff, WordDiff } from "./optimization.diff";
import { OPTIMIZATION_ENGINE_VERSION } from "./optimization.constants";

export interface ProposeOptimizationInput {
  resumeId: string;
  baseResumeVersionId?: string;
  recommendation: any;
  extractedData: any;
  rawText?: string;
  beforeScores: ResumeScoreSnapshot;
  verifiedSkills?: string[];
  targetRole?: string;
  roleBenchmark?: any;
  jobProfile?: any;
  contentResult?: any;
  targetBulletId?: string;
  aiProvider?: {
    generateCompletion: (systemPrompt: string, userPrompt: string) => Promise<string>;
  };
}

export class OptimizationIntelligenceService {
  /**
   * Generates a controlled, evidence-safe optimization draft for a given Phase 6 recommendation.
   */
  public async proposeOptimization(input: ProposeOptimizationInput): Promise<ResumeOptimizationDraft> {
    const draftId = `draft_${crypto.randomUUID()}`;
    const baseResumeVersionId = input.baseResumeVersionId || "v1_original";
    const verifiedSkills = input.verifiedSkills || (input.extractedData?.skills || []).map((s: any) =>
      typeof s === "string" ? s : s.name
    );

    // 1. Resolve Recommendation into constrained Target
    const target = OptimizationTargetResolver.resolveTarget(
      input.recommendation,
      input.extractedData,
      input.contentResult,
      (input as any).targetBulletId
    );

    // Collect all available targets across Experience, Projects, and Summary
    const availableTargets: TargetOption[] = [];
    if (input.contentResult?.bullets && input.contentResult.bullets.length > 0) {
      input.contentResult.bullets.forEach((b: any) => {
        availableTargets.push({
          bulletId: b.bulletId,
          section: b.section,
          roleOrProject: b.roleTitle || b.companyName || (b.section === "PROJECTS" ? "Project" : b.section === "SUMMARY" ? "Summary" : "Experience"),
          sourceText: b.sourceText,
        });
      });
    } else {
      (input.extractedData?.projects || []).forEach((proj: any, pIdx: number) => {
        const lines = (proj.description || "").split(/\r?\n/).filter((b: string) => b.trim().length > 0);
        if (lines.length === 0) {
          availableTargets.push({
            bulletId: `proj_${pIdx}_bullet_0`,
            section: "PROJECTS",
            roleOrProject: proj.title || "Project",
            sourceText: proj.title,
          });
        } else {
          lines.forEach((l: string, bIdx: number) => {
            availableTargets.push({
              bulletId: `proj_${pIdx}_bullet_${bIdx}`,
              section: "PROJECTS",
              roleOrProject: proj.title || "Project",
              sourceText: l.replace(/^[•*–—\-\d.]+\s*/, "").trim(),
            });
          });
        }
      });
      (input.extractedData?.experience || []).forEach((exp: any, expIdx: number) => {
        const lines = (exp.description || "").split(/\r?\n/).filter((b: string) => b.trim().length > 0);
        lines.forEach((l: string, bIdx: number) => {
          availableTargets.push({
            bulletId: `exp_${expIdx}_bullet_${bIdx}`,
            section: "EXPERIENCE",
            roleOrProject: exp.jobTitle || exp.companyName || "Experience",
            sourceText: l.replace(/^[•*–—\-\d.]+\s*/, "").trim(),
          });
        });
      });
      if (input.extractedData?.summary) {
        availableTargets.push({
          bulletId: "summary_0",
          section: "SUMMARY",
          roleOrProject: "Professional Summary",
          sourceText: input.extractedData.summary,
        });
      }
    }

    // If target cannot be safely rewritten (e.g. missing skills or missing evidence)
    if (!target.isRewritable || !target.sourceText) {
      const validation: OptimizationValidationResult = {
        valid: false,
        safetyLevel: "BLOCKED",
        safetyScore: 0,
        errors: [
          {
            code: "NON_REWRITABLE_TARGET",
            message: target.nonRewritableReason || "Target cannot be automatically rewritten without additional evidence.",
          },
        ],
        warnings: [],
        preservedEvidenceIds: [],
        unsupportedClaims: [],
        changedMetrics: [],
        addedSkills: [],
        changedOwnershipClaims: [],
        meaningPreserved: false,
      };

      return {
        draftId,
        resumeId: input.resumeId,
        baseResumeVersionId,
        recommendationId: target.recommendationId,
        target,
        availableTargets,
        originalText: target.sourceText || "",
        proposedText: "",
        validation,
        beforeScores: input.beforeScores,
        status: "REJECTED",
        createdAt: new Date().toISOString(),
      };
    }

    // 2. Propose Rewritten Text (via AI or deterministic action-verb enhancement fallback)
    let proposedText = "";
    if (input.aiProvider) {
      try {
        const systemPrompt = OptimizationPromptBuilder.buildSystemPrompt();
        const userPrompt = OptimizationPromptBuilder.buildUserPrompt({
          originalText: target.sourceText,
          recommendation: input.recommendation,
          relevantSkills: target.skillIds?.length ? target.skillIds : verifiedSkills.slice(0, 5),
          targetRole: input.targetRole,
        });

        const rawAi = await input.aiProvider.generateCompletion(systemPrompt, userPrompt);
        const parsedAi = typeof rawAi === "string" ? JSON.parse(rawAi) : rawAi;
        proposedText = (parsedAi.optimizedText || parsedAi.rewrittenText || parsedAi.rewritten || "").trim();
      } catch (err) {
        console.warn("[OptimizationService] AI completion failed, falling back to deterministic:", err);
        proposedText = this.generateDeterministicFallback(target.sourceText);
      }
    } else {
      proposedText = this.generateDeterministicFallback(target.sourceText);
    }

    // 3. Factual Safety Validation
    const validation = OptimizationValidator.validateProposal(
      target.sourceText,
      proposedText,
      verifiedSkills,
      input.rawText || ""
    );

    // 4. Deterministic Re-score if valid
    let afterScores: ResumeScoreSnapshot | undefined;
    let scoreComparison: any;
    let decision: any = "REJECTED";

    if (validation.valid) {
      const rescoreResult = OptimizationRescorer.rescoreDraft(
        input.extractedData,
        target,
        proposedText,
        input.beforeScores,
        input.targetRole,
        input.roleBenchmark,
        input.jobProfile
      );

      afterScores = rescoreResult.afterScores;
      scoreComparison = rescoreResult.comparison;
      decision = rescoreResult.decision;
    }

    return {
      draftId,
      resumeId: input.resumeId,
      baseResumeVersionId,
      recommendationId: target.recommendationId,
      target,
      availableTargets,
      originalText: target.sourceText,
      proposedText,
      validation,
      beforeScores: input.beforeScores,
      afterScores,
      scoreComparison,
      decision,
      status: validation.valid ? "VALIDATED" : "REJECTED",
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Accepts a validated optimization draft, producing a new immutable resume version.
   */
  public acceptDraft(
    draft: ResumeOptimizationDraft,
    extractedData: any
  ): {
    newVersionId: string;
    updatedExtractedData: any;
    historyEntry: OptimizationHistoryEntry;
  } {
    if (!draft.validation.valid) {
      throw new Error("Cannot accept an invalid or unsafe optimization draft.");
    }

    const newVersionId = `v_${Date.now()}`;
    const updatedData = JSON.parse(JSON.stringify(extractedData || {}));

    if (draft.target.section === "EXPERIENCE" && updatedData.experience?.length > 0) {
      if (draft.target.bulletId) {
        const parts = draft.target.bulletId.split("_");
        const expIdx = parseInt(parts[1], 10) || 0;
        const bulletIdx = parseInt(parts[3], 10) || 0;

        if (updatedData.experience[expIdx]) {
          const lines = (updatedData.experience[expIdx].description || "")
            .split(/\r?\n/)
            .filter((b: string) => b.trim().length > 0);
          if (lines[bulletIdx] !== undefined) {
            lines[bulletIdx] = draft.proposedText;
            updatedData.experience[expIdx].description = lines.join("\n");
          }
        }
      } else {
        updatedData.experience[0].description = `${draft.proposedText}\n${updatedData.experience[0].description || ""}`;
      }
    } else if (draft.target.section === "PROJECTS" && updatedData.projects?.length > 0) {
      if (draft.target.bulletId) {
        const parts = draft.target.bulletId.split("_");
        const pIdx = parseInt(parts[1], 10) || 0;
        const bulletIdx = parseInt(parts[3], 10) || 0;

        if (updatedData.projects[pIdx]) {
          const lines = (updatedData.projects[pIdx].description || "")
            .split(/\r?\n/)
            .filter((b: string) => b.trim().length > 0);
          if (lines[bulletIdx] !== undefined) {
            lines[bulletIdx] = draft.proposedText;
            updatedData.projects[pIdx].description = lines.join("\n");
          } else if (lines.length > 0) {
            lines[0] = draft.proposedText;
            updatedData.projects[pIdx].description = lines.join("\n");
          } else {
            updatedData.projects[pIdx].description = draft.proposedText;
          }
        }
      } else {
        updatedData.projects[0].description = `${draft.proposedText}\n${updatedData.projects[0].description || ""}`;
      }
    } else if (draft.target.section === "SUMMARY") {
      updatedData.summary = draft.proposedText;
    }

    const historyEntry: OptimizationHistoryEntry = {
      optimizationId: draft.draftId,
      resumeId: draft.resumeId,
      recommendationId: draft.recommendationId,
      originalVersionId: draft.baseResumeVersionId,
      resultingVersionId: newVersionId,
      decision: draft.decision || "ACCEPTABLE",
      scoreComparison: draft.scoreComparison || {
        before: draft.beforeScores,
        after: draft.afterScores || draft.beforeScores,
        delta: { ats: 0, match: 0, content: 0 },
        improved: true,
        regressed: false,
      },
      createdAt: new Date().toISOString(),
    };

    return {
      newVersionId,
      updatedExtractedData: updatedData,
      historyEntry,
    };
  }

  /**
   * Rejects an optimization draft, leaving original resume content 100% pristine.
   */
  public rejectDraft(draft: ResumeOptimizationDraft): ResumeOptimizationDraft {
    return {
      ...draft,
      status: "REJECTED",
    };
  }

  /**
   * Computes a structured word-level diff between original and proposed text.
   */
  public computeDiff(originalText: string, proposedText: string): WordDiff[] {
    return OptimizationDiff.computeDiff(originalText, proposedText);
  }

  private generateDeterministicFallback(originalText: string): string {
    const cleaned = originalText.replace(/^[•*–—\-\d.]+\s*/, "").trim();
    if (!cleaned) return originalText;

    // Enhance starting verb if passive
    let enhanced = cleaned;
    if (/^worked on\s+/i.test(enhanced)) {
      enhanced = enhanced.replace(/^worked on\s+/i, "Developed ");
    } else if (/^responsible for\s+/i.test(enhanced)) {
      enhanced = enhanced.replace(/^responsible for\s+/i, "Implemented ");
    } else if (/^helped\s+/i.test(enhanced)) {
      enhanced = enhanced.replace(/^helped\s+/i, "Contributed to ");
    }

    return enhanced;
  }
}

export const optimizationIntelligenceService = new OptimizationIntelligenceService();
