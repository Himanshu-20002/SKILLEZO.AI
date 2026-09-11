/**
 * SKILLEZO RESUME STUDIO — PHASE 5 SECTION AI EDITOR
 * Safe Section Mutator with Optimistic Concurrency & Schema Validation
 */

import { SectionId } from "../sections/section.types";
import { ResumeDocument } from "../document/resume-document.types";
import { ResumeDocumentSchema } from "../document/resume-document.schema";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

export class SectionMutator {
  /**
   * Applies candidate-approved section changes to ResumeDocument
   */
  public static applyChange(
    doc: ResumeDocument,
    sectionId: SectionId,
    proposedContent: any,
    baseDocumentVersion: number
  ): ResumeDocument {
    // 1. Verify optimistic locking / version safety
    const currentVer = doc.currentVersion?.versionNumber || (doc as any).version || 1;
    if (baseDocumentVersion && baseDocumentVersion !== currentVer) {
      throw new AppError(
        `Resume section has been modified since this suggestion was generated (current version: ${currentVer}, base version: ${baseDocumentVersion}). Please generate a new suggestion.`,
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.CONFLICT
      );
    }

    // 2. Clone document immutably
    const updatedDoc: ResumeDocument = JSON.parse(JSON.stringify(doc));

    // 3. Apply proposed content to specific section
    (updatedDoc as any)[sectionId] = proposedContent;

    // 4. Update metadata and version
    const newVersionNumber = currentVer + 1;
    (updatedDoc as any).version = newVersionNumber;
    updatedDoc.updatedAt = new Date().toISOString();

    if (updatedDoc.currentVersion) {
      updatedDoc.currentVersion.versionNumber = newVersionNumber;
      updatedDoc.currentVersion.createdAt = new Date().toISOString();
      updatedDoc.currentVersion.changeSummary = `Updated ${sectionId} section with evidence-locked improvements`;
    }

    // 5. Validate complete document against canonical schema
    const validationResult = ResumeDocumentSchema.safeParse(updatedDoc);
    if (!validationResult.success) {
      const errorDetails = validationResult.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ");
      throw new AppError(
        `Applied section changes violate canonical ResumeDocument schema: ${errorDetails}`,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    return validationResult.data as ResumeDocument;
  }
}
