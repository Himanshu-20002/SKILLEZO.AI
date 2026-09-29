import { ITailoringEvidenceRef } from '@/types/tailoring-plan.types';

export type ResumeChangeType =
  | 'PROMOTED'        // Item elevated in rank or moved to index 0 via approved 6C proposal
  | 'DE_EMPHASIZED'    // Item lowered in rank via approved 6C proposal
  | 'REWRITTEN'       // Text/bullet rewritten via approved 6C proposal
  | 'REORDERED'       // Section or items reordered without explicit promote proposal
  | 'SELECTED'        // Specific item chosen for target relevance
  | 'EXCLUDED'        // Specific item excluded for brevity/fit via approved proposal
  | 'EDITED'          // User-edited variant of a 6C proposal (6C proposal decision = EDITED)
  | 'USER_EDIT'       // Manual edit confirmed post-generation by verified provenance
  | 'ADDED'           // Structural fact: Item present in Tailored but absent in Master
  | 'REMOVED'         // Structural fact: Item present in Master but absent in Tailored
  | 'CHANGED';        // General text or field modification without proposal/provenance

export type ResumeDiffSection =
  | 'summary'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'education'
  | 'layout';

export type DiffChangeSource =
  | 'TAILORING_PLAN'  // Traceable to an approved 6C proposal
  | 'USER_EDIT'       // Confirmed candidate manual edit post-generation
  | 'GENERATION'      // Confirmed materialization difference from verified 6D provenance
  | 'UNATTRIBUTED';   // Difference exists, proposal link unconfirmed / no provenance

/**
 * Safe, discriminated diff value representation without 'any'
 */
export type ResumeDiffScalar = string | number | boolean | null | undefined;

export type ResumeDiffValue =
  | ResumeDiffScalar
  | readonly string[]
  | readonly ResumeDiffScalar[]
  | Readonly<{
      text?: string;
      title?: string;
      companyName?: string;
      jobTitle?: string;
      institution?: string;
      degree?: string;
      name?: string;
      category?: string;
      technologies?: readonly string[];
      bullets?: readonly string[];
      sectionOrder?: readonly string[];
    }>;

export interface ResumeDiffItem {
  id: string;                         // Collision-safe deterministic composite ID
  section: ResumeDiffSection;
  changeType: ResumeChangeType;
  title: string;                      // Human-readable title (e.g. "Work Experience · Acme Corp · Bullet 1")
  field?: string;                     // AST field (e.g. "summary.text", "bullets[0].text")
  entityId?: string;                  // Target entity ID (e.g. experienceId, projectId)
  subEntityId?: string;               // Target sub-entity ID (e.g. bulletId)

  // Strongly typed Master and Tailored values (NO 'any')
  masterValue?: ResumeDiffValue;
  tailoredValue?: ResumeDiffValue;

  // Proposal Traceability (Phase 6C / 6B)
  proposalId?: string;
  proposalTitle?: string;
  action?: string;                    // Proposal action (e.g. "REWRITE", "PROMOTE", "EXCLUDE")
  reason?: string;                    // Approved rationale from 6C
  requirementIds?: readonly string[]; // Linked Phase 6B requirement IDs
  evidence?: readonly ITailoringEvidenceRef[]; // Linked evidence excerpts

  source: DiffChangeSource;
}

/**
 * Decoupled, read-only proposal trace structure
 * (Avoids coupling pure diff engine to the entire TailoringPlanDTO)
 */
export interface TailoringProposalTrace {
  id: string;
  action: string;
  target: {
    section: string;
    field: string;
    entityId?: string;
    subEntityId?: string;
    bulletIndex?: number;
  };
  title: string;
  currentValue?: string | null;
  proposedValue?: string | null;
  reason?: string;
  requirementIds?: string[];
  evidence?: ITailoringEvidenceRef[];
  userDecision?: string;
  userEditedValue?: string | null;
  isProtected?: boolean;
}

export interface ResumeComparisonContext {
  proposals?: readonly TailoringProposalTrace[];
  masterSectionOrder?: readonly string[];
  tailoredSectionOrder?: readonly string[];
  provenanceMap?: Readonly<Record<string, DiffChangeSource>>;
}

export interface ResumeComparisonResult {
  hasChanges: boolean;
  totalChanges: number;
  sectionCounts: Record<ResumeDiffSection, number>;
  sections: {
    summary: ResumeDiffItem[];
    skills: ResumeDiffItem[];
    experience: ResumeDiffItem[];
    projects: ResumeDiffItem[];
    education: ResumeDiffItem[];
    layout: ResumeDiffItem[];
  };
  changes: ResumeDiffItem[];
}
