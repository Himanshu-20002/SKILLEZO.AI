import {
  ResumeDiffSection,
  ResumeChangeType,
  DiffChangeSource,
  ResumeComparisonResult,
} from '@/types/resume-comparison.types';
import {
  TailoringAction,
  ITailoringEvidenceRef,
  TailoringPlanDTO,
} from '@/types/tailoring-plan.types';
import {
  MatchState,
  JobMatchResultDTO,
} from '@/types/job-match.types';
import { JobProfile } from '@/types/job-profile.types';

export type ComparisonViewMode = 'SIDE_BY_SIDE' | 'UNIFIED';

export interface ComparisonChangeVM {
  id: string;
  diffItemId: string;
  section: ResumeDiffSection;
  changeType: ResumeChangeType;
  title: string;
  field?: string;
  masterValueFormatted?: string | null;
  tailoredValueFormatted?: string | null;
  source: DiffChangeSource;
  isCandidateCustomized: boolean; // true if userDecision === 'EDITED'
  proposalId?: string;
  proposalTitle?: string;
  action?: TailoringAction;
  reason?: string;
  requirementIds: readonly string[];
  requirementName?: string;
  matchState?: MatchState;
  evidence: readonly ITailoringEvidenceRef[];
  entityId?: string;
  subEntityId?: string;
  canNavigateToResume: boolean;
}

export interface ResumeComparisonViewModel {
  resumeId: string;
  masterResumeId: string;
  targetJobId?: string | null;
  targetRole?: string | null;
  targetCompany?: string | null;
  totalChanges: number;
  sectionCounts: Record<ResumeDiffSection, number>;
  changesBySection: Record<ResumeDiffSection, ComparisonChangeVM[]>;
  allChanges: ComparisonChangeVM[];
  hasChanges: boolean;
}

export interface ComparisonEvidenceDrawerVM {
  changeId: string;
  diffItemId: string;
  title: string;
  section: ResumeDiffSection;
  changeType: ResumeChangeType;
  proposalTitle?: string;
  action?: TailoringAction;
  reason?: string;
  requirementName?: string;
  matchState?: MatchState;
  evidence: readonly ITailoringEvidenceRef[];
  canNavigateToResume: boolean;
  entityId?: string;
  subEntityId?: string;
}

export interface BuildComparisonParams {
  diffResult: ResumeComparisonResult;
  resumeId: string;
  masterResumeId: string;
  targetJobId?: string | null;
  targetRole?: string | null;
  targetCompany?: string | null;
  tailoringPlan?: TailoringPlanDTO | null;
  jobMatch?: JobMatchResultDTO | null;
  jobProfile?: JobProfile | null;
}
