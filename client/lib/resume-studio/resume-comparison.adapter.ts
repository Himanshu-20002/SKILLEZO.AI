import {
  ResumeDiffSection,
  ResumeChangeType,
  DiffChangeSource,
  ResumeDiffValue,
  ResumeDiffItem,
} from '@/types/resume-comparison.types';
import {
  TailoringAction,
  ITailoringEvidenceRef,
  TailoringProposalDTO,
} from '@/types/tailoring-plan.types';
import {
  MatchState,
  JobRequirementMatchDTO,
  CareerEvidenceReferenceDTO,
} from '@/types/job-match.types';
import {
  BuildComparisonParams,
  ComparisonChangeVM,
  ComparisonEvidenceDrawerVM,
  ResumeComparisonViewModel,
} from '@/types/resume-comparison-view.types';

const CANONICAL_SECTIONS: readonly ResumeDiffSection[] = [
  'summary',
  'skills',
  'experience',
  'projects',
  'education',
  'layout',
] as const;

/**
 * Pure deterministic formatter for ResumeDiffValue.
 * Preserves exact stored values without running any secondary text diff algorithm.
 */
export function formatDiffValue(value?: ResumeDiffValue): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return value
      .map((item) => (item == null ? '' : String(item)))
      .filter((s) => s.length > 0)
      .join('\n');
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    // Bullet text or direct text field
    if (typeof obj.text === 'string') {
      return obj.text;
    }

    // Role / Title / Company
    if (typeof obj.jobTitle === 'string' || typeof obj.title === 'string') {
      const title = (obj.jobTitle || obj.title) as string;
      const org = (obj.companyName || obj.institution) as string | undefined;
      return org ? `${title} · ${org}` : title;
    }

    // Degree / Institution
    if (typeof obj.degree === 'string') {
      const institution = obj.institution as string | undefined;
      return institution ? `${obj.degree} · ${institution}` : obj.degree;
    }

    // Named entity (e.g. Project name or Skill category)
    if (typeof obj.name === 'string') {
      const category = obj.category as string | undefined;
      return category ? `${obj.name} (${category})` : obj.name;
    }

    // Bullets list
    if (Array.isArray(obj.bullets)) {
      return obj.bullets
        .map((b) => (b == null ? '' : String(b)))
        .filter((s) => s.length > 0)
        .join('\n');
    }

    // Technologies
    if (Array.isArray(obj.technologies)) {
      return obj.technologies.join(', ');
    }

    // Section ordering
    if (Array.isArray(obj.sectionOrder)) {
      return obj.sectionOrder.join(' → ');
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

/**
 * Converts JobRequirementMatch evidence to ITailoringEvidenceRef format
 */
function mapCareerEvidenceToTailoringEvidence(
  careerEvidence: readonly CareerEvidenceReferenceDTO[]
): ITailoringEvidenceRef[] {
  return careerEvidence.map((ev) => {
    let mappedType: ITailoringEvidenceRef['sourceType'] = 'EXPERIENCE';
    if (ev.sourceType === 'PROJECT') mappedType = 'PROJECT';
    else if (ev.sourceType === 'EDUCATION') mappedType = 'EDUCATION';
    else if (ev.sourceType === 'SKILL') mappedType = 'SKILL';

    return {
      sourceType: mappedType,
      sourceId: ev.sourceId,
      label: ev.label,
      excerpt: ev.excerpt ?? null,
    };
  });
}

/**
 * Builds a deterministic Composite Key to match diff items with proposals.
 */
function buildTargetKey(section: string, entityId?: string, subEntityId?: string): string {
  return `${section.toLowerCase()}::${entityId || ''}::${subEntityId || ''}`;
}

/**
 * Pure deterministic adapter: maps 6E.1 ResumeComparisonResult, 6C TailoringPlan,
 * 6B JobMatchResult, and 6A JobProfile into the comparison view model.
 *
 * Invariants:
 * - 0 AI calls, 0 network side-effects.
 * - Inputs are treated as strictly immutable (0 mutations).
 * - Reuses 6E.1 sectionCounts and totalChanges directly without independent recalculation.
 * - Missing upstream data handled gracefully with fallback values.
 */
export function buildResumeComparisonViewModel(
  params: BuildComparisonParams
): ResumeComparisonViewModel {
  const {
    diffResult,
    resumeId,
    masterResumeId,
    targetJobId,
    targetRole,
    targetCompany,
    tailoringPlan,
    jobMatch,
    jobProfile,
  } = params;

  // 1. Index proposals for strict ID-based lookup
  const proposalsById = new Map<string, TailoringProposalDTO>();
  const proposalsByTarget = new Map<string, TailoringProposalDTO>();

  if (tailoringPlan?.proposals) {
    for (const proposal of tailoringPlan.proposals) {
      if (proposal.id) {
        proposalsById.set(proposal.id, proposal);
      }
      if (proposal.target) {
        const key = buildTargetKey(
          proposal.target.section,
          proposal.target.entityId,
          proposal.target.subEntityId
        );
        // First match wins to ensure deterministic behavior
        if (!proposalsByTarget.has(key)) {
          proposalsByTarget.set(key, proposal);
        }
      }
    }
  }

  // 2. Index job match requirements for strict ID-based lookup
  const matchesById = new Map<string, JobRequirementMatchDTO>();
  const matchesList = jobMatch?.requirementMatches || [];
  for (const match of matchesList) {
    if (match.requirementId) {
      matchesById.set(match.requirementId, match);
    }
  }

  // 3. Prepare section grouping structure
  const changesBySection: Record<ResumeDiffSection, ComparisonChangeVM[]> = {
    summary: [],
    skills: [],
    experience: [],
    projects: [],
    education: [],
    layout: [],
  };

  const allChanges: ComparisonChangeVM[] = [];

  // 4. Transform each ResumeDiffItem into a ComparisonChangeVM
  const rawChanges = diffResult.changes || [];

  for (const diffItem of rawChanges) {
    // Attempt strict ID correlation to proposal
    let matchedProposal: TailoringProposalDTO | undefined;
    if (diffItem.proposalId) {
      matchedProposal = proposalsById.get(diffItem.proposalId);
    }
    if (!matchedProposal && diffItem.entityId) {
      const targetKey = buildTargetKey(diffItem.section, diffItem.entityId, diffItem.subEntityId);
      matchedProposal = proposalsByTarget.get(targetKey);
    }

    // Determine candidate customization flag
    const isCandidateCustomized =
      matchedProposal?.userDecision === 'EDITED' ||
      diffItem.changeType === 'EDITED' ||
      diffItem.source === 'USER_EDIT';

    // Rationale and action
    const action = (matchedProposal?.action || diffItem.action) as TailoringAction | undefined;
    const proposalTitle = matchedProposal?.title || diffItem.proposalTitle;
    const reason = matchedProposal?.reason || diffItem.reason;

    // Requirement IDs
    const requirementIds: readonly string[] =
      matchedProposal?.requirementIds && matchedProposal.requirementIds.length > 0
        ? matchedProposal.requirementIds
        : diffItem.requirementIds && diffItem.requirementIds.length > 0
        ? diffItem.requirementIds
        : [];

    // Correlate to Job Requirement Match
    let requirementName: string | undefined;
    let matchState: MatchState | undefined;
    let matchEvidence: ITailoringEvidenceRef[] = [];

    if (requirementIds.length > 0) {
      const primaryReqId = requirementIds[0];
      const match = matchesById.get(primaryReqId);

      if (match) {
        requirementName = match.name;
        matchState = match.matchState;
        if (match.evidence && match.evidence.length > 0) {
          matchEvidence = mapCareerEvidenceToTailoringEvidence(match.evidence);
        }
      } else if (jobProfile?.analysis?.requirements) {
        // Fallback: check frozen job profile requirements if match result is missing
        const reqItem = jobProfile.analysis.requirements.find(
          (r) => r.normalizedName === primaryReqId || r.name === primaryReqId
        );
        if (reqItem) {
          requirementName = reqItem.name;
        }
      }
    }

    // Evidence resolution: Proposal evidence takes precedence, followed by diffItem, then match evidence
    const combinedEvidenceMap = new Map<string, ITailoringEvidenceRef>();

    const proposalEvidence = matchedProposal?.evidence || [];
    for (const ev of proposalEvidence) {
      if (ev.sourceId) combinedEvidenceMap.set(ev.sourceId, ev);
    }

    const itemEvidence = diffItem.evidence || [];
    for (const ev of itemEvidence) {
      if (ev.sourceId && !combinedEvidenceMap.has(ev.sourceId)) {
        combinedEvidenceMap.set(ev.sourceId, ev);
      }
    }

    for (const ev of matchEvidence) {
      if (ev.sourceId && !combinedEvidenceMap.has(ev.sourceId)) {
        combinedEvidenceMap.set(ev.sourceId, ev);
      }
    }

    const evidence = Array.from(combinedEvidenceMap.values());

    // Format stored diff values
    const masterValueFormatted = formatDiffValue(diffItem.masterValue);
    const tailoredValueFormatted = formatDiffValue(diffItem.tailoredValue);

    // Build ViewModel
    const changeVM: ComparisonChangeVM = {
      id: `comparison-change-${diffItem.id}`,
      diffItemId: diffItem.id,
      section: diffItem.section,
      changeType: diffItem.changeType,
      title: diffItem.title,
      field: diffItem.field,
      masterValueFormatted,
      tailoredValueFormatted,
      source: diffItem.source,
      isCandidateCustomized,
      proposalId: matchedProposal?.id || diffItem.proposalId,
      proposalTitle,
      action,
      reason,
      requirementIds,
      requirementName,
      matchState,
      evidence,
      entityId: diffItem.entityId,
      subEntityId: diffItem.subEntityId,
      canNavigateToResume: true,
    };

    allChanges.push(changeVM);
    if (changesBySection[diffItem.section]) {
      changesBySection[diffItem.section].push(changeVM);
    } else {
      // Fallback for safety
      changesBySection.layout.push(changeVM);
    }
  }

  // Fallback metadata formatting
  const effectiveRole = targetRole || (jobProfile ? jobProfile.jobTitle : null);
  const effectiveCompany = targetCompany || (jobProfile ? jobProfile.company : null);

  return {
    resumeId,
    masterResumeId,
    targetJobId: targetJobId ?? null,
    targetRole: effectiveRole ?? null,
    targetCompany: effectiveCompany ?? null,
    totalChanges: diffResult.totalChanges,
    sectionCounts: { ...diffResult.sectionCounts },
    changesBySection,
    allChanges,
    hasChanges: diffResult.hasChanges,
  };
}

/**
 * Builds the Evidence Drawer view model for a selected change.
 */
export function buildEvidenceDrawerViewModel(
  change: ComparisonChangeVM
): ComparisonEvidenceDrawerVM {
  return {
    changeId: change.id,
    diffItemId: change.diffItemId,
    title: change.title,
    section: change.section,
    changeType: change.changeType,
    proposalTitle: change.proposalTitle,
    action: change.action,
    reason: change.reason,
    requirementName: change.requirementName,
    matchState: change.matchState,
    evidence: change.evidence,
    canNavigateToResume: change.canNavigateToResume,
    entityId: change.entityId,
    subEntityId: change.subEntityId,
  };
}
