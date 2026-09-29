import {
  ResumeDocument,
  ResumeSkillItem,
  ResumeExperienceItem,
  ResumeExperienceBullet,
  ResumeProjectItem,
  ResumeEducationItem,
} from '@/types/resume-document';
import {
  ResumeComparisonResult,
  ResumeComparisonContext,
  ResumeDiffItem,
  ResumeDiffSection,
  ResumeChangeType,
  DiffChangeSource,
  TailoringProposalTrace,
  ResumeDiffValue,
} from '@/types/resume-comparison.types';

/**
 * Normalizes text for comparison by collapsing internal whitespace runs and trimming.
 */
function normalizeText(text?: string | null): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes identifier tokens (lowercased, trimmed).
 */
function normalizeToken(token?: string | null): string {
  if (!token) return '';
  return token.trim().toLowerCase();
}

/**
 * Field-aware equality for optional string values (location, subtitle, gpa).
 * Null and undefined are treated as equivalent absent values, but neither is equal to non-empty string.
 */
function isOptionalStringEqual(a?: string | null, b?: string | null): boolean {
  const normA = a == null ? null : normalizeText(a);
  const normB = b == null ? null : normalizeText(b);
  if (normA == null && normB == null) return true;
  return normA === normB;
}

/**
 * Field-aware equality for honors string arrays (empty array treated as equivalent to absent).
 */
function isHonorsArrayEqual(a?: readonly string[] | null, b?: readonly string[] | null): boolean {
  const arrA = a || [];
  const arrB = b || [];
  if (arrA.length !== arrB.length) return false;
  return arrA.every((item, idx) => normalizeText(item) === normalizeText(arrB[idx]));
}

/**
 * Ambiguity-safe proposal lookup.
 * Follows strict priority order:
 * 1. target.entityId + target.subEntityId
 * 2. target.entityId (section-aligned)
 * 3. Exact field match for singletons (e.g. SUMMARY)
 * 4. currentValue text match ONLY when strictly unambiguous across proposals
 */
function findMatchingProposal(
  proposals: readonly TailoringProposalTrace[] | undefined,
  criteria: {
    section: string;
    field?: string;
    entityId?: string;
    subEntityId?: string;
    currentValue?: string | null;
  }
): TailoringProposalTrace | undefined {
  if (!proposals || proposals.length === 0) return undefined;

  // 1. Direct entity + subEntity match
  if (criteria.entityId && criteria.subEntityId) {
    const direct = proposals.find(
      (p) =>
        p.target.section.toUpperCase() === criteria.section.toUpperCase() &&
        p.target.entityId === criteria.entityId &&
        p.target.subEntityId === criteria.subEntityId
    );
    if (direct) return direct;
  }

  // 2. Entity match without subEntity
  if (criteria.entityId && !criteria.subEntityId) {
    const entityMatch = proposals.find(
      (p) =>
        p.target.section.toUpperCase() === criteria.section.toUpperCase() &&
        p.target.entityId === criteria.entityId &&
        (!criteria.field || p.target.field === criteria.field)
    );
    if (entityMatch) return entityMatch;
  }

  // 3. Singleton section field match (e.g. SUMMARY)
  if (criteria.section.toUpperCase() === 'SUMMARY') {
    const summaryMatch = proposals.find(
      (p) =>
        p.target.section.toUpperCase() === 'SUMMARY' &&
        (!criteria.field || p.target.field === criteria.field)
    );
    if (summaryMatch) return summaryMatch;
  }

  // 4. Section order singleton match
  if (criteria.section.toUpperCase() === 'SECTION_ORDER' || criteria.field === 'layout.sectionOrder') {
    const layoutMatch = proposals.find(
      (p) => p.target.section.toUpperCase() === 'SECTION_ORDER' || p.target.field === 'layout.sectionOrder'
    );
    if (layoutMatch) return layoutMatch;
  }

  // 5. Unambiguous currentValue fallback (strict: exactly 1 proposal matches)
  if (criteria.currentValue) {
    const normSearch = normalizeText(criteria.currentValue);
    if (normSearch.length >= 10) {
      const candidates = proposals.filter(
        (p) =>
          p.target.section.toUpperCase() === criteria.section.toUpperCase() &&
          p.currentValue &&
          normalizeText(p.currentValue) === normSearch
      );
      if (candidates.length === 1) {
        return candidates[0];
      }
    }
  }

  return undefined;
}

/**
 * Resolves attribution source and change type with full provenance safety.
 */
function resolveAttribution(
  proposal: TailoringProposalTrace | undefined,
  defaultChangeType: ResumeChangeType,
  diffId: string,
  provenanceMap?: Readonly<Record<string, DiffChangeSource>>
): {
  changeType: ResumeChangeType;
  source: DiffChangeSource;
  proposalId?: string;
  proposalTitle?: string;
  action?: string;
  reason?: string;
  requirementIds?: readonly string[];
  evidence?: readonly import('@/types/tailoring-plan.types').ITailoringEvidenceRef[];
} {
  // Check explicit provenance override first
  if (provenanceMap && provenanceMap[diffId]) {
    const explicitSource = provenanceMap[diffId];
    return {
      changeType: explicitSource === 'USER_EDIT' ? 'USER_EDIT' : defaultChangeType,
      source: explicitSource,
      proposalId: proposal?.id,
      proposalTitle: proposal?.title,
      action: proposal?.action,
      reason: proposal?.reason,
      requirementIds: proposal?.requirementIds ? [...proposal.requirementIds] : undefined,
      evidence: proposal?.evidence ? [...proposal.evidence] : undefined,
    };
  }

  if (proposal) {
    let changeType: ResumeChangeType = defaultChangeType;
    if (proposal.userDecision === 'EDITED') {
      changeType = 'EDITED';
    } else if (proposal.action === 'PROMOTE') {
      changeType = 'PROMOTED';
    } else if (proposal.action === 'DE_EMPHASIZE') {
      changeType = 'DE_EMPHASIZED';
    } else if (proposal.action === 'EXCLUDE') {
      changeType = 'EXCLUDED';
    } else if (proposal.action === 'REWRITE') {
      changeType = 'REWRITTEN';
    } else if (proposal.action === 'SELECT') {
      changeType = 'SELECTED';
    }

    return {
      changeType,
      source: 'TAILORING_PLAN',
      proposalId: proposal.id,
      proposalTitle: proposal.title,
      action: proposal.action,
      reason: proposal.reason,
      requirementIds: proposal.requirementIds ? [...proposal.requirementIds] : undefined,
      evidence: proposal.evidence ? [...proposal.evidence] : undefined,
    };
  }

  return {
    changeType: defaultChangeType,
    source: 'UNATTRIBUTED',
  };
}

/**
 * 1. Summary Comparator
 */
function compareSummary(
  masterDoc?: ResumeDocument | null,
  tailoredDoc?: ResumeDocument | null,
  context?: ResumeComparisonContext
): ResumeDiffItem[] {
  const masterText = masterDoc?.summary?.text || '';
  const tailoredText = tailoredDoc?.summary?.text || '';

  const normMaster = normalizeText(masterText);
  const normTailored = normalizeText(tailoredText);

  if (normMaster === normTailored) {
    return [];
  }

  const diffId = 'diff:summary:text';
  const proposal = findMatchingProposal(context?.proposals, {
    section: 'SUMMARY',
    field: 'summary.text',
    currentValue: masterText,
  });

  const defaultType: ResumeChangeType = proposal ? 'REWRITTEN' : 'CHANGED';
  const attr = resolveAttribution(proposal, defaultType, diffId, context?.provenanceMap);

  return [
    {
      id: diffId,
      section: 'summary',
      changeType: attr.changeType,
      title: 'Professional Summary',
      field: 'summary.text',
      masterValue: masterText,
      tailoredValue: tailoredText,
      proposalId: attr.proposalId,
      proposalTitle: attr.proposalTitle,
      action: attr.action,
      reason: attr.reason,
      requirementIds: attr.requirementIds,
      evidence: attr.evidence,
      source: attr.source,
    },
  ];
}

/**
 * 2. Skills Comparator
 */
function compareSkills(
  masterDoc?: ResumeDocument | null,
  tailoredDoc?: ResumeDocument | null,
  context?: ResumeComparisonContext
): ResumeDiffItem[] {
  const masterSkills: readonly ResumeSkillItem[] = masterDoc?.skills || [];
  const tailoredSkills: readonly ResumeSkillItem[] = tailoredDoc?.skills || [];

  const diffs: ResumeDiffItem[] = [];

  // Index Master skills by stable ID and normalized name
  const masterById = new Map<string, { skill: ResumeSkillItem; index: number }>();
  const masterByName = new Map<string, { skill: ResumeSkillItem; index: number }[]>();

  masterSkills.forEach((skill, index) => {
    masterById.set(skill.id, { skill, index });
    const nameKey = normalizeToken(skill.name);
    const existing = masterByName.get(nameKey) || [];
    existing.push({ skill, index });
    masterByName.set(nameKey, existing);
  });

  const tailoredMatchedMasterIds = new Set<string>();

  // Evaluate Tailored skills against Master
  tailoredSkills.forEach((tailoredSkill, tailoredIdx) => {
    let matchedMaster: { skill: ResumeSkillItem; index: number } | undefined;

    // Direct ID match
    if (tailoredSkill.id && masterById.has(tailoredSkill.id)) {
      matchedMaster = masterById.get(tailoredSkill.id);
    } else {
      // Name match fallback (safe only when unambiguous)
      const nameKey = normalizeToken(tailoredSkill.name);
      const candidates = masterByName.get(nameKey);
      if (candidates && candidates.length === 1) {
        matchedMaster = candidates[0];
      }
    }

    if (!matchedMaster) {
      // Skill present in Tailored but absent in Master: structural fact ADDED
      const diffId = `diff:skills:${tailoredSkill.id || normalizeToken(tailoredSkill.name)}:added`;
      const proposal = findMatchingProposal(context?.proposals, {
        section: 'SKILLS',
        field: 'skills.list',
        currentValue: tailoredSkill.name,
      });
      const attr = resolveAttribution(proposal, 'ADDED', diffId, context?.provenanceMap);

      diffs.push({
        id: diffId,
        section: 'skills',
        changeType: attr.changeType,
        title: `Skill · ${tailoredSkill.name}`,
        field: 'skills.list',
        entityId: tailoredSkill.id,
        masterValue: null,
        tailoredValue: tailoredSkill.name,
        proposalId: attr.proposalId,
        proposalTitle: attr.proposalTitle,
        action: attr.action,
        reason: attr.reason,
        requirementIds: attr.requirementIds,
        evidence: attr.evidence,
        source: attr.source,
      });
      return;
    }

    tailoredMatchedMasterIds.add(matchedMaster.skill.id);

    // Detect rank / position change
    if (tailoredIdx !== matchedMaster.index) {
      const diffId = `diff:skills:${tailoredSkill.id}:order`;
      const isPromotedRank = tailoredIdx < matchedMaster.index;

      // Find proposal specifically promoting/de-emphasizing this skill
      const proposal = (context?.proposals || []).find((p) => {
        if (p.target.section.toUpperCase() !== 'SKILLS') return false;
        const targetName = normalizeToken(p.currentValue || p.proposedValue || p.title);
        return (
          p.target.entityId === tailoredSkill.id ||
          targetName === normalizeToken(tailoredSkill.name) ||
          targetName.includes(normalizeToken(tailoredSkill.name))
        );
      });

      let defaultType: ResumeChangeType = 'REORDERED';
      if (isPromotedRank && proposal?.action === 'PROMOTE') {
        defaultType = 'PROMOTED';
      } else if (!isPromotedRank && proposal?.action === 'DE_EMPHASIZE') {
        defaultType = 'DE_EMPHASIZED';
      }

      const attr = resolveAttribution(proposal, defaultType, diffId, context?.provenanceMap);

      diffs.push({
        id: diffId,
        section: 'skills',
        changeType: attr.changeType,
        title: `Technical Skill · ${tailoredSkill.name}`,
        field: 'skills.list',
        entityId: tailoredSkill.id,
        masterValue: `${tailoredSkill.name} (Position ${matchedMaster.index + 1})`,
        tailoredValue: `${tailoredSkill.name} (Position ${tailoredIdx + 1})`,
        proposalId: attr.proposalId,
        proposalTitle: attr.proposalTitle,
        action: attr.action,
        reason: attr.reason,
        requirementIds: attr.requirementIds,
        evidence: attr.evidence,
        source: attr.source,
      });
    }
  });

  // Evaluate removed Master skills
  masterSkills.forEach((masterSkill) => {
    if (!tailoredMatchedMasterIds.has(masterSkill.id)) {
      const diffId = `diff:skills:${masterSkill.id}:removed`;
      const proposal = findMatchingProposal(context?.proposals, {
        section: 'SKILLS',
        field: 'skills.list',
        currentValue: masterSkill.name,
      });
      const attr = resolveAttribution(proposal, 'REMOVED', diffId, context?.provenanceMap);

      diffs.push({
        id: diffId,
        section: 'skills',
        changeType: attr.changeType,
        title: `Skill · ${masterSkill.name}`,
        field: 'skills.list',
        entityId: masterSkill.id,
        masterValue: masterSkill.name,
        tailoredValue: null,
        proposalId: attr.proposalId,
        proposalTitle: attr.proposalTitle,
        action: attr.action,
        reason: attr.reason,
        requirementIds: attr.requirementIds,
        evidence: attr.evidence,
        source: attr.source,
      });
    }
  });

  return diffs;
}

/**
 * 3. Experience Comparator
 */
function compareExperience(
  masterDoc?: ResumeDocument | null,
  tailoredDoc?: ResumeDocument | null,
  context?: ResumeComparisonContext
): ResumeDiffItem[] {
  const masterExp: readonly ResumeExperienceItem[] = masterDoc?.experience || [];
  const tailoredExp: readonly ResumeExperienceItem[] = tailoredDoc?.experience || [];

  const diffs: ResumeDiffItem[] = [];

  const masterById = new Map<string, ResumeExperienceItem>();
  masterExp.forEach((e) => masterById.set(e.id, e));

  const tailoredMatchedMasterIds = new Set<string>();

  // Check Tailored experience items
  tailoredExp.forEach((tailoredItem) => {
    let masterItem = masterById.get(tailoredItem.id);

    // Fallback match: company + title (unambiguous)
    if (!masterItem) {
      const compKey = normalizeToken(tailoredItem.companyName) + '::' + normalizeToken(tailoredItem.jobTitle);
      const matches = masterExp.filter(
        (m) => normalizeToken(m.companyName) + '::' + normalizeToken(m.jobTitle) === compKey
      );
      if (matches.length === 1) {
        masterItem = matches[0];
      }
    }

    if (!masterItem) {
      // Entire experience item added in Tailored
      const diffId = `diff:experience:${tailoredItem.id}:item:added`;
      const attr = resolveAttribution(undefined, 'ADDED', diffId, context?.provenanceMap);
      diffs.push({
        id: diffId,
        section: 'experience',
        changeType: attr.changeType,
        title: `Experience · ${tailoredItem.jobTitle} at ${tailoredItem.companyName}`,
        entityId: tailoredItem.id,
        masterValue: null,
        tailoredValue: {
          jobTitle: tailoredItem.jobTitle,
          companyName: tailoredItem.companyName,
        },
        source: attr.source,
      });
      return;
    }

    tailoredMatchedMasterIds.add(masterItem.id);

    // Check item-level title or company changes
    if (
      normalizeText(tailoredItem.jobTitle) !== normalizeText(masterItem.jobTitle) ||
      normalizeText(tailoredItem.companyName) !== normalizeText(masterItem.companyName)
    ) {
      const diffId = `diff:experience:${tailoredItem.id}:title`;
      const attr = resolveAttribution(undefined, 'CHANGED', diffId, context?.provenanceMap);
      diffs.push({
        id: diffId,
        section: 'experience',
        changeType: attr.changeType,
        title: `Experience Title · ${masterItem.companyName}`,
        entityId: tailoredItem.id,
        masterValue: `${masterItem.jobTitle} at ${masterItem.companyName}`,
        tailoredValue: `${tailoredItem.jobTitle} at ${tailoredItem.companyName}`,
        source: attr.source,
      });
    }

    // Compare bullets within this experience item
    const masterBullets = masterItem.bullets || [];
    const tailoredBullets = tailoredItem.bullets || [];

    const masterBulletById = new Map<string, ResumeExperienceBullet>();
    masterBullets.forEach((b) => masterBulletById.set(b.id, b));

    tailoredBullets.forEach((tBullet, bIdx) => {
      let mBullet = masterBulletById.get(tBullet.id);

      // Fallback matching by unambiguous index if IDs are absent
      if (!mBullet && masterBullets[bIdx]) {
        mBullet = masterBullets[bIdx];
      }

      if (mBullet) {
        const normM = normalizeText(mBullet.text);
        const normT = normalizeText(tBullet.text);

        if (normM !== normT) {
          const diffId = `diff:experience:${masterItem!.id}:bullet:${tBullet.id || bIdx}:text`;
          const duplicateCountInMaster = masterBullets.filter((b) => normalizeText(b.text) === normM).length;

          const proposal = findMatchingProposal(context?.proposals, {
            section: 'EXPERIENCE',
            field: 'experience.bullet',
            entityId: masterItem!.id,
            subEntityId: tBullet.id,
            currentValue: duplicateCountInMaster === 1 ? mBullet.text : undefined,
          });

          const defaultType: ResumeChangeType = proposal ? 'REWRITTEN' : 'CHANGED';
          const attr = resolveAttribution(proposal, defaultType, diffId, context?.provenanceMap);

          diffs.push({
            id: diffId,
            section: 'experience',
            changeType: attr.changeType,
            title: `Experience Bullet · ${masterItem!.companyName}`,
            field: `experience.bullet`,
            entityId: masterItem!.id,
            subEntityId: tBullet.id,
            masterValue: mBullet.text,
            tailoredValue: tBullet.text,
            proposalId: attr.proposalId,
            proposalTitle: attr.proposalTitle,
            action: attr.action,
            reason: attr.reason,
            requirementIds: attr.requirementIds,
            evidence: attr.evidence,
            source: attr.source,
          });
        }
      }
    });
  });

  // Check excluded/removed experience items
  masterExp.forEach((mItem) => {
    if (!tailoredMatchedMasterIds.has(mItem.id)) {
      const diffId = `diff:experience:${mItem.id}:item:excluded`;
      const proposal = findMatchingProposal(context?.proposals, {
        section: 'EXPERIENCE',
        field: 'experience.selection',
        entityId: mItem.id,
      });

      const defaultType = proposal?.action === 'EXCLUDE' ? 'EXCLUDED' : 'REMOVED';
      const attr = resolveAttribution(proposal, defaultType, diffId, context?.provenanceMap);

      diffs.push({
        id: diffId,
        section: 'experience',
        changeType: attr.changeType,
        title: `Experience Excluded · ${mItem.jobTitle} at ${mItem.companyName}`,
        field: 'experience.selection',
        entityId: mItem.id,
        masterValue: `${mItem.jobTitle} at ${mItem.companyName}`,
        tailoredValue: null,
        proposalId: attr.proposalId,
        proposalTitle: attr.proposalTitle,
        action: attr.action,
        reason: attr.reason,
        requirementIds: attr.requirementIds,
        evidence: attr.evidence,
        source: attr.source,
      });
    }
  });

  return diffs;
}

/**
 * 4. Projects Comparator
 */
function compareProjects(
  masterDoc?: ResumeDocument | null,
  tailoredDoc?: ResumeDocument | null,
  context?: ResumeComparisonContext
): ResumeDiffItem[] {
  const masterProj: readonly ResumeProjectItem[] = masterDoc?.projects || [];
  const tailoredProj: readonly ResumeProjectItem[] = tailoredDoc?.projects || [];

  const diffs: ResumeDiffItem[] = [];

  const masterById = new Map<string, ResumeProjectItem>();
  masterProj.forEach((p) => masterById.set(p.id, p));

  const tailoredMatchedMasterIds = new Set<string>();

  tailoredProj.forEach((tProj, tIdx) => {
    let mProj = masterById.get(tProj.id);

    // Fallback: title match
    if (!mProj) {
      const matches = masterProj.filter((m) => normalizeToken(m.title) === normalizeToken(tProj.title));
      if (matches.length === 1) {
        mProj = matches[0];
      }
    }

    if (!mProj) {
      const diffId = `diff:projects:${tProj.id}:added`;
      const attr = resolveAttribution(undefined, 'ADDED', diffId, context?.provenanceMap);
      diffs.push({
        id: diffId,
        section: 'projects',
        changeType: attr.changeType,
        title: `Project Added · ${tProj.title}`,
        entityId: tProj.id,
        masterValue: null,
        tailoredValue: tProj.title,
        source: attr.source,
      });
      return;
    }

    tailoredMatchedMasterIds.add(mProj.id);

    // Check project rank promotion (e.g. elevated to index 0)
    const mIdx = masterProj.findIndex((p) => p.id === mProj!.id);
    if (tIdx < mIdx && tIdx === 0) {
      const diffId = `diff:projects:${tProj.id}:selection`;
      const proposal = findMatchingProposal(context?.proposals, {
        section: 'PROJECTS',
        field: 'projects.selection',
        entityId: mProj.id,
      });
      const defaultType = proposal?.action === 'PROMOTE' ? 'PROMOTED' : 'REORDERED';
      const attr = resolveAttribution(proposal, defaultType, diffId, context?.provenanceMap);

      diffs.push({
        id: diffId,
        section: 'projects',
        changeType: attr.changeType,
        title: `Project Promoted · ${tProj.title}`,
        field: 'projects.selection',
        entityId: tProj.id,
        masterValue: `${tProj.title} (Position ${mIdx + 1})`,
        tailoredValue: `${tProj.title} (Position 1)`,
        proposalId: attr.proposalId,
        proposalTitle: attr.proposalTitle,
        action: attr.action,
        reason: attr.reason,
        requirementIds: attr.requirementIds,
        evidence: attr.evidence,
        source: attr.source,
      });
    }

    // Check description changes
    if (!isOptionalStringEqual(tProj.description, mProj.description)) {
      const diffId = `diff:projects:${tProj.id}:description`;
      const attr = resolveAttribution(undefined, 'CHANGED', diffId, context?.provenanceMap);
      diffs.push({
        id: diffId,
        section: 'projects',
        changeType: attr.changeType,
        title: `Project Description · ${tProj.title}`,
        entityId: tProj.id,
        masterValue: mProj.description || null,
        tailoredValue: tProj.description || null,
        source: attr.source,
      });
    }

    // Check project bullet text
    const mBullets = mProj.bullets || [];
    const tBullets = tProj.bullets || [];

    tBullets.forEach((tBulletText, bIdx) => {
      const mBulletText = mBullets[bIdx];
      if (mBulletText && normalizeText(tBulletText) !== normalizeText(mBulletText)) {
        const diffId = `diff:projects:${tProj.id}:bullet:${bIdx}:text`;
        const duplicateCountInMaster = mBullets.filter((b) => normalizeText(b) === normalizeText(mBulletText)).length;

        const proposal = findMatchingProposal(context?.proposals, {
          section: 'PROJECTS',
          field: 'projects.bullet',
          entityId: mProj!.id,
          currentValue: duplicateCountInMaster === 1 ? mBulletText : undefined,
        });

        const defaultType: ResumeChangeType = proposal ? 'REWRITTEN' : 'CHANGED';
        const attr = resolveAttribution(proposal, defaultType, diffId, context?.provenanceMap);

        diffs.push({
          id: diffId,
          section: 'projects',
          changeType: attr.changeType,
          title: `Project Bullet · ${tProj.title}`,
          field: 'projects.bullet',
          entityId: tProj.id,
          masterValue: mBulletText,
          tailoredValue: tBulletText,
          proposalId: attr.proposalId,
          proposalTitle: attr.proposalTitle,
          action: attr.action,
          reason: attr.reason,
          requirementIds: attr.requirementIds,
          evidence: attr.evidence,
          source: attr.source,
        });
      }
    });
  });

  // Check excluded/removed projects
  masterProj.forEach((mProj) => {
    if (!tailoredMatchedMasterIds.has(mProj.id)) {
      const diffId = `diff:projects:${mProj.id}:excluded`;
      const proposal = findMatchingProposal(context?.proposals, {
        section: 'PROJECTS',
        field: 'projects.selection',
        entityId: mProj.id,
      });

      const defaultType = proposal?.action === 'EXCLUDE' ? 'EXCLUDED' : 'REMOVED';
      const attr = resolveAttribution(proposal, defaultType, diffId, context?.provenanceMap);

      diffs.push({
        id: diffId,
        section: 'projects',
        changeType: attr.changeType,
        title: `Project Excluded · ${mProj.title}`,
        field: 'projects.selection',
        entityId: mProj.id,
        masterValue: mProj.title,
        tailoredValue: null,
        proposalId: attr.proposalId,
        proposalTitle: attr.proposalTitle,
        action: attr.action,
        reason: attr.reason,
        requirementIds: attr.requirementIds,
        evidence: attr.evidence,
        source: attr.source,
      });
    }
  });

  return diffs;
}

/**
 * 5. Education Comparator
 */
function compareEducation(
  masterDoc?: ResumeDocument | null,
  tailoredDoc?: ResumeDocument | null,
  context?: ResumeComparisonContext
): ResumeDiffItem[] {
  const masterEdu: readonly ResumeEducationItem[] = masterDoc?.education || [];
  const tailoredEdu: readonly ResumeEducationItem[] = tailoredDoc?.education || [];

  const diffs: ResumeDiffItem[] = [];

  const masterById = new Map<string, ResumeEducationItem>();
  masterEdu.forEach((e) => masterById.set(e.id, e));

  const tailoredMatchedMasterIds = new Set<string>();

  tailoredEdu.forEach((tEdu) => {
    let mEdu = masterById.get(tEdu.id);

    if (!mEdu) {
      const eduKey = normalizeToken(tEdu.institution) + '::' + normalizeToken(tEdu.degree || '');
      const matches = masterEdu.filter(
        (m) => normalizeToken(m.institution) + '::' + normalizeToken(m.degree || '') === eduKey
      );
      if (matches.length === 1) {
        mEdu = matches[0];
      }
    }

    if (!mEdu) {
      const diffId = `diff:education:${tEdu.id}:added`;
      const attr = resolveAttribution(undefined, 'ADDED', diffId, context?.provenanceMap);
      diffs.push({
        id: diffId,
        section: 'education',
        changeType: attr.changeType,
        title: `Education Added · ${tEdu.institution}`,
        entityId: tEdu.id,
        masterValue: null,
        tailoredValue: `${tEdu.degree || 'Degree'} at ${tEdu.institution}`,
        source: attr.source,
      });
      return;
    }

    tailoredMatchedMasterIds.add(mEdu.id);

    // Schema-aware field equality
    const degreeChanged = !isOptionalStringEqual(tEdu.degree, mEdu.degree);
    const fieldChanged = !isOptionalStringEqual(tEdu.fieldOfStudy, mEdu.fieldOfStudy);
    const institutionChanged = normalizeText(tEdu.institution) !== normalizeText(mEdu.institution);
    const gpaChanged = !isOptionalStringEqual(tEdu.gradeOrGpa, mEdu.gradeOrGpa);
    const honorsChanged = !isHonorsArrayEqual(tEdu.honors, mEdu.honors);

    if (degreeChanged || fieldChanged || institutionChanged || gpaChanged || honorsChanged) {
      const diffId = `diff:education:${tEdu.id}:fields`;
      const attr = resolveAttribution(undefined, 'CHANGED', diffId, context?.provenanceMap);
      diffs.push({
        id: diffId,
        section: 'education',
        changeType: attr.changeType,
        title: `Education · ${mEdu.institution}`,
        entityId: tEdu.id,
        masterValue: {
          institution: mEdu.institution,
          degree: mEdu.degree,
        },
        tailoredValue: {
          institution: tEdu.institution,
          degree: tEdu.degree,
        },
        source: attr.source,
      });
    }
  });

  // Check excluded education
  masterEdu.forEach((mEdu) => {
    if (!tailoredMatchedMasterIds.has(mEdu.id)) {
      const diffId = `diff:education:${mEdu.id}:excluded`;
      const proposal = findMatchingProposal(context?.proposals, {
        section: 'EDUCATION',
        field: 'education.selection',
        entityId: mEdu.id,
      });

      const defaultType = proposal?.action === 'EXCLUDE' ? 'EXCLUDED' : 'REMOVED';
      const attr = resolveAttribution(proposal, defaultType, diffId, context?.provenanceMap);

      diffs.push({
        id: diffId,
        section: 'education',
        changeType: attr.changeType,
        title: `Education Excluded · ${mEdu.institution}`,
        field: 'education.selection',
        entityId: mEdu.id,
        masterValue: `${mEdu.degree || 'Degree'} at ${mEdu.institution}`,
        tailoredValue: null,
        proposalId: attr.proposalId,
        proposalTitle: attr.proposalTitle,
        action: attr.action,
        reason: attr.reason,
        requirementIds: attr.requirementIds,
        evidence: attr.evidence,
        source: attr.source,
      });
    }
  });

  return diffs;
}

/**
 * 6. Layout / Section Order Comparator
 */
function compareLayout(context?: ResumeComparisonContext): ResumeDiffItem[] {
  const masterOrder = context?.masterSectionOrder;
  const tailoredOrder = context?.tailoredSectionOrder;

  if (!masterOrder || !tailoredOrder || masterOrder.length === 0 || tailoredOrder.length === 0) {
    return [];
  }

  if (masterOrder.length === tailoredOrder.length && masterOrder.every((sec, i) => sec === tailoredOrder[i])) {
    return [];
  }

  const diffId = 'diff:layout:sectionOrder';
  const proposal = findMatchingProposal(context?.proposals, {
    section: 'SECTION_ORDER',
    field: 'layout.sectionOrder',
  });

  const attr = resolveAttribution(proposal, 'REORDERED', diffId, context?.provenanceMap);

  return [
    {
      id: diffId,
      section: 'layout',
      changeType: attr.changeType,
      title: 'Resume Section Layout Order',
      field: 'layout.sectionOrder',
      masterValue: masterOrder,
      tailoredValue: tailoredOrder,
      proposalId: attr.proposalId,
      proposalTitle: attr.proposalTitle,
      action: attr.action,
      reason: attr.reason,
      requirementIds: attr.requirementIds,
      evidence: attr.evidence,
      source: attr.source,
    },
  ];
}

/**
 * PURE DETERMINISTIC RESUME DIFF ENTRY POINT
 * Evaluates differences between Master ResumeDocument and Tailored ResumeDocument.
 * Completely side-effect free, synchronous, 0 AI calls, 0 network requests, 0 DB access.
 */
export function computeResumeDiff(
  masterDoc?: ResumeDocument | null,
  tailoredDoc?: ResumeDocument | null,
  context?: ResumeComparisonContext
): ResumeComparisonResult {
  const summaryDiffs = compareSummary(masterDoc, tailoredDoc, context);
  const skillsDiffs = compareSkills(masterDoc, tailoredDoc, context);
  const experienceDiffs = compareExperience(masterDoc, tailoredDoc, context);
  const projectsDiffs = compareProjects(masterDoc, tailoredDoc, context);
  const educationDiffs = compareEducation(masterDoc, tailoredDoc, context);
  const layoutDiffs = compareLayout(context);

  const allChanges: ResumeDiffItem[] = [
    ...summaryDiffs,
    ...skillsDiffs,
    ...experienceDiffs,
    ...projectsDiffs,
    ...educationDiffs,
    ...layoutDiffs,
  ];

  const sectionCounts: Record<ResumeDiffSection, number> = {
    summary: summaryDiffs.length,
    skills: skillsDiffs.length,
    experience: experienceDiffs.length,
    projects: projectsDiffs.length,
    education: educationDiffs.length,
    layout: layoutDiffs.length,
  };

  return {
    hasChanges: allChanges.length > 0,
    totalChanges: allChanges.length,
    sectionCounts,
    sections: {
      summary: summaryDiffs,
      skills: skillsDiffs,
      experience: experienceDiffs,
      projects: projectsDiffs,
      education: educationDiffs,
      layout: layoutDiffs,
    },
    changes: allChanges,
  };
}
