/**
 * SKILLEZO RESUME STUDIO — PHASE 5 SECTION AI EDITOR
 * Client Type Definitions for Section AI Editor and Improvement Proposals
 */

import { SectionId } from "./resume-section.types";
import { ResumeDocument } from "./resume-document";

export interface SectionChangeItem {
  field: string;
  before: string;
  after: string;
  reason: string;
}

export interface SectionImprovementSuggestion<TProposed = any> {
  suggestionId: string;
  sectionId: SectionId;
  original: any;
  proposed: TProposed;
  changes: SectionChangeItem[];
  evidenceUsed: string[];
  unsupportedClaims: string[];
  warnings: string[];
  generatedAt: string;
  baseDocumentVersion: number;
}

export interface ImprovementRequestPayload {
  userInstruction?: string;
}

export interface ApplyImprovementPayload {
  suggestionId: string;
  proposed: any;
  baseDocumentVersion: number;
}

export interface ApplyImprovementResult {
  resumeDocument: ResumeDocument;
  sectionId: SectionId;
  previousScore: number;
  newScore: number;
  scoreDelta: number;
  newDocumentVersion: number;
  updatedAt: string;
}
