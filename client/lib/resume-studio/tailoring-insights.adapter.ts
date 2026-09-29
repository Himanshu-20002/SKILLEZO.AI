import {
  BuildTailoringInsightsParams,
  TailoringInsightAction,
  TailoringInsightCategory,
  TailoringInsightItem,
  TailoringInsightsSummary,
  TailoringInsightsViewModel,
  TailoringMatchState,
  StudioSectionKey,
} from '@/types/tailoring-insights.types';
import {
  ResumeComparisonResult,
  ResumeDiffItem,
  ResumeDiffSection,
  ResumeDiffValue,
} from '@/types/resume-comparison.types';
import {
  JobProfile,
  JobRequirementItem,
} from '@/types/job-profile.types';
import {
  JobMatchResultDTO,
  JobRequirementMatchDTO,
  MatchState,
} from '@/types/job-match.types';
import {
  TailoringAction,
  TailoringPlanDTO,
  TailoringProposalDTO,
  TargetSection,
} from '@/types/tailoring-plan.types';

function mapTargetSectionToCategory(section: TargetSection, action?: TailoringAction): TailoringInsightCategory {
  if (action === 'DO_NOT_ADD') {
    return 'NOT_ADDED';
  }
  switch (section) {
    case 'SUMMARY':
      return 'SUMMARY';
    case 'SKILLS':
      return 'SKILLS';
    case 'EXPERIENCE':
      return 'EXPERIENCE';
    case 'PROJECTS':
      return 'PROJECTS';
    default:
      return 'EXPERIENCE';
  }
}

function mapDiffSectionToCategory(section: ResumeDiffSection): TailoringInsightCategory {
  switch (section) {
    case 'summary':
      return 'SUMMARY';
    case 'skills':
      return 'SKILLS';
    case 'experience':
      return 'EXPERIENCE';
    case 'projects':
      return 'PROJECTS';
    case 'education':
    case 'layout':
    default:
      return 'EXPERIENCE';
  }
}

function mapCategoryToStudioSection(category: TailoringInsightCategory): StudioSectionKey | null {
  switch (category) {
    case 'SUMMARY':
      return 'summary';
    case 'SKILLS':
      return 'skills';
    case 'EXPERIENCE':
      return 'experience';
    case 'PROJECTS':
      return 'projects';
    case 'NOT_ADDED':
    default:
      return null;
  }
}

function mapProposalActionToInsightAction(action: TailoringAction): TailoringInsightAction {
  switch (action) {
    case 'REWRITE':
      return 'REWRITE';
    case 'PROMOTE':
      return 'PROMOTE';
    case 'DE_EMPHASIZE':
      return 'DE_EMPHASIZE';
    case 'DO_NOT_ADD':
      return 'DO_NOT_ADD';
    case 'SELECT':
      return 'SELECT';
    case 'EXCLUDE':
      return 'EXCLUDE';
    case 'EMPHASIZE':
      return 'ADD_BULLET';
    case 'REORDER':
      return 'REORDER';
    case 'KEEP':
    default:
      return 'UNATTRIBUTED';
  }
}

function mapMatchStateToTailoringMatchState(state?: MatchState | null): TailoringMatchState {
  if (!state) return 'UNATTRIBUTED';
  switch (state) {
    case 'PROVEN_RELEVANT':
      return 'PROVEN_RELEVANT';
    case 'PROVEN_UNDERREPRESENTED':
      return 'PROVEN_UNDERREPRESENTED';
    case 'PARTIAL_MATCH':
      return 'PARTIAL_MATCH';
    case 'RELATED_EVIDENCE':
      return 'RELATED_EVIDENCE';
    case 'MISSING':
      return 'MISSING';
    case 'INSUFFICIENT_EVIDENCE':
      return 'INSUFFICIENT_EVIDENCE';
    case 'NOT_APPLICABLE':
      return 'NOT_APPLICABLE';
    case 'NEEDS_REVIEW':
      return 'NEEDS_REVIEW';
    default:
      return 'UNATTRIBUTED';
  }
}

export function formatDiffValue(val: ResumeDiffValue): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    return val.filter(Boolean).map(String).join(', ');
  }
  if (typeof val === 'object') {
    if ('text' in val && typeof val.text === 'string') return val.text;
    if ('name' in val && typeof val.name === 'string') return val.name;
    if ('title' in val && typeof val.title === 'string') return val.title;
    if ('bullets' in val && Array.isArray(val.bullets)) return val.bullets.join('\n');
    return JSON.stringify(val);
  }
  return null;
}

export function buildTailoringInsightsViewModel(params: BuildTailoringInsightsParams): TailoringInsightsViewModel {
  const { resumeId, targetJobId, jobProfile, jobMatch, tailoringPlan, diffResult } = params;

  // 1. Target Job and Company display
  const targetRole = jobProfile?.jobTitle || 'Target Role';
  const targetCompany = jobProfile?.company || 'Target Company';

  // 2. Index Job Profile Requirements by normalized name and ID
  const requirementsById = new Map<string, JobRequirementItem>();
  const requirementsByName = new Map<string, JobRequirementItem>();

  if (jobProfile?.analysis?.requirements) {
    for (const req of jobProfile.analysis.requirements) {
      if (req.normalizedName) {
        requirementsByName.set(req.normalizedName.toLowerCase(), req);
      }
      if (req.name) {
        requirementsByName.set(req.name.toLowerCase(), req);
      }
    }
  }

  // 3. Index Job Match requirement matches
  const matchByReqId = new Map<string, JobRequirementMatchDTO>();
  const matchByName = new Map<string, JobRequirementMatchDTO>();

  if (jobMatch?.requirementMatches) {
    for (const m of jobMatch.requirementMatches) {
      if (m.requirementId) {
        matchByReqId.set(m.requirementId, m);
      }
      if (m.normalizedName) {
        matchByName.set(m.normalizedName.toLowerCase(), m);
      }
      if (m.name) {
        matchByName.set(m.name.toLowerCase(), m);
      }
    }
  }

  // 4. Calculate Deduplicated Metrics using Sets
  // Total Applied Changes: unique diff items in 6E.1 diff result
  const uniqueAppliedDiffItemIds = new Set<string>();
  if (diffResult?.changes) {
    for (const ch of diffResult.changes) {
      if (ch.id) {
        uniqueAppliedDiffItemIds.add(ch.id);
      }
    }
  }
  const totalAppliedChanges = uniqueAppliedDiffItemIds.size;

  // Matched Requirements: unique requirementId in jobMatch where matchState is proven or partial
  const uniqueMatchedReqIds = new Set<string>();
  if (jobMatch?.requirementMatches) {
    for (const m of jobMatch.requirementMatches) {
      if (
        m.matchState === 'PROVEN_RELEVANT' ||
        m.matchState === 'PROVEN_UNDERREPRESENTED' ||
        m.matchState === 'PARTIAL_MATCH' ||
        m.matchState === 'RELATED_EVIDENCE'
      ) {
        uniqueMatchedReqIds.add(m.requirementId || m.normalizedName || m.name);
      }
    }
  }
  const matchedRequirements = uniqueMatchedReqIds.size;

  // Promoted Requirements: unique requirementId in accepted/edited PROMOTE proposals
  const uniquePromotedReqIds = new Set<string>();
  // Not Added Requirements: unique requirementId in accepted/edited DO_NOT_ADD proposals
  const uniqueNotAddedReqIds = new Set<string>();

  if (tailoringPlan?.proposals) {
    for (const p of tailoringPlan.proposals) {
      const isApproved = p.userDecision === 'ACCEPTED' || p.userDecision === 'EDITED';
      if (!isApproved) continue;

      if (p.action === 'PROMOTE') {
        const reqIds = p.requirementIds?.length ? p.requirementIds : [p.title];
        for (const rid of reqIds) {
          if (rid) uniquePromotedReqIds.add(rid);
        }
      } else if (p.action === 'DO_NOT_ADD') {
        const reqIds = p.requirementIds?.length ? p.requirementIds : [p.title];
        for (const rid of reqIds) {
          if (rid) uniqueNotAddedReqIds.add(rid);
        }
      }
    }
  }
  const promotedRequirements = uniquePromotedReqIds.size;
  const notAddedRequirements = uniqueNotAddedReqIds.size;

  // 5. Build Insight Items from Approved Proposals
  const items: TailoringInsightItem[] = [];
  const linkedDiffItemIds = new Set<string>();

  if (tailoringPlan?.proposals) {
    for (const proposal of tailoringPlan.proposals) {
      const isApproved = proposal.userDecision === 'ACCEPTED' || proposal.userDecision === 'EDITED';
      if (!isApproved) continue;

      const category = mapTargetSectionToCategory(proposal.target.section, proposal.action);
      const action = mapProposalActionToInsightAction(proposal.action);
      const targetSectionKey = mapCategoryToStudioSection(category);

      // Find primary requirement ID and matched data
      const primaryReqId = proposal.requirementIds?.[0];
      let matchedReq = primaryReqId ? matchByReqId.get(primaryReqId) : undefined;
      if (!matchedReq && proposal.title) {
        matchedReq = matchByName.get(proposal.title.toLowerCase());
      }

      let profileReq = primaryReqId ? requirementsById.get(primaryReqId) : undefined;
      if (!profileReq && proposal.title) {
        profileReq = requirementsByName.get(proposal.title.toLowerCase());
      }

      const requirementName = matchedReq?.name || profileReq?.name || proposal.title;
      const requirementCategory = matchedReq?.category || profileReq?.category;
      const importance = matchedReq?.importance || profileReq?.importance || 'REQUIRED';
      const matchState = mapMatchStateToTailoringMatchState(matchedReq?.matchState);

      // Extract evidence snippet and source
      const primaryEvidence = proposal.evidence?.[0] || matchedReq?.evidence?.[0];
      const evidenceSnippet = primaryEvidence?.excerpt || null;
      const evidenceSource = primaryEvidence?.label || null;

      // Link to 6E.1 diff item if available
      let linkedDiff: ResumeDiffItem | undefined;
      if (diffResult?.changes) {
        linkedDiff = diffResult.changes.find(ch => {
          if (ch.proposalId && ch.proposalId === proposal.id) return true;
          const sectionMatch = targetSectionKey && ch.section === targetSectionKey;
          const entityMatch = proposal.target.entityId && ch.entityId === proposal.target.entityId;
          const subEntityMatch = proposal.target.subEntityId ? ch.subEntityId === proposal.target.subEntityId : true;
          return Boolean(sectionMatch && entityMatch && subEntityMatch);
        });
      }

      if (linkedDiff) {
        linkedDiffItemIds.add(linkedDiff.id);
      }

      const isUserEdited = proposal.userDecision === 'EDITED';
      const rationale = isUserEdited
        ? `${proposal.reason} (Customized by candidate: ${proposal.userEditedValue || 'Approved with edits'})`
        : proposal.reason;

      const item: TailoringInsightItem = {
        id: `insight:${proposal.id}`,
        category,
        action,
        matchState,
        requirementId: primaryReqId || matchedReq?.requirementId,
        requirementName,
        requirementCategory,
        importance,
        proposalId: proposal.id,
        proposalTitle: proposal.title,
        rationale,
        evidenceSnippet,
        evidenceSource,
        targetSectionKey,
        targetEntityId: proposal.target.entityId,
        targetSubEntityId: proposal.target.subEntityId,
        bulletIndex: proposal.target.bulletIndex,
        isUserEdited,
        isUnattributed: false,
        diffItemId: linkedDiff?.id,
        beforeValue: linkedDiff ? formatDiffValue(linkedDiff.masterValue) : proposal.currentValue || null,
        afterValue: linkedDiff ? formatDiffValue(linkedDiff.tailoredValue) : (proposal.userEditedValue || proposal.proposedValue || null),
      };

      items.push(item);
    }
  }

  // 6. Handle Unattributed Changes from 6E.1 AST Diff Result
  const unattributedChanges: TailoringInsightItem[] = [];
  if (diffResult?.changes) {
    for (const diffItem of diffResult.changes) {
      if (linkedDiffItemIds.has(diffItem.id)) continue;

      const category = mapDiffSectionToCategory(diffItem.section);
      const targetSectionKey = mapCategoryToStudioSection(category);
      const isUserEdit = diffItem.source === 'USER_EDIT';
      const isUnattributed = !isUserEdit;

      const action: TailoringInsightAction = isUserEdit ? 'USER_EDIT' : 'UNATTRIBUTED';
      const rationale = isUserEdit
        ? `Manual edit customized directly in Resume Studio.`
        : `Unattributed change detected between Master and Tailored AST.`;

      const item: TailoringInsightItem = {
        id: `insight:diff:${diffItem.id}`,
        category,
        action,
        matchState: 'UNATTRIBUTED',
        requirementName: diffItem.title || `${diffItem.section.toUpperCase()} Modification`,
        rationale,
        targetSectionKey,
        targetEntityId: diffItem.entityId,
        targetSubEntityId: diffItem.subEntityId,
        isUserEdited: isUserEdit,
        isUnattributed,
        diffItemId: diffItem.id,
        beforeValue: formatDiffValue(diffItem.masterValue),
        afterValue: formatDiffValue(diffItem.tailoredValue),
      };

      unattributedChanges.push(item);
      items.push(item);
    }
  }

  // 7. Group items by category and separate NOT_ADDED items
  const itemsByCategory: Record<TailoringInsightCategory, TailoringInsightItem[]> = {
    SUMMARY: [],
    SKILLS: [],
    EXPERIENCE: [],
    PROJECTS: [],
    NOT_ADDED: [],
  };

  const notAddedItems: TailoringInsightItem[] = [];

  for (const item of items) {
    if (item.category === 'NOT_ADDED') {
      notAddedItems.push(item);
      itemsByCategory.NOT_ADDED.push(item);
    } else {
      itemsByCategory[item.category].push(item);
    }
  }

  const sectionCounts: Record<TailoringInsightCategory, number> = {
    SUMMARY: itemsByCategory.SUMMARY.length,
    SKILLS: itemsByCategory.SKILLS.length,
    EXPERIENCE: itemsByCategory.EXPERIENCE.length,
    PROJECTS: itemsByCategory.PROJECTS.length,
    NOT_ADDED: notAddedItems.length,
  };

  const summary: TailoringInsightsSummary = {
    totalAppliedChanges,
    matchedRequirements,
    promotedRequirements,
    notAddedRequirements,
    sectionCounts,
  };

  return {
    resumeId,
    targetJobId,
    targetRole,
    targetCompany,
    summary,
    items,
    itemsByCategory,
    notAddedItems,
    unattributedChanges,
  };
}
