/**
 * SKILLEZO RESUME STUDIO — PHASE 6D
 * Deterministic Tailored Resume Materialization Engine
 *
 * Implements strict, deterministic proposal execution:
 * 1. Deep clones Master ResumeDocument & BuilderConfig immutably.
 * 2. Applies only approved (ACCEPTED / EDITED) proposals.
 * 3. Enforces that PROMOTE never creates unsupported skills.
 * 4. Preserves user-edited values authoritative without LLM rewrite.
 * 5. Runs factual validation on all updated textual content.
 * 6. Enforces DO_NOT_ADD document-wide exclusion invariant.
 * 7. Enforces Master-vs-Tailored conceptual diff validation.
 * 8. Validates finalized document with ResumeDocumentSchema.
 */

import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ResumeDocument } from "@/modules/resume-intelligence/document/resume-document.types";
import { ResumeBuilderConfig, ReorderableSectionId, CANONICAL_SECTION_ORDER } from "@/modules/resume-intelligence/builder/builder.types";
import { cloneResumeDocument, cloneBuilderConfig } from "@/modules/resume-intelligence/document/resume-document.cloner";
import { ResumeDocumentSchema } from "@/modules/resume-intelligence/document/resume-document.schema";
import { ITailoringPlan, ITailoringProposal } from "@/database/models/TailoringPlan.model";
import {
  CandidateVerificationContext,
  TailoringFactualValidator,
} from "./tailoring-factual.validator";
import { TailoredResumeErrorCode } from "./tailored-resume.types";

export interface MaterializeTailoredResumeResult {
  tailoredDoc: ResumeDocument;
  tailoredConfig: ResumeBuilderConfig;
  appliedProposalsCount: number;
  rejectedProposalsCount: number;
  protectedExclusionsCount: number;
}

export class TailoredResumeGenerator {
  /**
   * Materializes an independent TAILORED ResumeDocument & ResumeBuilderConfig
   * from an approved TailoringPlan and Master source records.
   */
  public static materializeTailoredResume(
    masterDoc: ResumeDocument,
    masterConfig: ResumeBuilderConfig,
    plan: ITailoringPlan,
    candidateContext: CandidateVerificationContext
  ): MaterializeTailoredResumeResult {
    // 1. Immutable Deep Clone
    const tailoredDoc: ResumeDocument = cloneResumeDocument(masterDoc);
    const tailoredConfig: ResumeBuilderConfig = cloneBuilderConfig(masterConfig);

    // 2. Tally and filter proposals
    const pendingProposals = plan.proposals.filter((p) => p.userDecision === "PENDING" && !p.isProtected);
    if (pendingProposals.length > 0) {
      throw new AppError(
        `Tailoring plan has ${pendingProposals.length} pending proposals requiring candidate review.`,
        HTTP_STATUS.BAD_REQUEST,
        TailoredResumeErrorCode.TAILORING_PLAN_INCOMPLETE,
        { pendingCount: pendingProposals.length }
      );
    }

    const approvedProposals = plan.proposals.filter(
      (p) => (p.userDecision === "ACCEPTED" || p.userDecision === "EDITED") && !p.isProtected
    );
    const rejectedProposals = plan.proposals.filter((p) => p.userDecision === "REJECTED" && !p.isProtected);
    const protectedProposals = plan.proposals.filter((p) => p.isProtected || p.action === "DO_NOT_ADD");

    // Track applied changes for diff validation
    const appliedProposalMap = new Map<string, ITailoringProposal>();

    // 3. Deterministic Materialization of Approved Proposals
    for (const proposal of approvedProposals) {
      const effectiveValue =
        proposal.userDecision === "EDITED" && proposal.userEditedValue
          ? proposal.userEditedValue
          : proposal.proposedValue || "";

      switch (proposal.target.section) {
        case "SUMMARY": {
          if (proposal.target.field === "summary.text") {
            // Factual validation
            const factCheck = TailoringFactualValidator.validateProposedText(effectiveValue, candidateContext);
            if (!factCheck.isValid) {
              throw new AppError(
                `Factual validation failed on tailored summary: ${factCheck.unsupportedClaims.join("; ")}`,
                HTTP_STATUS.UNPROCESSABLE_ENTITY,
                TailoredResumeErrorCode.FACTUAL_VALIDATION_FAILED,
                { proposalId: proposal.id, claims: factCheck.unsupportedClaims }
              );
            }
            if (!tailoredDoc.summary) {
              tailoredDoc.summary = { text: "" };
            }
            tailoredDoc.summary.text = effectiveValue;
            appliedProposalMap.set(`SUMMARY:text`, proposal);
          } else {
            throw new AppError(
              `Unsupported summary field target: ${proposal.target.field}`,
              HTTP_STATUS.BAD_REQUEST,
              TailoredResumeErrorCode.UNSUPPORTED_TAILORING_TARGET
            );
          }
          break;
        }

        case "SKILLS": {
          if (proposal.target.field === "skills.list") {
            const skillTarget = (
              proposal.currentValue ||
              proposal.proposedValue ||
              proposal.title
            ).trim().toLowerCase();

            // Find skill in tailored document
            const existingSkillIdx = tailoredDoc.skills.findIndex(
              (s) => s.name.trim().toLowerCase() === skillTarget || skillTarget.includes(s.name.trim().toLowerCase())
            );

            if (proposal.action === "PROMOTE") {
              // INVARIANT: PROMOTE must only reorder an ALREADY-SUPPORTED skill.
              // It must NEVER fabricate or create a skill out of thin air.
              if (existingSkillIdx === -1) {
                // Check if candidate evidence at least contains the skill
                const inVerifiedSkills = Array.from(candidateContext.verifiedSkills).some(
                  (vs) => vs.toLowerCase() === skillTarget
                );
                if (!inVerifiedSkills) {
                  throw new AppError(
                    `Cannot promote skill "${skillTarget}" because it does not exist in master resume or verified evidence.`,
                    HTTP_STATUS.BAD_REQUEST,
                    TailoredResumeErrorCode.INVALID_TAILORING_TARGET,
                    { proposalId: proposal.id, skillTarget }
                  );
                }
                // If in evidence but not in master skills, we still cannot fabricate a new skill entry on promote
                throw new AppError(
                  `Cannot promote skill "${skillTarget}" because it does not exist in master resume skills.`,
                  HTTP_STATUS.BAD_REQUEST,
                  TailoredResumeErrorCode.INVALID_TAILORING_TARGET,
                  { proposalId: proposal.id, skillTarget }
                );
              }

              // Reorder: elevate to index 0
              const [promotedSkill] = tailoredDoc.skills.splice(existingSkillIdx, 1);
              tailoredDoc.skills.unshift(promotedSkill);
              appliedProposalMap.set(`SKILLS:promote:${promotedSkill.name.toLowerCase()}`, proposal);
            } else if (proposal.action === "DE_EMPHASIZE") {
              if (existingSkillIdx !== -1) {
                const [demotedSkill] = tailoredDoc.skills.splice(existingSkillIdx, 1);
                tailoredDoc.skills.push(demotedSkill);
                appliedProposalMap.set(`SKILLS:demote:${demotedSkill.name.toLowerCase()}`, proposal);
              }
            } else if (proposal.action === "REORDER") {
              appliedProposalMap.set(`SKILLS:reorder`, proposal);
            } else {
              throw new AppError(
                `Unsupported skill action: ${proposal.action}`,
                HTTP_STATUS.BAD_REQUEST,
                TailoredResumeErrorCode.UNSUPPORTED_TAILORING_TARGET
              );
            }
          } else {
            throw new AppError(
              `Unsupported skills field target: ${proposal.target.field}`,
              HTTP_STATUS.BAD_REQUEST,
              TailoredResumeErrorCode.UNSUPPORTED_TAILORING_TARGET
            );
          }
          break;
        }

        case "EXPERIENCE": {
          if (proposal.target.field === "experience.bullet") {
            let targetExp = tailoredDoc.experience.find((e) => e.id === proposal.target.entityId);
            if (!targetExp && tailoredDoc.experience.length > 0 && !proposal.target.entityId) {
              targetExp = tailoredDoc.experience[0];
            }
            if (!targetExp) {
              throw new AppError(
                `Source experience entity "${proposal.target.entityId}" not found in master resume.`,
                HTTP_STATUS.CONFLICT,
                TailoredResumeErrorCode.SOURCE_VERSION_CHANGED,
                { proposalId: proposal.id, entityId: proposal.target.entityId }
              );
            }

            // Find bullet
            let targetBullet = targetExp.bullets.find(
              (b) => proposal.target.subEntityId && b.id === proposal.target.subEntityId
            );
            if (!targetBullet && proposal.target.bulletIndex != null && targetExp.bullets[proposal.target.bulletIndex]) {
              targetBullet = targetExp.bullets[proposal.target.bulletIndex];
            }
            if (!targetBullet && targetExp.bullets.length > 0) {
              // Match by currentValue similarity if available
              if (proposal.currentValue) {
                targetBullet = targetExp.bullets.find((b) =>
                  b.text.includes(proposal.currentValue!) || proposal.currentValue!.includes(b.text)
                );
              }
            }

            if (!targetBullet) {
              throw new AppError(
                `Target bullet not found in experience entity "${targetExp.id}".`,
                HTTP_STATUS.CONFLICT,
                TailoredResumeErrorCode.SOURCE_VERSION_CHANGED,
                { proposalId: proposal.id, entityId: targetExp.id, subEntityId: proposal.target.subEntityId }
              );
            }

            // Factual validation
            const factCheck = TailoringFactualValidator.validateProposedText(effectiveValue, candidateContext);
            if (!factCheck.isValid) {
              throw new AppError(
                `Factual validation failed on tailored experience bullet: ${factCheck.unsupportedClaims.join("; ")}`,
                HTTP_STATUS.UNPROCESSABLE_ENTITY,
                TailoredResumeErrorCode.FACTUAL_VALIDATION_FAILED,
                { proposalId: proposal.id, claims: factCheck.unsupportedClaims }
              );
            }

            targetBullet.text = effectiveValue;
            appliedProposalMap.set(`EXP:bullet:${targetBullet.id}`, proposal);
          } else if (proposal.target.field === "experience.selection") {
            if (proposal.action === "EXCLUDE" && proposal.target.entityId) {
              const expIdx = tailoredDoc.experience.findIndex((e) => e.id === proposal.target.entityId);
              if (expIdx !== -1) {
                tailoredDoc.experience.splice(expIdx, 1);
                appliedProposalMap.set(`EXP:exclude:${proposal.target.entityId}`, proposal);
              }
            }
          } else {
            throw new AppError(
              `Unsupported experience field target: ${proposal.target.field}`,
              HTTP_STATUS.BAD_REQUEST,
              TailoredResumeErrorCode.UNSUPPORTED_TAILORING_TARGET
            );
          }
          break;
        }

        case "PROJECTS": {
          if (proposal.target.field === "projects.bullet") {
            const targetProj = tailoredDoc.projects.find((p) => p.id === proposal.target.entityId);
            if (!targetProj) {
              throw new AppError(
                `Source project entity "${proposal.target.entityId}" not found in master resume.`,
                HTTP_STATUS.CONFLICT,
                TailoredResumeErrorCode.SOURCE_VERSION_CHANGED,
                { proposalId: proposal.id, entityId: proposal.target.entityId }
              );
            }

            const bIndex = proposal.target.bulletIndex ?? 0;
            if (targetProj.bullets && targetProj.bullets[bIndex] !== undefined) {
              // Factual validation
              const factCheck = TailoringFactualValidator.validateProposedText(effectiveValue, candidateContext);
              if (!factCheck.isValid) {
                throw new AppError(
                  `Factual validation failed on tailored project bullet: ${factCheck.unsupportedClaims.join("; ")}`,
                  HTTP_STATUS.UNPROCESSABLE_ENTITY,
                  TailoredResumeErrorCode.FACTUAL_VALIDATION_FAILED,
                  { proposalId: proposal.id, claims: factCheck.unsupportedClaims }
                );
              }
              targetProj.bullets[bIndex] = effectiveValue;
              appliedProposalMap.set(`PROJ:bullet:${targetProj.id}:${bIndex}`, proposal);
            }
          } else if (proposal.target.field === "projects.selection") {
            const projIdx = tailoredDoc.projects.findIndex((p) => p.id === proposal.target.entityId);
            if (projIdx !== -1) {
              if (proposal.action === "PROMOTE") {
                const [promotedProj] = tailoredDoc.projects.splice(projIdx, 1);
                tailoredDoc.projects.unshift(promotedProj);
                appliedProposalMap.set(`PROJ:promote:${promotedProj.id}`, proposal);
              } else if (proposal.action === "EXCLUDE") {
                tailoredDoc.projects.splice(projIdx, 1);
                appliedProposalMap.set(`PROJ:exclude:${proposal.target.entityId}`, proposal);
              }
            }
          } else if (proposal.target.field === "projects.techStack") {
            appliedProposalMap.set(`PROJ:techStack:${proposal.target.entityId}`, proposal);
          } else {
            throw new AppError(
              `Unsupported projects field target: ${proposal.target.field}`,
              HTTP_STATUS.BAD_REQUEST,
              TailoredResumeErrorCode.UNSUPPORTED_TAILORING_TARGET
            );
          }
          break;
        }

        case "EDUCATION": {
          if (proposal.target.field === "education.selection" && proposal.action === "EXCLUDE") {
            const eduIdx = tailoredDoc.education.findIndex((e) => e.id === proposal.target.entityId);
            if (eduIdx !== -1) {
              tailoredDoc.education.splice(eduIdx, 1);
              appliedProposalMap.set(`EDU:exclude:${proposal.target.entityId}`, proposal);
            }
          } else {
            throw new AppError(
              `Unsupported education field target: ${proposal.target.field}`,
              HTTP_STATUS.BAD_REQUEST,
              TailoredResumeErrorCode.UNSUPPORTED_TAILORING_TARGET
            );
          }
          break;
        }

        case "SECTION_ORDER": {
          if (proposal.target.field === "layout.sectionOrder") {
            const newOrder = plan.proposedSectionOrder;
            if (Array.isArray(newOrder) && newOrder.length > 0) {
              const validSections = newOrder.filter((s): s is ReorderableSectionId =>
                CANONICAL_SECTION_ORDER.includes(s as ReorderableSectionId)
              );
              if (validSections.length > 0) {
                tailoredConfig.sectionOrder = validSections;
                appliedProposalMap.set(`SECTION_ORDER`, proposal);
              }
            }
          } else {
            throw new AppError(
              `Unsupported section order field target: ${proposal.target.field}`,
              HTTP_STATUS.BAD_REQUEST,
              TailoredResumeErrorCode.UNSUPPORTED_TAILORING_TARGET
            );
          }
          break;
        }

        default:
          throw new AppError(
            `Unsupported tailoring target section: ${proposal.target.section}`,
            HTTP_STATUS.BAD_REQUEST,
            TailoredResumeErrorCode.UNSUPPORTED_TAILORING_TARGET
          );
      }
    }

    // 4. DO_NOT_ADD Document-Wide Exclusion Invariant (Requirement 9)
    // Gather all DO_NOT_ADD protected values and keyword tokens
    const prohibitedTokens: string[] = [];
    for (const p of protectedProposals) {
      const candidates = [p.proposedValue, p.currentValue, p.title].filter(Boolean) as string[];
      for (const c of candidates) {
        // Extract clean token
        const clean = c.replace(/[^\w\s]/g, "").trim().toLowerCase();
        if (clean.length > 1) {
          prohibitedTokens.push(clean);
        }
      }
    }

    if (prohibitedTokens.length > 0) {
      // Assemble full text of tailored document
      const docTextParts: string[] = [
        tailoredDoc.summary?.text || "",
        ...tailoredDoc.skills.map((s) => s.name),
        ...tailoredDoc.experience.flatMap((e) => [
          e.companyName || "",
          e.jobTitle || "",
          ...(e.technologiesUsed || []),
          ...e.bullets.map((b) => b.text),
        ]),
        ...tailoredDoc.projects.flatMap((p) => [
          p.title,
          ...(p.technologies || []),
          ...(p.bullets || []),
        ]),
      ];
      const combinedDocText = docTextParts.join(" ").toLowerCase();

      for (const token of prohibitedTokens) {
        // Use word boundary check
        const regex = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (regex.test(combinedDocText)) {
          throw new AppError(
            `Protected exclusion violated: Prohibited DO_NOT_ADD claim "${token}" was detected in the final tailored resume.`,
            HTTP_STATUS.UNPROCESSABLE_ENTITY,
            TailoredResumeErrorCode.PROTECTED_EXCLUSION_VIOLATION,
            { prohibitedToken: token }
          );
        }
      }
    }

    // 5. Conceptual Master-vs-Tailored Diff Validation (Requirement 10)
    // Assert every meaningful divergence is backed by an approved proposal
    if (masterDoc.summary?.text !== tailoredDoc.summary?.text) {
      if (!appliedProposalMap.has(`SUMMARY:text`)) {
        throw new AppError(
          `Unexplained diff detected: Summary was modified without an approved proposal.`,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          TailoredResumeErrorCode.UNEXPLAINED_DOCUMENT_DIFF
        );
      }
    }

    // Check experience bullet modifications
    for (const tailoredExp of tailoredDoc.experience) {
      const masterExp = masterDoc.experience.find((e) => e.id === tailoredExp.id);
      if (masterExp) {
        for (const tb of tailoredExp.bullets) {
          const mb = masterExp.bullets.find((b) => b.id === tb.id);
          if (mb && mb.text !== tb.text) {
            if (!appliedProposalMap.has(`EXP:bullet:${tb.id}`)) {
              throw new AppError(
                `Unexplained diff detected: Experience bullet "${tb.id}" was modified without an approved proposal.`,
                HTTP_STATUS.UNPROCESSABLE_ENTITY,
                TailoredResumeErrorCode.UNEXPLAINED_DOCUMENT_DIFF
              );
            }
          }
        }
      }
    }

    // 6. Final Schema Validation & Document Metadata
    tailoredDoc.isMaster = false;
    tailoredDoc.updatedAt = new Date().toISOString();

    if (!tailoredDoc.id) tailoredDoc.id = masterDoc.id || `doc_tailored_${Date.now()}`;
    if (!tailoredDoc.userId) tailoredDoc.userId = masterDoc.userId || plan.userId || "user_tailored";
    if (!tailoredDoc.title) tailoredDoc.title = masterDoc.title || `Tailored Resume`;
    if (!tailoredDoc.currentVersion) {
      tailoredDoc.currentVersion = {
        versionId: `ver_1`,
        versionNumber: 1,
        name: "Initial Tailored Version",
        createdAt: new Date().toISOString(),
      };
    } else {
      if (!tailoredDoc.currentVersion.versionId) tailoredDoc.currentVersion.versionId = `ver_tailored_1`;
      if (!tailoredDoc.currentVersion.name) tailoredDoc.currentVersion.name = "Tailored Version";
    }

    const parseResult = ResumeDocumentSchema.safeParse(tailoredDoc);
    if (!parseResult.success) {
      throw new AppError(
        `Final tailored resume failed schema validation: ${parseResult.error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        TailoredResumeErrorCode.TAILORED_RESUME_GENERATION_FAILED,
        { issues: parseResult.error.issues }
      );
    }

    return {
      tailoredDoc,
      tailoredConfig,
      appliedProposalsCount: approvedProposals.length,
      rejectedProposalsCount: rejectedProposals.length,
      protectedExclusionsCount: protectedProposals.length,
    };
  }
}
