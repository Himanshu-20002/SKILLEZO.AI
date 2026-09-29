import { ResumeComparisonResult, ResumeDiffItem } from './resume-comparison.types';
import { JobProfile, JobRequirementCategory, JobRequirementImportance } from './job-profile.types';
import { JobMatchResultDTO, MatchState } from './job-match.types';
import { TailoringPlanDTO, TailoringProposalDTO } from './tailoring-plan.types';

export type TailoringInsightCategory =
  | 'SUMMARY'
  | 'SKILLS'
  | 'EXPERIENCE'
  | 'PROJECTS'
  | 'NOT_ADDED';

export type TailoringInsightAction =
  | 'REWRITE'
  | 'PROMOTE'
  | 'DE_EMPHASIZE'
  | 'DO_NOT_ADD'
  | 'ADD_BULLET'
  | 'REORDER'
  | 'SELECT'
  | 'EXCLUDE'
  | 'USER_EDIT'
  | 'UNATTRIBUTED';

export type TailoringMatchState =
  | 'PROVEN_RELEVANT'
  | 'PROVEN_UNDERREPRESENTED'
  | 'PARTIAL_MATCH'
  | 'RELATED_EVIDENCE'
  | 'MISSING'
  | 'INSUFFICIENT_EVIDENCE'
  | 'NOT_APPLICABLE'
  | 'NEEDS_REVIEW'
  | 'UNATTRIBUTED';

export type StudioSectionKey = 'summary' | 'skills' | 'experience' | 'projects';

export interface TailoringInsightItem {
  id: string;
  category: TailoringInsightCategory;
  action: TailoringInsightAction;
  matchState: TailoringMatchState;
  requirementId?: string;
  requirementName: string;
  requirementCategory?: JobRequirementCategory;
  importance?: JobRequirementImportance;
  proposalId?: string;
  proposalTitle?: string;
  rationale: string;
  evidenceSnippet?: string | null;
  evidenceSource?: string | null;
  targetSectionKey?: StudioSectionKey | null;
  targetEntityId?: string;
  targetSubEntityId?: string;
  bulletIndex?: number;
  isUserEdited: boolean;
  isUnattributed: boolean;
  diffItemId?: string;
  beforeValue?: string | null;
  afterValue?: string | null;
}

export interface TailoringInsightsSummary {
  totalAppliedChanges: number;
  matchedRequirements: number;
  promotedRequirements: number;
  notAddedRequirements: number;
  sectionCounts: Record<TailoringInsightCategory, number>;
}

export interface TailoringInsightsViewModel {
  resumeId: string;
  targetJobId: string;
  targetRole: string;
  targetCompany: string;
  summary: TailoringInsightsSummary;
  items: TailoringInsightItem[];
  itemsByCategory: Record<TailoringInsightCategory, TailoringInsightItem[]>;
  notAddedItems: TailoringInsightItem[];
  unattributedChanges: TailoringInsightItem[];
}

export type TailoringCategoryFilter = 'ALL' | TailoringInsightCategory;

export interface BuildTailoringInsightsParams {
  resumeId: string;
  targetJobId: string;
  jobProfile?: JobProfile | null;
  jobMatch?: JobMatchResultDTO | null;
  tailoringPlan?: TailoringPlanDTO | null;
  diffResult?: ResumeComparisonResult | null;
}
