import { CandidateEvidenceBundle } from "../evidence/types";

export interface ProfileContextSummary {
  id?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  projectsCount: number;
  location?: string;
}

export interface ResumeContextSummary {
  resumeId: string;
  title: string;
  atsScore?: number;
  extractedSkills: string[];
  isDefault: boolean;
}

export interface CandidateContextSnapshotMetadata {
  sourceCount: number;
  evidenceCount: number;
  snapshotHash: string;
  generationLatencyMs?: number;
  byteSize?: number;
}

export interface CandidateContextSnapshot {
  candidateId: string;
  targetRole?: string;
  generatedAt: Date;
  version: string;
  profile: ProfileContextSummary | null;
  resume: ResumeContextSummary | null;
  evidence: CandidateEvidenceBundle;
  metadata: CandidateContextSnapshotMetadata;
}

export interface CacheTelemetry {
  hits: number;
  misses: number;
  hitRate: number;
  itemCount: number;
  totalGenerations: number;
  averageLatencyMs: number;
}
