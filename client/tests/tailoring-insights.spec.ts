import { describe, it, expect } from 'vitest';
import { buildTailoringInsightsViewModel, formatDiffValue } from '@/lib/resume-studio/tailoring-insights.adapter';
import { JobProfile } from '@/types/job-profile.types';
import { JobMatchResultDTO } from '@/types/job-match.types';
import { TailoringPlanDTO } from '@/types/tailoring-plan.types';
import { ResumeComparisonResult } from '@/types/resume-comparison.types';

function createMockJobProfile(overrides: Partial<JobProfile> = {}): JobProfile {
  return {
    id: 'jp_google_01',
    userId: 'user_01',
    displayName: 'Google Senior Frontend Engineer',
    jobTitle: 'Senior Frontend Engineer',
    company: 'Google',
    rawDescription: 'Looking for a Senior Frontend Engineer with TypeScript, React, GraphQL, and Kubernetes.',
    normalizedDescription: 'Looking for a Senior Frontend Engineer...',
    sourceHash: 'hash_01',
    jobFingerprint: 'fp_01',
    analysisStatus: 'ANALYZED',
    analysisVersion: 1,
    analysis: {
      seniority: 'SENIOR',
      responsibilities: ['Build enterprise React apps', 'Optimize Web Vitals'],
      requirements: [
        {
          name: 'React',
          normalizedName: 'react',
          category: 'SKILL',
          importance: 'REQUIRED',
          confidence: 0.95,
          evidence: { text: 'Expert React knowledge required' },
        },
        {
          name: 'TypeScript',
          normalizedName: 'typescript',
          category: 'SKILL',
          importance: 'REQUIRED',
          confidence: 0.95,
          evidence: { text: 'Deep TypeScript experience' },
        },
        {
          name: 'GraphQL',
          normalizedName: 'graphql',
          category: 'SKILL',
          importance: 'PREFERRED',
          confidence: 0.85,
          evidence: { text: 'GraphQL schema design' },
        },
        {
          name: 'Kubernetes',
          normalizedName: 'kubernetes',
          category: 'TOOL',
          importance: 'PREFERRED',
          confidence: 0.8,
          evidence: { text: 'Familiarity with Kubernetes' },
        },
      ],
      experienceRequirements: ['5+ years frontend'],
      educationRequirements: ["Bachelor's in CS or equivalent"],
      keywords: ['react', 'typescript', 'graphql', 'kubernetes'],
    },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    ...overrides,
  };
}

function createMockJobMatch(overrides: Partial<JobMatchResultDTO> = {}): JobMatchResultDTO {
  return {
    id: 'jm_01',
    userId: 'user_01',
    jobProfileId: 'jp_google_01',
    sourceProfileVersion: 1,
    jobAnalysisVersion: 1,
    isStale: false,
    summary: {
      totalRequirements: 4,
      proven: 2,
      underrepresented: 1,
      partial: 0,
      related: 0,
      missing: 1,
      insufficient: 0,
      needsReview: 0,
      requiredTotal: 2,
      requiredProven: 2,
    },
    requirementMatches: [
      {
        requirementId: 'req_react',
        name: 'React',
        normalizedName: 'react',
        category: 'SKILL',
        importance: 'REQUIRED',
        matchState: 'PROVEN_RELEVANT',
        confidence: 0.95,
        evidence: [
          {
            sourceType: 'EXPERIENCE',
            sourceId: 'exp_acme',
            label: 'Acme Corp · Senior Frontend Developer',
            excerpt: 'Led migration to React 18 and Next.js App Router.',
          },
        ],
      },
      {
        requirementId: 'req_ts',
        name: 'TypeScript',
        normalizedName: 'typescript',
        category: 'SKILL',
        importance: 'REQUIRED',
        matchState: 'PROVEN_UNDERREPRESENTED',
        confidence: 0.85,
        evidence: [
          {
            sourceType: 'SKILL',
            sourceId: 'skill_ts',
            label: 'Candidate Skills · TypeScript',
            excerpt: 'Listed in profile with 4 verified endorsements.',
          },
        ],
      },
      {
        requirementId: 'req_graphql',
        name: 'GraphQL',
        normalizedName: 'graphql',
        category: 'SKILL',
        importance: 'PREFERRED',
        matchState: 'PARTIAL_MATCH',
        confidence: 0.7,
        evidence: [
          {
            sourceType: 'PROJECT',
            sourceId: 'proj_ecom',
            label: 'Personal E-Commerce Platform',
            excerpt: 'Integrated Apollo Client with GraphQL backend.',
          },
        ],
      },
      {
        requirementId: 'req_k8s',
        name: 'Kubernetes',
        normalizedName: 'kubernetes',
        category: 'TOOL',
        importance: 'PREFERRED',
        matchState: 'MISSING',
        confidence: 0.2,
        evidence: [],
      },
      {
        requirementId: 'req_aws',
        name: 'AWS CloudFormation',
        normalizedName: 'aws cloudformation',
        category: 'TOOL',
        importance: 'PREFERRED',
        matchState: 'MISSING',
        confidence: 0.1,
        evidence: [],
      },
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    ...overrides,
  };
}

function createMockTailoringPlan(overrides: Partial<TailoringPlanDTO> = {}): TailoringPlanDTO {
  return {
    id: 'tp_01',
    userId: 'user_01',
    jobProfileId: 'jp_google_01',
    sourceProfileVersion: 1,
    jobAnalysisVersion: 1,
    intensity: 'BALANCED',
    status: 'READY',
    planVersion: 1,
    isStale: false,
    summary: {
      totalProposals: 4,
      pendingCount: 0,
      acceptedCount: 3,
      rejectedCount: 0,
      editedCount: 1,
      protectedCount: 0,
      actionBreakdown: { REWRITE: 1, PROMOTE: 1, EMPHASIZE: 1, DO_NOT_ADD: 1 },
      sectionBreakdown: { SUMMARY: 1, SKILLS: 1, EXPERIENCE: 1, NOT_ADDED: 1 },
    },
    proposals: [
      {
        id: 'prop_summary',
        action: 'REWRITE',
        target: { section: 'SUMMARY', field: 'summary.text' },
        title: 'Align summary with Senior Frontend Engineer target',
        reason: 'Targeting Google Senior Frontend role with React and scalable architectures.',
        requirementIds: ['req_react', 'req_ts'],
        evidence: [
          {
            sourceType: 'EXPERIENCE',
            sourceId: 'exp_acme',
            label: 'Acme Corp',
            excerpt: 'Architected large-scale React micro-frontends.',
          },
        ],
        confidence: 0.92,
        priority: 'HIGH',
        userDecision: 'ACCEPTED',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
        isProtected: false,
      },
      {
        id: 'prop_promote_ts',
        action: 'PROMOTE',
        target: { section: 'SKILLS', field: 'skills', entityId: 'skill_ts' },
        title: 'Elevate TypeScript in skills hierarchy',
        reason: 'Job strongly demands TypeScript expertise.',
        requirementIds: ['req_ts'],
        evidence: [
          {
            sourceType: 'SKILL',
            sourceId: 'skill_ts',
            label: 'Skills',
            excerpt: 'TypeScript proficiency verified.',
          },
        ],
        confidence: 0.9,
        priority: 'HIGH',
        userDecision: 'ACCEPTED',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
        isProtected: false,
      },
      {
        id: 'prop_exp_bullet',
        action: 'EMPHASIZE',
        target: { section: 'EXPERIENCE', field: 'bullets', entityId: 'exp_acme', subEntityId: 'b1' },
        title: 'Highlight React 18 performance optimization',
        reason: 'Candidate engineered React 18 migration aligning directly with performance requirement.',
        requirementIds: ['req_react'],
        evidence: [
          {
            sourceType: 'EXPERIENCE',
            sourceId: 'exp_acme',
            label: 'Acme Corp',
            excerpt: 'Decreased First Contentful Paint by 42%.',
          },
        ],
        confidence: 0.95,
        priority: 'HIGH',
        userDecision: 'EDITED',
        userEditedValue: 'Optimized React 18 rendering pipeline, driving 42% faster initial loads.',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
        isProtected: false,
      },
      {
        id: 'prop_omit_k8s',
        action: 'DO_NOT_ADD',
        target: { section: 'SKILLS', field: 'skills' },
        title: 'Refrain from fabricating Kubernetes experience',
        reason: 'No evidence found in candidate profile for Kubernetes; omitted to maintain 100% truthful claims.',
        requirementIds: ['req_k8s'],
        evidence: [],
        confidence: 0.99,
        priority: 'HIGH',
        userDecision: 'ACCEPTED',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
        isProtected: true,
      },
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    ...overrides,
  };
}

function createMockDiffResult(overrides: Partial<ResumeComparisonResult> = {}): ResumeComparisonResult {
  return {
    hasChanges: true,
    totalChanges: 4,
    sectionCounts: {
      summary: 1,
      skills: 1,
      experience: 1,
      projects: 0,
      education: 0,
      layout: 1,
    },
    sections: {
      summary: [
        {
          id: 'diff:summary:text',
          section: 'summary',
          changeType: 'REWRITTEN',
          title: 'Professional Summary',
          proposalId: 'prop_summary',
          source: 'TAILORING_PLAN',
          masterValue: 'Software engineer building web applications.',
          tailoredValue: 'Senior Frontend Engineer specializing in React and distributed architectures.',
        },
      ],
      skills: [
        {
          id: 'diff:skills:skill_ts',
          section: 'skills',
          changeType: 'PROMOTED',
          title: 'Skills · TypeScript',
          entityId: 'skill_ts',
          proposalId: 'prop_promote_ts',
          source: 'TAILORING_PLAN',
          masterValue: ['React', 'Node.js', 'TypeScript'],
          tailoredValue: ['TypeScript', 'React', 'Node.js'],
        },
      ],
      experience: [
        {
          id: 'diff:experience:exp_acme:b1',
          section: 'experience',
          changeType: 'EDITED',
          title: 'Work Experience · Acme Corp · Bullet 1',
          entityId: 'exp_acme',
          subEntityId: 'b1',
          proposalId: 'prop_exp_bullet',
          source: 'TAILORING_PLAN',
          masterValue: 'Improved frontend app performance.',
          tailoredValue: 'Optimized React 18 rendering pipeline, driving 42% faster initial loads.',
        },
      ],
      projects: [],
      education: [],
      layout: [
        {
          id: 'diff:layout:order',
          section: 'layout',
          changeType: 'REORDERED',
          title: 'Section Order',
          source: 'TAILORING_PLAN',
          masterValue: ['summary', 'experience', 'skills'],
          tailoredValue: ['summary', 'skills', 'experience'],
        },
      ],
    },
    changes: [
      {
        id: 'diff:summary:text',
        section: 'summary',
        changeType: 'REWRITTEN',
        title: 'Professional Summary',
        proposalId: 'prop_summary',
        source: 'TAILORING_PLAN',
        masterValue: 'Software engineer building web applications.',
        tailoredValue: 'Senior Frontend Engineer specializing in React and distributed architectures.',
      },
      {
        id: 'diff:skills:skill_ts',
        section: 'skills',
        changeType: 'PROMOTED',
        title: 'Skills · TypeScript',
        entityId: 'skill_ts',
        proposalId: 'prop_promote_ts',
        source: 'TAILORING_PLAN',
        masterValue: ['React', 'Node.js', 'TypeScript'],
        tailoredValue: ['TypeScript', 'React', 'Node.js'],
      },
      {
        id: 'diff:experience:exp_acme:b1',
        section: 'experience',
        changeType: 'EDITED',
        title: 'Work Experience · Acme Corp · Bullet 1',
        entityId: 'exp_acme',
        subEntityId: 'b1',
        proposalId: 'prop_exp_bullet',
        source: 'TAILORING_PLAN',
        masterValue: 'Improved frontend app performance.',
        tailoredValue: 'Optimized React 18 rendering pipeline, driving 42% faster initial loads.',
      },
      {
        id: 'diff:layout:order',
        section: 'layout',
        changeType: 'REORDERED',
        title: 'Section Order',
        source: 'TAILORING_PLAN',
        masterValue: ['summary', 'experience', 'skills'],
        tailoredValue: ['summary', 'skills', 'experience'],
      },
    ],
    ...overrides,
  };
}

describe('Tailoring Insights Pure Adapter (buildTailoringInsightsViewModel)', () => {
  it('Scenario 01: Deduplicates metrics using strict sets for unique diff items and requirement IDs', () => {
    const jobProfile = createMockJobProfile();
    const jobMatch = createMockJobMatch();
    const tailoringPlan = createMockTailoringPlan();
    const diffResult = createMockDiffResult();

    const vm = buildTailoringInsightsViewModel({
      resumeId: 'res_tailored_01',
      targetJobId: 'jp_google_01',
      jobProfile,
      jobMatch,
      tailoringPlan,
      diffResult,
    });

    // 4 unique diff item IDs in diffResult
    expect(vm.summary.totalAppliedChanges).toBe(4);
    // 3 matched requirements (req_react, req_ts, req_graphql)
    expect(vm.summary.matchedRequirements).toBe(3);
    // 1 promoted requirement (req_ts)
    expect(vm.summary.promotedRequirements).toBe(1);
    // 1 not added requirement (req_k8s)
    expect(vm.summary.notAddedRequirements).toBe(1);
  });

  it('Scenario 02: Maps PROVEN_RELEVANT requirement correctly with verified badge and rationale', () => {
    const jobProfile = createMockJobProfile();
    const jobMatch = createMockJobMatch();
    const tailoringPlan = createMockTailoringPlan();
    const diffResult = createMockDiffResult();

    const vm = buildTailoringInsightsViewModel({
      resumeId: 'res_tailored_01',
      targetJobId: 'jp_google_01',
      jobProfile,
      jobMatch,
      tailoringPlan,
      diffResult,
    });

    const summaryItem = vm.items.find(i => i.proposalId === 'prop_summary');
    expect(summaryItem).toBeDefined();
    expect(summaryItem?.matchState).toBe('PROVEN_RELEVANT');
    expect(summaryItem?.requirementName).toBe('React');
    expect(summaryItem?.action).toBe('REWRITE');
    expect(summaryItem?.category).toBe('SUMMARY');
    expect(summaryItem?.targetSectionKey).toBe('summary');
  });

  it('Scenario 03: Maps PROVEN_UNDERREPRESENTED requirement correctly to promoted skill', () => {
    const jobProfile = createMockJobProfile();
    const jobMatch = createMockJobMatch();
    const tailoringPlan = createMockTailoringPlan();
    const diffResult = createMockDiffResult();

    const vm = buildTailoringInsightsViewModel({
      resumeId: 'res_tailored_01',
      targetJobId: 'jp_google_01',
      jobProfile,
      jobMatch,
      tailoringPlan,
      diffResult,
    });

    const skillItem = vm.items.find(i => i.proposalId === 'prop_promote_ts');
    expect(skillItem).toBeDefined();
    expect(skillItem?.matchState).toBe('PROVEN_UNDERREPRESENTED');
    expect(skillItem?.requirementName).toBe('TypeScript');
    expect(skillItem?.action).toBe('PROMOTE');
    expect(skillItem?.category).toBe('SKILLS');
    expect(skillItem?.targetSectionKey).toBe('skills');
  });

  it('Scenario 04: Ensures MISSING requirements WITHOUT an explicit DO_NOT_ADD proposal are NOT in Not Added', () => {
    const jobProfile = createMockJobProfile();
    const jobMatch = createMockJobMatch(); // contains req_aws with MISSING, but no proposal exists in plan
    const tailoringPlan = createMockTailoringPlan(); // only has prop_omit_k8s for req_k8s
    const diffResult = createMockDiffResult();

    const vm = buildTailoringInsightsViewModel({
      resumeId: 'res_tailored_01',
      targetJobId: 'jp_google_01',
      jobProfile,
      jobMatch,
      tailoringPlan,
      diffResult,
    });

    // req_aws must NOT appear in notAddedItems
    const awsNotAdded = vm.notAddedItems.find(i => i.requirementName.toLowerCase().includes('aws'));
    expect(awsNotAdded).toBeUndefined();
    // Only req_k8s should be in notAddedItems
    expect(vm.notAddedItems.length).toBe(1);
    expect(vm.notAddedItems[0].requirementName).toBe('Kubernetes');
  });

  it('Scenario 05: Strict Not-Added Invariant: MISSING + approved DO_NOT_ADD proposal maps to Not Added', () => {
    const jobProfile = createMockJobProfile();
    const jobMatch = createMockJobMatch();
    const tailoringPlan = createMockTailoringPlan();
    const diffResult = createMockDiffResult();

    const vm = buildTailoringInsightsViewModel({
      resumeId: 'res_tailored_01',
      targetJobId: 'jp_google_01',
      jobProfile,
      jobMatch,
      tailoringPlan,
      diffResult,
    });

    expect(vm.notAddedItems.length).toBe(1);
    const k8sItem = vm.notAddedItems[0];
    expect(k8sItem.action).toBe('DO_NOT_ADD');
    expect(k8sItem.category).toBe('NOT_ADDED');
    expect(k8sItem.targetSectionKey).toBeNull();
    expect(k8sItem.matchState).toBe('MISSING');
    expect(k8sItem.rationale).toContain('maintain 100% truthful claims');
  });

  it('Scenario 06: PROMOTE proposal links to Skills section and links with diff item', () => {
    const jobProfile = createMockJobProfile();
    const jobMatch = createMockJobMatch();
    const tailoringPlan = createMockTailoringPlan();
    const diffResult = createMockDiffResult();

    const vm = buildTailoringInsightsViewModel({
      resumeId: 'res_tailored_01',
      targetJobId: 'jp_google_01',
      jobProfile,
      jobMatch,
      tailoringPlan,
      diffResult,
    });

    const skillItem = vm.itemsByCategory.SKILLS.find(i => i.proposalId === 'prop_promote_ts');
    expect(skillItem).toBeDefined();
    expect(skillItem?.diffItemId).toBe('diff:skills:skill_ts');
    expect(skillItem?.beforeValue).toBe('React, Node.js, TypeScript');
    expect(skillItem?.afterValue).toBe('TypeScript, React, Node.js');
  });

  it('Scenario 07: REWRITE proposal links to Summary section and diff item', () => {
    const jobProfile = createMockJobProfile();
    const jobMatch = createMockJobMatch();
    const tailoringPlan = createMockTailoringPlan();
    const diffResult = createMockDiffResult();

    const vm = buildTailoringInsightsViewModel({
      resumeId: 'res_tailored_01',
      targetJobId: 'jp_google_01',
      jobProfile,
      jobMatch,
      tailoringPlan,
      diffResult,
    });

    const summaryItem = vm.itemsByCategory.SUMMARY[0];
    expect(summaryItem.diffItemId).toBe('diff:summary:text');
    expect(summaryItem.beforeValue).toBe('Software engineer building web applications.');
    expect(summaryItem.afterValue).toContain('Senior Frontend Engineer');
  });

  it('Scenario 08: EMPHASIZE proposal links to Experience section and bullet item', () => {
    const jobProfile = createMockJobProfile();
    const jobMatch = createMockJobMatch();
    const tailoringPlan = createMockTailoringPlan();
    const diffResult = createMockDiffResult();

    const vm = buildTailoringInsightsViewModel({
      resumeId: 'res_tailored_01',
      targetJobId: 'jp_google_01',
      jobProfile,
      jobMatch,
      tailoringPlan,
      diffResult,
    });

    const expItem = vm.itemsByCategory.EXPERIENCE.find(i => i.proposalId === 'prop_exp_bullet');
    expect(expItem).toBeDefined();
    expect(expItem?.targetEntityId).toBe('exp_acme');
    expect(expItem?.targetSubEntityId).toBe('b1');
    expect(expItem?.diffItemId).toBe('diff:experience:exp_acme:b1');
  });

  it('Scenario 09: Represents user-edited decision as candidate-customized', () => {
    const jobProfile = createMockJobProfile();
    const jobMatch = createMockJobMatch();
    const tailoringPlan = createMockTailoringPlan();
    const diffResult = createMockDiffResult();

    const vm = buildTailoringInsightsViewModel({
      resumeId: 'res_tailored_01',
      targetJobId: 'jp_google_01',
      jobProfile,
      jobMatch,
      tailoringPlan,
      diffResult,
    });

    const editedItem = vm.items.find(i => i.proposalId === 'prop_exp_bullet');
    expect(editedItem?.isUserEdited).toBe(true);
    expect(editedItem?.rationale).toContain('Customized by candidate');
    expect(editedItem?.afterValue).toContain('42% faster initial loads');
  });

  it('Scenario 10: Unattributed diff item strictly labeled UNATTRIBUTED CHANGE', () => {
    const jobProfile = createMockJobProfile();
    const jobMatch = createMockJobMatch();
    const tailoringPlan = createMockTailoringPlan();
    // Add an extra diff change that has no proposalId and source is UNATTRIBUTED
    const diffResult = createMockDiffResult({
      changes: [
        ...createMockDiffResult().changes,
        {
          id: 'diff:skills:unknown',
          section: 'skills',
          changeType: 'ADDED',
          title: 'Skills · Docker',
          source: 'UNATTRIBUTED',
          masterValue: null,
          tailoredValue: 'Docker',
        },
      ],
    });

    const vm = buildTailoringInsightsViewModel({
      resumeId: 'res_tailored_01',
      targetJobId: 'jp_google_01',
      jobProfile,
      jobMatch,
      tailoringPlan,
      diffResult,
    });

    const unattr = vm.unattributedChanges.find(i => i.diffItemId === 'diff:skills:unknown');
    expect(unattr).toBeDefined();
    expect(unattr?.action).toBe('UNATTRIBUTED');
    expect(unattr?.isUnattributed).toBe(true);
    expect(unattr?.isUserEdited).toBe(false);
    expect(unattr?.matchState).toBe('UNATTRIBUTED');
  });

  it('Scenario 11: Candidate manual edit diff item is labeled USER_EDIT with proper attribution', () => {
    const jobProfile = createMockJobProfile();
    const jobMatch = createMockJobMatch();
    const tailoringPlan = createMockTailoringPlan();
    // Diff item with USER_EDIT source
    const diffResult = createMockDiffResult({
      changes: [
        ...createMockDiffResult().changes,
        {
          id: 'diff:experience:manual_edit',
          section: 'experience',
          changeType: 'USER_EDIT',
          title: 'Work Experience · Manual Edit',
          source: 'USER_EDIT',
          masterValue: 'Old text',
          tailoredValue: 'Custom new text',
        },
      ],
    });

    const vm = buildTailoringInsightsViewModel({
      resumeId: 'res_tailored_01',
      targetJobId: 'jp_google_01',
      jobProfile,
      jobMatch,
      tailoringPlan,
      diffResult,
    });

    const userEditItem = vm.unattributedChanges.find(i => i.diffItemId === 'diff:experience:manual_edit');
    expect(userEditItem).toBeDefined();
    expect(userEditItem?.action).toBe('USER_EDIT');
    expect(userEditItem?.isUserEdited).toBe(true);
    expect(userEditItem?.isUnattributed).toBe(false);
  });

  it('Resilience: Gracefully handles null diffResult and null tailoringPlan', () => {
    const jobProfile = createMockJobProfile();
    const jobMatch = createMockJobMatch();

    const vm = buildTailoringInsightsViewModel({
      resumeId: 'res_tailored_01',
      targetJobId: 'jp_google_01',
      jobProfile,
      jobMatch,
      tailoringPlan: null,
      diffResult: null,
    });

    expect(vm.targetRole).toBe('Senior Frontend Engineer');
    expect(vm.targetCompany).toBe('Google');
    expect(vm.summary.totalAppliedChanges).toBe(0);
    expect(vm.summary.matchedRequirements).toBe(3);
    expect(vm.items.length).toBe(0);
    expect(vm.notAddedItems.length).toBe(0);
  });
});
