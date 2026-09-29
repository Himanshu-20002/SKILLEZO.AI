 import { describe, it, expect } from 'vitest';
import {
  buildResumeComparisonViewModel,
  buildEvidenceDrawerViewModel,
  formatDiffValue,
} from '@/lib/resume-studio/resume-comparison.adapter';
import { ResumeComparisonResult, ResumeDiffItem } from '@/types/resume-comparison.types';
import { TailoringPlanDTO, TailoringProposalDTO } from '@/types/tailoring-plan.types';
import { JobMatchResultDTO } from '@/types/job-match.types';
import { JobProfile } from '@/types/job-profile.types';

function createMockDiffResult(overrides: Partial<ResumeComparisonResult> = {}): ResumeComparisonResult {
  return {
    hasChanges: true,
    totalChanges: 1,
    sectionCounts: {
      summary: 1,
      skills: 0,
      experience: 0,
      projects: 0,
      education: 0,
      layout: 0,
    },
    sections: {
      summary: [],
      skills: [],
      experience: [],
      projects: [],
      education: [],
      layout: [],
    },
    changes: [
      {
        id: 'diff-summary-1',
        section: 'summary',
        changeType: 'REWRITTEN',
        title: 'Professional Summary',
        field: 'summary.text',
        masterValue: 'Frontend Developer with React experience.',
        tailoredValue: 'Senior Frontend Engineer with deep React & TypeScript mastery.',
        source: 'TAILORING_PLAN',
        proposalId: 'prop-sum-1',
        proposalTitle: 'Target Senior Frontend Role',
        action: 'REWRITE',
        reason: 'Align summary with Google Senior role requirement',
        requirementIds: ['req-react'],
      },
    ],
    ...overrides,
  };
}

function createMockTailoringPlan(proposals: TailoringProposalDTO[] = []): TailoringPlanDTO {
  return {
    id: 'tp-1',
    userId: 'user-1',
    jobProfileId: 'jp-1',
    sourceProfileVersion: 1,
    jobAnalysisVersion: 1,
    intensity: 'BALANCED',
    status: 'READY',
    planVersion: 1,
    isStale: false,
    summary: {
      totalProposals: proposals.length,
      acceptedCount: proposals.length,
      rejectedCount: 0,
      editedCount: 0,
      pendingCount: 0,
      protectedCount: 0,
    },
    proposals,
    createdAt: '2026-09-26T12:00:00Z',
    updatedAt: '2026-09-26T12:00:00Z',
  };
}

function createMockJobMatch(): JobMatchResultDTO {
  return {
    id: 'jm-1',
    userId: 'user-1',
    jobProfileId: 'jp-1',
    sourceProfileVersion: 1,
    jobAnalysisVersion: 1,
    isStale: false,
    overallMatch: { score: 88, label: 'High Match' },
    summary: {
      totalRequirements: 2,
      proven: 2,
      underrepresented: 0,
      partial: 0,
      related: 0,
      missing: 0,
      insufficient: 0,
      needsReview: 0,
      requiredTotal: 2,
      requiredProven: 2,
    },
    requirementMatches: [
      {
        requirementId: 'req-react',
        name: 'React.js',
        normalizedName: 'react',
        category: 'SKILL',
        importance: 'REQUIRED',
        matchState: 'PROVEN_RELEVANT',
        confidence: 0.96,
        explanation: 'Deep enterprise experience verified',
        evidence: [
          {
            sourceType: 'EXPERIENCE',
            sourceId: 'exp-1',
            label: 'Senior Developer at TechCorp',
            excerpt: 'Architected high-scale React web client',
          },
        ],
      },
    ],
    createdAt: '2026-09-26T12:00:00Z',
    updatedAt: '2026-09-26T12:00:00Z',
  };
}

function createMockJobProfile(): JobProfile {
  return {
    id: 'jp-1',
    userId: 'user-1',
    displayName: 'Google Senior Frontend Engineer',
    jobTitle: 'Senior Frontend Engineer',
    company: 'Google',
    rawDescription: 'React and TypeScript expert needed',
    normalizedDescription: 'React and TypeScript expert needed',
    sourceHash: 'hash-1',
    jobFingerprint: 'fp-1',
    analysisStatus: 'ANALYZED',
    analysisVersion: 1,
    analysis: {
      seniority: 'SENIOR',
      responsibilities: [],
      requirements: [
        {
          name: 'React.js',
          normalizedName: 'react',
          category: 'SKILL',
          importance: 'REQUIRED',
          evidence: { text: 'Expert React knowledge required' },
          confidence: 0.95,
        },
      ],
      experienceRequirements: [],
      educationRequirements: [],
      keywords: ['react', 'typescript'],
    },
    createdAt: '2026-09-26T12:00:00Z',
    updatedAt: '2026-09-26T12:00:00Z',
  };
}

describe('Phase 6E.4 — Pure Resume Comparison Adapter Unit Tests', () => {
  it('01. Formats text modifications into clean Master vs Tailored string pairs', () => {
    const diff = createMockDiffResult();
    const vm = buildResumeComparisonViewModel({
      diffResult: diff,
      resumeId: 'res-tailored-1',
      masterResumeId: 'res-master-1',
    });

    expect(vm.allChanges).toHaveLength(1);
    const change = vm.allChanges[0];
    expect(change.masterValueFormatted).toBe('Frontend Developer with React experience.');
    expect(change.tailoredValueFormatted).toBe('Senior Frontend Engineer with deep React & TypeScript mastery.');
  });

  it('02. Maps PROMOTED skill with proposal rationale and matched requirement', () => {
    const diff: ResumeComparisonResult = {
      hasChanges: true,
      totalChanges: 1,
      sectionCounts: { summary: 0, skills: 1, experience: 0, projects: 0, education: 0, layout: 0 },
      sections: { summary: [], skills: [], experience: [], projects: [], education: [], layout: [] },
      changes: [
        {
          id: 'diff-skill-1',
          section: 'skills',
          changeType: 'PROMOTED',
          title: 'Skill Promoted: React.js',
          entityId: 'skill-react',
          masterValue: 'React.js (Rank 5)',
          tailoredValue: 'React.js (Rank 1)',
          source: 'TAILORING_PLAN',
          proposalId: 'prop-promote-react',
        },
      ],
    };

    const plan = createMockTailoringPlan([
      {
        id: 'prop-promote-react',
        action: 'PROMOTE',
        target: { section: 'SKILLS', field: 'skills', entityId: 'skill-react' },
        title: 'Promote React.js to Primary Skill',
        reason: 'Required core competency for Senior Frontend Engineer',
        requirementIds: ['req-react'],
        evidence: [],
        confidence: 0.95,
        priority: 'HIGH',
        userDecision: 'ACCEPTED',
        isProtected: false,
        createdAt: '2026-09-26T12:00:00Z',
        updatedAt: '2026-09-26T12:00:00Z',
      },
    ]);

    const match = createMockJobMatch();

    const vm = buildResumeComparisonViewModel({
      diffResult: diff,
      resumeId: 'res-tailored-1',
      masterResumeId: 'res-master-1',
      tailoringPlan: plan,
      jobMatch: match,
    });

    const change = vm.allChanges[0];
    expect(change.changeType).toBe('PROMOTED');
    expect(change.proposalTitle).toBe('Promote React.js to Primary Skill');
    expect(change.reason).toBe('Required core competency for Senior Frontend Engineer');
    expect(change.requirementName).toBe('React.js');
    expect(change.matchState).toBe('PROVEN_RELEVANT');
  });

  it('03. Maps REWRITTEN experience bullet with verified evidence excerpts', () => {
    const diff: ResumeComparisonResult = {
      hasChanges: true,
      totalChanges: 1,
      sectionCounts: { summary: 0, skills: 0, experience: 1, projects: 0, education: 0, layout: 0 },
      sections: { summary: [], skills: [], experience: [], projects: [], education: [], layout: [] },
      changes: [
        {
          id: 'diff-bullet-1',
          section: 'experience',
          changeType: 'REWRITTEN',
          title: 'Work Experience · Acme · Bullet 1',
          entityId: 'exp-acme',
          subEntityId: 'b-1',
          masterValue: 'Built web features with React.',
          tailoredValue: 'Engineered high-performance React component library reducing bundle size by 35%.',
          source: 'TAILORING_PLAN',
          proposalId: 'prop-rewrite-bullet',
        },
      ],
    };

    const plan = createMockTailoringPlan([
      {
        id: 'prop-rewrite-bullet',
        action: 'REWRITE',
        target: { section: 'EXPERIENCE', field: 'bullets[0].text', entityId: 'exp-acme', subEntityId: 'b-1' },
        title: 'Quantify Performance Impact',
        reason: 'Highlights measurable impact aligned with job profile',
        requirementIds: ['req-react'],
        evidence: [
          {
            sourceType: 'EXPERIENCE',
            sourceId: 'exp-acme-ev',
            label: 'Tech Lead at Acme Corp',
            excerpt: 'Reduced load times and shrunk bundle size by 35%',
          },
        ],
        confidence: 0.98,
        priority: 'HIGH',
        userDecision: 'ACCEPTED',
        isProtected: false,
        createdAt: '2026-09-26T12:00:00Z',
        updatedAt: '2026-09-26T12:00:00Z',
      },
    ]);

    const vm = buildResumeComparisonViewModel({
      diffResult: diff,
      resumeId: 'res-tailored-1',
      masterResumeId: 'res-master-1',
      tailoringPlan: plan,
    });

    const change = vm.allChanges[0];
    expect(change.evidence).toHaveLength(1);
    expect(change.evidence[0].excerpt).toContain('35%');

    // Also verify evidence drawer view model
    const drawerVM = buildEvidenceDrawerViewModel(change);
    expect(drawerVM.title).toBe(change.title);
    expect(drawerVM.evidence).toEqual(change.evidence);
  });

  it('04. Accurately flags userDecision === "EDITED" as candidate-customized', () => {
    const diff: ResumeComparisonResult = {
      hasChanges: true,
      totalChanges: 1,
      sectionCounts: { summary: 1, skills: 0, experience: 0, projects: 0, education: 0, layout: 0 },
      sections: { summary: [], skills: [], experience: [], projects: [], education: [], layout: [] },
      changes: [
        {
          id: 'diff-edit-1',
          section: 'summary',
          changeType: 'EDITED',
          title: 'Custom Summary Edit',
          masterValue: 'Old summary',
          tailoredValue: 'Candidate edited summary',
          source: 'TAILORING_PLAN',
          proposalId: 'prop-user-edit',
        },
      ],
    };

    const plan = createMockTailoringPlan([
      {
        id: 'prop-user-edit',
        action: 'REWRITE',
        target: { section: 'SUMMARY', field: 'summary.text' },
        title: 'Summary Rewrite',
        reason: 'Align with target',
        requirementIds: [],
        evidence: [],
        confidence: 0.9,
        priority: 'MEDIUM',
        userDecision: 'EDITED',
        userEditedValue: 'Candidate edited summary',
        isProtected: false,
        createdAt: '2026-09-26T12:00:00Z',
        updatedAt: '2026-09-26T12:00:00Z',
      },
    ]);

    const vm = buildResumeComparisonViewModel({
      diffResult: diff,
      resumeId: 'res-tailored-1',
      masterResumeId: 'res-master-1',
      tailoringPlan: plan,
    });

    expect(vm.allChanges[0].isCandidateCustomized).toBe(true);
  });

  it('05. Correctly attributes UNATTRIBUTED changes when proposal link is absent', () => {
    const diff: ResumeComparisonResult = {
      hasChanges: true,
      totalChanges: 1,
      sectionCounts: { summary: 0, skills: 0, experience: 0, projects: 1, education: 0, layout: 0 },
      sections: { summary: [], skills: [], experience: [], projects: [], education: [], layout: [] },
      changes: [
        {
          id: 'diff-proj-unattr',
          section: 'projects',
          changeType: 'CHANGED',
          title: 'Project Tech Stack Updated',
          masterValue: 'React, Node',
          tailoredValue: 'React, Node, Redis',
          source: 'UNATTRIBUTED',
        },
      ],
    };

    const vm = buildResumeComparisonViewModel({
      diffResult: diff,
      resumeId: 'res-tailored-1',
      masterResumeId: 'res-master-1',
      tailoringPlan: null,
    });

    const change = vm.allChanges[0];
    expect(change.source).toBe('UNATTRIBUTED');
    expect(change.proposalId).toBeUndefined();
    expect(change.proposalTitle).toBeUndefined();
    expect(change.reason).toBeUndefined();
  });

  it('06. Groups changes by canonical section (summary, skills, experience, projects, education, layout)', () => {
    const diff: ResumeComparisonResult = {
      hasChanges: true,
      totalChanges: 3,
      sectionCounts: { summary: 1, skills: 1, experience: 1, projects: 0, education: 0, layout: 0 },
      sections: { summary: [], skills: [], experience: [], projects: [], education: [], layout: [] },
      changes: [
        { id: '1', section: 'summary', changeType: 'REWRITTEN', title: 'Summary 1', source: 'TAILORING_PLAN' },
        { id: '2', section: 'skills', changeType: 'ADDED', title: 'Skill 1', source: 'TAILORING_PLAN' },
        { id: '3', section: 'experience', changeType: 'REWRITTEN', title: 'Experience 1', source: 'TAILORING_PLAN' },
      ],
    };

    const vm = buildResumeComparisonViewModel({
      diffResult: diff,
      resumeId: 'res-tailored-1',
      masterResumeId: 'res-master-1',
    });

    expect(vm.changesBySection.summary).toHaveLength(1);
    expect(vm.changesBySection.skills).toHaveLength(1);
    expect(vm.changesBySection.experience).toHaveLength(1);
    expect(vm.changesBySection.projects).toHaveLength(0);
    expect(vm.changesBySection.education).toHaveLength(0);
    expect(vm.changesBySection.layout).toHaveLength(0);
  });

  it('07. Formats scalar differences (company, title, dates, gpa) cleanly', () => {
    expect(formatDiffValue('Senior Software Engineer')).toBe('Senior Software Engineer');
    expect(formatDiffValue(3.9)).toBe('3.9');
    expect(formatDiffValue(true)).toBe('true');
    expect(formatDiffValue(null)).toBeNull();
    expect(formatDiffValue(undefined)).toBeNull();
  });

  it('08. Formats array differences (skills, bullet lists) with exact diff lines', () => {
    const skillsArray = ['TypeScript', 'React', 'Next.js'];
    expect(formatDiffValue(skillsArray)).toBe('TypeScript\nReact\nNext.js');

    const objWithBullets = {
      bullets: ['Led migration from Webpack to Vite', 'Reduced build time by 60%'],
    };
    expect(formatDiffValue(objWithBullets)).toBe('Led migration from Webpack to Vite\nReduced build time by 60%');

    const objWithRole = {
      title: 'Staff Engineer',
      companyName: 'Stripe',
    };
    expect(formatDiffValue(objWithRole)).toBe('Staff Engineer · Stripe');
  });

  it('09. Handles diffResult.totalChanges === 0 by returning empty change lists', () => {
    const emptyDiff: ResumeComparisonResult = {
      hasChanges: false,
      totalChanges: 0,
      sectionCounts: { summary: 0, skills: 0, experience: 0, projects: 0, education: 0, layout: 0 },
      sections: { summary: [], skills: [], experience: [], projects: [], education: [], layout: [] },
      changes: [],
    };

    const vm = buildResumeComparisonViewModel({
      diffResult: emptyDiff,
      resumeId: 'res-tailored-zero',
      masterResumeId: 'res-master-1',
    });

    expect(vm.hasChanges).toBe(false);
    expect(vm.totalChanges).toBe(0);
    expect(vm.allChanges).toHaveLength(0);
    expect(vm.changesBySection.summary).toHaveLength(0);
  });

  it('10. Gracefully handles null jobProfile, jobMatch, or tailoringPlan without failing', () => {
    const diff = createMockDiffResult();

    const vm = buildResumeComparisonViewModel({
      diffResult: diff,
      resumeId: 'res-tailored-1',
      masterResumeId: 'res-master-1',
      tailoringPlan: null,
      jobMatch: null,
      jobProfile: null,
    });

    expect(vm.allChanges).toHaveLength(1);
    expect(vm.targetJobId).toBeNull();
    expect(vm.targetRole).toBeNull();
    expect(vm.targetCompany).toBeNull();
  });

  it('11. Reuses 6E.1 sectionCounts and totalChanges directly without independent recount', () => {
    const mockDiff: ResumeComparisonResult = {
      hasChanges: true,
      totalChanges: 42,
      sectionCounts: { summary: 2, skills: 10, experience: 20, projects: 5, education: 3, layout: 2 },
      sections: { summary: [], skills: [], experience: [], projects: [], education: [], layout: [] },
      changes: [], // Note: even if changes array is smaller or empty, counts must strictly mirror diffResult
    };

    const vm = buildResumeComparisonViewModel({
      diffResult: mockDiff,
      resumeId: 'res-tailored-1',
      masterResumeId: 'res-master-1',
    });

    expect(vm.totalChanges).toBe(42);
    expect(vm.sectionCounts.skills).toBe(10);
    expect(vm.sectionCounts.experience).toBe(20);
  });

  it('12. Ensures Master Resume and Career Profile undergo 0 mutations', () => {
    const diff = createMockDiffResult();
    const plan = createMockTailoringPlan();
    const match = createMockJobMatch();
    const profile = createMockJobProfile();

    const diffBefore = JSON.stringify(diff);
    const planBefore = JSON.stringify(plan);
    const matchBefore = JSON.stringify(match);
    const profileBefore = JSON.stringify(profile);

    buildResumeComparisonViewModel({
      diffResult: diff,
      resumeId: 'res-tailored-1',
      masterResumeId: 'res-master-1',
      tailoringPlan: plan,
      jobMatch: match,
      jobProfile: profile,
    });

    expect(JSON.stringify(diff)).toBe(diffBefore);
    expect(JSON.stringify(plan)).toBe(planBefore);
    expect(JSON.stringify(match)).toBe(matchBefore);
    expect(JSON.stringify(profile)).toBe(profileBefore);
  });

  it('13. Unified mode formats stored diff records without executing a second text-diff algorithm', () => {
    const diff: ResumeComparisonResult = {
      hasChanges: true,
      totalChanges: 1,
      sectionCounts: { summary: 1, skills: 0, experience: 0, projects: 0, education: 0, layout: 0 },
      sections: { summary: [], skills: [], experience: [], projects: [], education: [], layout: [] },
      changes: [
        {
          id: 'diff-layout-1',
          section: 'layout',
          changeType: 'REORDERED',
          title: 'Section Order Adjusted',
          masterValue: { sectionOrder: ['summary', 'experience', 'education', 'skills'] },
          tailoredValue: { sectionOrder: ['summary', 'skills', 'experience', 'education'] },
          source: 'TAILORING_PLAN',
        },
      ],
    };

    const vm = buildResumeComparisonViewModel({
      diffResult: diff,
      resumeId: 'res-tailored-1',
      masterResumeId: 'res-master-1',
    });

    const change = vm.allChanges[0];
    expect(change.masterValueFormatted).toBe('summary → experience → education → skills');
    expect(change.tailoredValueFormatted).toBe('summary → skills → experience → education');
  });

  it('14. Missing evidence or requirement fields render gracefully with empty evidence array', () => {
    const diff: ResumeComparisonResult = {
      hasChanges: true,
      totalChanges: 1,
      sectionCounts: { summary: 0, skills: 1, experience: 0, projects: 0, education: 0, layout: 0 },
      sections: { summary: [], skills: [], experience: [], projects: [], education: [], layout: [] },
      changes: [
        {
          id: 'diff-skill-no-ev',
          section: 'skills',
          changeType: 'ADDED',
          title: 'New Skill: Docker',
          entityId: 'skill-docker',
          source: 'TAILORING_PLAN',
          requirementIds: ['non-existent-req'],
        },
      ],
    };

    const vm = buildResumeComparisonViewModel({
      diffResult: diff,
      resumeId: 'res-tailored-1',
      masterResumeId: 'res-master-1',
      tailoringPlan: createMockTailoringPlan(),
      jobMatch: createMockJobMatch(),
    });

    const change = vm.allChanges[0];
    expect(change.requirementName).toBeUndefined();
    expect(change.matchState).toBeUndefined();
    expect(change.evidence).toEqual([]);
  });
});
