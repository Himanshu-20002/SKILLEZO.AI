import { describe, it, expect } from 'vitest';
import { computeResumeDiff } from '@/lib/resume-studio/resume-diff';
import { ResumeDocument } from '@/types/resume-document';
import { ResumeComparisonContext, TailoringProposalTrace } from '@/types/resume-comparison.types';

/**
 * Creates a minimal valid canonical ResumeDocument fixture for diff testing.
 */
function createFixture(overrides: Partial<ResumeDocument> = {}): ResumeDocument {
  return {
    id: 'res_master_01',
    userId: 'user_01',
    title: 'Master Resume',
    schemaVersion: '1.0.0',
    isMaster: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    currentVersion: {
      versionId: 'v1',
      versionNumber: 1,
      name: 'Initial Master',
      createdAt: '2026-09-01T00:00:00Z',
    },
    contact: {
      fullName: 'Alex Candidate',
      email: 'alex@example.com',
      links: [],
    },
    summary: {
      text: 'Experienced software engineer specializing in frontend architecture and distributed systems.',
      targetRole: 'Senior Full Stack Engineer',
      yearsOfExperience: 6,
    },
    skills: [
      { id: 'skill_react', name: 'React', category: 'FRONTEND', evidenceIds: ['ev_react'] },
      { id: 'skill_node', name: 'Node.js', category: 'BACKEND', evidenceIds: ['ev_node'] },
      { id: 'skill_next', name: 'Next.js', category: 'FRONTEND', evidenceIds: ['ev_next'] },
      { id: 'skill_ts', name: 'TypeScript', category: 'LANGUAGE', evidenceIds: ['ev_ts'] },
    ],
    experience: [
      {
        id: 'exp_acme',
        companyName: 'Acme Corp',
        jobTitle: 'Senior Frontend Developer',
        location: 'San Francisco, CA',
        startDate: '2023-01',
        isCurrent: true,
        bullets: [
          {
            id: 'b_acme_1',
            text: 'Built scalable web applications using React and TypeScript.',
            evidenceIds: ['ev_b1'],
          },
          {
            id: 'b_acme_2',
            text: 'Maintained and deployed microservices with Docker and Kubernetes.',
            evidenceIds: ['ev_b2'],
          },
        ],
        technologiesUsed: ['React', 'TypeScript', 'Docker'],
      },
    ],
    projects: [
      {
        id: 'proj_evento',
        title: 'Evento Platform',
        description: 'Event management SaaS platform built with modern technologies.',
        technologies: ['Next.js', 'PostgreSQL'],
        bullets: ['Implemented real-time ticket booking using Next.js Server Actions.'],
      },
      {
        id: 'proj_airwave',
        title: 'Airwave Audio',
        description: 'Audio streaming engine.',
        technologies: ['WebAudio', 'React'],
        bullets: ['Engineered low-latency audio processing pipeline.'],
      },
    ],
    education: [
      {
        id: 'edu_stanford',
        institution: 'Stanford University',
        degree: 'B.S. Computer Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2016-09',
        endDate: '2020-06',
        honors: [],
      },
    ],
    achievements: [],
    evidence: [],
    templateConfig: {
      templateId: 'modern',
    },
    ...overrides,
  };
}

describe('Phase 6E.1: Deterministic Master-vs-Tailored Resume Diff Engine', () => {
  // 1. Identity & Immutability Tests
  describe('1. Identity & Immutability Guarantees', () => {
    it('returns zero changes when Master and Tailored documents are identical', () => {
      const master = createFixture();
      const tailored = createFixture();

      const result = computeResumeDiff(master, tailored);

      expect(result.hasChanges).toBe(false);
      expect(result.totalChanges).toBe(0);
      expect(result.changes).toHaveLength(0);
      expect(result.sectionCounts.summary).toBe(0);
      expect(result.sectionCounts.skills).toBe(0);
      expect(result.sectionCounts.experience).toBe(0);
      expect(result.sectionCounts.projects).toBe(0);
      expect(result.sectionCounts.education).toBe(0);
      expect(result.sectionCounts.layout).toBe(0);
    });

    it('guarantees 100% immutability of both master and tailored input ASTs', () => {
      const master = createFixture();
      const tailored = createFixture({
        summary: { text: 'Different tailored summary.' },
      });

      const masterSnapshot = JSON.stringify(master);
      const tailoredSnapshot = JSON.stringify(tailored);

      computeResumeDiff(master, tailored);

      expect(JSON.stringify(master)).toBe(masterSnapshot);
      expect(JSON.stringify(tailored)).toBe(tailoredSnapshot);
    });

    it('ignores irrelevant metadata, timestamps, and key ordering differences', () => {
      const master = createFixture({
        id: 'res_master_01',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      });
      const tailored = createFixture({
        id: 'res_tailored_02',
        createdAt: '2026-09-25T12:00:00Z',
        updatedAt: '2026-09-25T12:00:00Z',
        isMaster: false,
      });

      const result = computeResumeDiff(master, tailored);
      expect(result.hasChanges).toBe(false);
      expect(result.totalChanges).toBe(0);
    });
  });

  // 2. Summary Diff & Traceability
  describe('2. Summary Diff & Traceability', () => {
    it('detects rewritten summary with approved 6C proposal traceability', () => {
      const master = createFixture();
      const tailored = createFixture({
        summary: {
          text: 'Senior Frontend Engineer with deep expertise in production React and Next.js systems.',
        },
      });

      const proposal: TailoringProposalTrace = {
        id: 'prop_summary_01',
        action: 'REWRITE',
        target: { section: 'SUMMARY', field: 'summary.text' },
        title: 'Align summary with Senior Next.js role',
        reason: 'Highlights Next.js candidate evidence required by job profile',
        requirementIds: ['req_nextjs'],
        evidence: [{ sourceType: 'PROJECT', sourceId: 'proj_evento', label: 'Evento Next.js App' }],
        userDecision: 'ACCEPTED',
      };

      const result = computeResumeDiff(master, tailored, { proposals: [proposal] });

      expect(result.hasChanges).toBe(true);
      expect(result.sectionCounts.summary).toBe(1);
      const diff = result.sections.summary[0];
      expect(diff.id).toBe('diff:summary:text');
      expect(diff.changeType).toBe('REWRITTEN');
      expect(diff.source).toBe('TAILORING_PLAN');
      expect(diff.proposalId).toBe('prop_summary_01');
      expect(diff.requirementIds).toEqual(['req_nextjs']);
      expect(diff.evidence).toHaveLength(1);
    });

    it('assigns EDITED when 6C proposal decision was EDITED', () => {
      const master = createFixture();
      const tailored = createFixture({
        summary: { text: 'Custom candidate edited summary text.' },
      });

      const proposal: TailoringProposalTrace = {
        id: 'prop_summary_02',
        action: 'REWRITE',
        target: { section: 'SUMMARY', field: 'summary.text' },
        title: 'Rewrite summary',
        userDecision: 'EDITED',
        userEditedValue: 'Custom candidate edited summary text.',
      };

      const result = computeResumeDiff(master, tailored, { proposals: [proposal] });
      const diff = result.sections.summary[0];
      expect(diff.changeType).toBe('EDITED');
      expect(diff.source).toBe('TAILORING_PLAN');
    });

    it('labels summary change as CHANGED and UNATTRIBUTED when no proposal matches', () => {
      const master = createFixture();
      const tailored = createFixture({
        summary: { text: 'Completely unmapped summary change.' },
      });

      const result = computeResumeDiff(master, tailored, { proposals: [] });
      const diff = result.sections.summary[0];
      expect(diff.changeType).toBe('CHANGED');
      expect(diff.source).toBe('UNATTRIBUTED');
      expect(diff.proposalId).toBeUndefined();
    });

    it('normalizes internal whitespace differences in summary without triggering false diff', () => {
      const master = createFixture({
        summary: { text: 'Experienced   software engineer specializing in frontend  architecture.' },
      });
      const tailored = createFixture({
        summary: { text: 'Experienced software engineer specializing in frontend architecture.' },
      });

      const result = computeResumeDiff(master, tailored);
      expect(result.sectionCounts.summary).toBe(0);
    });
  });

  // 3. Technical Skills Diff
  describe('3. Technical Skills Diff', () => {
    it('detects PROMOTED skill with approved PROMOTE proposal', () => {
      const master = createFixture({
        skills: [
          { id: 'skill_react', name: 'React', category: 'FRONTEND', evidenceIds: [] },
          { id: 'skill_next', name: 'Next.js', category: 'FRONTEND', evidenceIds: [] },
        ],
      });
      // Next.js elevated to index 0
      const tailored = createFixture({
        skills: [
          { id: 'skill_next', name: 'Next.js', category: 'FRONTEND', evidenceIds: [] },
          { id: 'skill_react', name: 'React', category: 'FRONTEND', evidenceIds: [] },
        ],
      });

      const proposal: TailoringProposalTrace = {
        id: 'prop_skill_next',
        action: 'PROMOTE',
        target: { section: 'SKILLS', field: 'skills.list', entityId: 'skill_next' },
        title: 'Promote Next.js to primary skill',
        requirementIds: ['req_nextjs'],
        userDecision: 'ACCEPTED',
      };

      const result = computeResumeDiff(master, tailored, { proposals: [proposal] });
      const nextDiff = result.sections.skills.find((d) => d.entityId === 'skill_next');

      expect(nextDiff).toBeDefined();
      expect(nextDiff?.changeType).toBe('PROMOTED');
      expect(nextDiff?.source).toBe('TAILORING_PLAN');
      expect(nextDiff?.proposalId).toBe('prop_skill_next');
    });

    it('assigns REORDERED and UNATTRIBUTED when skill is moved without an approved proposal', () => {
      const master = createFixture({
        skills: [
          { id: 'skill_react', name: 'React', category: 'FRONTEND', evidenceIds: [] },
          { id: 'skill_node', name: 'Node.js', category: 'BACKEND', evidenceIds: [] },
        ],
      });
      const tailored = createFixture({
        skills: [
          { id: 'skill_node', name: 'Node.js', category: 'BACKEND', evidenceIds: [] },
          { id: 'skill_react', name: 'React', category: 'FRONTEND', evidenceIds: [] },
        ],
      });

      const result = computeResumeDiff(master, tailored, { proposals: [] });
      const nodeDiff = result.sections.skills.find((d) => d.entityId === 'skill_node');

      expect(nodeDiff).toBeDefined();
      expect(nodeDiff?.changeType).toBe('REORDERED');
      expect(nodeDiff?.source).toBe('UNATTRIBUTED'); // Invariant: NOT GENERATION without explicit provenance
    });

    it('reports ADDED as structural fact without implying approved tailoring', () => {
      const master = createFixture({
        skills: [{ id: 'skill_react', name: 'React', category: 'FRONTEND', evidenceIds: [] }],
      });
      const tailored = createFixture({
        skills: [
          { id: 'skill_react', name: 'React', category: 'FRONTEND', evidenceIds: [] },
          { id: 'skill_aws', name: 'AWS', category: 'CLOUD', evidenceIds: [] },
        ],
      });

      const result = computeResumeDiff(master, tailored, { proposals: [] });
      const awsDiff = result.sections.skills.find((d) => d.entityId === 'skill_aws');

      expect(awsDiff).toBeDefined();
      expect(awsDiff?.changeType).toBe('ADDED');
      expect(awsDiff?.source).toBe('UNATTRIBUTED'); // Invariant: ADDED does not mean approved tailoring
    });

    it('safely handles duplicate skill names by disambiguating using stable id', () => {
      const master = createFixture({
        skills: [
          { id: 'skill_js_frontend', name: 'JavaScript', category: 'FRONTEND', evidenceIds: [] },
          { id: 'skill_js_backend', name: 'JavaScript', category: 'BACKEND', evidenceIds: [] },
        ],
      });
      const tailored = createFixture({
        skills: [
          { id: 'skill_js_backend', name: 'JavaScript', category: 'BACKEND', evidenceIds: [] },
          { id: 'skill_js_frontend', name: 'JavaScript', category: 'FRONTEND', evidenceIds: [] },
        ],
      });

      const proposal: TailoringProposalTrace = {
        id: 'prop_js_backend',
        action: 'PROMOTE',
        target: { section: 'SKILLS', field: 'skills.list', entityId: 'skill_js_backend' },
        title: 'Promote Backend JavaScript',
        userDecision: 'ACCEPTED',
      };

      const result = computeResumeDiff(master, tailored, { proposals: [proposal] });
      const promoted = result.sections.skills.find((d) => d.entityId === 'skill_js_backend');
      expect(promoted?.changeType).toBe('PROMOTED');
      expect(promoted?.proposalId).toBe('prop_js_backend');
    });
  });

  // 4. Experience & Bullet Diff
  describe('4. Experience & Bullet Diff', () => {
    it('detects rewritten bullet and traces to matching proposal by subEntityId', () => {
      const master = createFixture();
      const tailored = createFixture({
        experience: [
          {
            ...master.experience[0],
            bullets: [
              {
                id: 'b_acme_1',
                text: 'Engineered high-concurrency production React and Next.js web applications.',
                evidenceIds: ['ev_b1'],
              },
              master.experience[0].bullets[1],
            ],
          },
        ],
      });

      const proposal: TailoringProposalTrace = {
        id: 'prop_exp_bullet_1',
        action: 'REWRITE',
        target: {
          section: 'EXPERIENCE',
          field: 'experience.bullet',
          entityId: 'exp_acme',
          subEntityId: 'b_acme_1',
        },
        title: 'Rewrite bullet to emphasize Next.js production delivery',
        reason: 'Matches Senior Frontend target responsibilities',
        requirementIds: ['req_react', 'req_nextjs'],
        evidence: [{ sourceType: 'EXPERIENCE', sourceId: 'exp_acme', label: 'Acme Senior Developer' }],
        userDecision: 'ACCEPTED',
      };

      const result = computeResumeDiff(master, tailored, { proposals: [proposal] });
      expect(result.sectionCounts.experience).toBe(1);

      const bulletDiff = result.sections.experience[0];
      expect(bulletDiff.id).toBe('diff:experience:exp_acme:bullet:b_acme_1:text');
      expect(bulletDiff.changeType).toBe('REWRITTEN');
      expect(bulletDiff.source).toBe('TAILORING_PLAN');
      expect(bulletDiff.proposalId).toBe('prop_exp_bullet_1');
      expect(bulletDiff.requirementIds).toEqual(['req_react', 'req_nextjs']);
    });

    it('does NOT guess when two bullets have duplicate text; assigns UNATTRIBUTED on ambiguity', () => {
      const master = createFixture({
        experience: [
          {
            id: 'exp_acme',
            companyName: 'Acme Corp',
            jobTitle: 'Developer',
            isCurrent: true,
            bullets: [
              { id: 'b_1', text: 'Implemented REST APIs.', evidenceIds: [] },
              { id: 'b_2', text: 'Implemented REST APIs.', evidenceIds: [] }, // duplicate text
            ],
          },
        ],
      });

      const tailored = createFixture({
        experience: [
          {
            id: 'exp_acme',
            companyName: 'Acme Corp',
            jobTitle: 'Developer',
            isCurrent: true,
            bullets: [
              { id: 'b_1', text: 'Architected GraphQL endpoints.', evidenceIds: [] },
              { id: 'b_2', text: 'Implemented REST APIs.', evidenceIds: [] },
            ],
          },
        ],
      });

      // Ambiguous proposal matching only by text without subEntityId
      const ambiguousProposal: TailoringProposalTrace = {
        id: 'prop_ambiguous',
        action: 'REWRITE',
        target: { section: 'EXPERIENCE', field: 'experience.bullet' },
        title: 'Rewrite API bullet',
        currentValue: 'Implemented REST APIs.',
        userDecision: 'ACCEPTED',
      };

      const result = computeResumeDiff(master, tailored, { proposals: [ambiguousProposal] });
      const bulletDiff = result.sections.experience[0];

      // Invariant: Because multiple bullets shared that text, ambiguity prevents false attribution
      expect(bulletDiff.source).toBe('UNATTRIBUTED');
      expect(bulletDiff.proposalId).toBeUndefined();
    });

    it('detects excluded experience item and marks as EXCLUDED with proposal', () => {
      const master = createFixture();
      const tailored = createFixture({
        experience: [], // excluded Acme experience
      });

      const proposal: TailoringProposalTrace = {
        id: 'prop_exclude_acme',
        action: 'EXCLUDE',
        target: { section: 'EXPERIENCE', field: 'experience.selection', entityId: 'exp_acme' },
        title: 'Exclude Acme role for 1-page brevity',
        userDecision: 'ACCEPTED',
      };

      const result = computeResumeDiff(master, tailored, { proposals: [proposal] });
      const expDiff = result.sections.experience.find((d) => d.entityId === 'exp_acme');

      expect(expDiff).toBeDefined();
      expect(expDiff?.changeType).toBe('EXCLUDED');
      expect(expDiff?.source).toBe('TAILORING_PLAN');
    });

    it('assigns USER_EDIT when confirmed by explicit provenance map', () => {
      const master = createFixture();
      const tailored = createFixture({
        experience: [
          {
            ...master.experience[0],
            bullets: [
              {
                id: 'b_acme_1',
                text: 'Direct manual candidate modification in resume editor.',
                evidenceIds: [],
              },
              master.experience[0].bullets[1],
            ],
          },
        ],
      });

      const diffId = 'diff:experience:exp_acme:bullet:b_acme_1:text';
      const result = computeResumeDiff(master, tailored, {
        provenanceMap: { [diffId]: 'USER_EDIT' },
      });

      const diff = result.sections.experience[0];
      expect(diff.changeType).toBe('USER_EDIT');
      expect(diff.source).toBe('USER_EDIT');
    });

    it('labels manual bullet edit without proposal or provenance as CHANGED and UNATTRIBUTED (NOT USER_EDIT, NOT GENERATION)', () => {
      const master = createFixture();
      const tailored = createFixture({
        experience: [
          {
            ...master.experience[0],
            bullets: [
              {
                id: 'b_acme_1',
                text: 'Built high-scale React and TypeScript web applications.',
                evidenceIds: ['ev_b1'],
              },
              master.experience[0].bullets[1],
            ],
          },
        ],
      });

      const result = computeResumeDiff(master, tailored, { proposals: [] });
      const bulletDiff = result.sections.experience[0];

      expect(bulletDiff.changeType).toBe('CHANGED');
      expect(bulletDiff.source).toBe('UNATTRIBUTED');
      expect(bulletDiff.proposalId).toBeUndefined();
    });
  });

  // 5. Projects & Education Diff
  describe('5. Projects & Education Diff', () => {
    it('detects promoted project moved to primary position', () => {
      const master = createFixture();
      // Airwave moved to position 1
      const tailored = createFixture({
        projects: [master.projects[1], master.projects[0]],
      });

      const proposal: TailoringProposalTrace = {
        id: 'prop_promote_airwave',
        action: 'PROMOTE',
        target: { section: 'PROJECTS', field: 'projects.selection', entityId: 'proj_airwave' },
        title: 'Promote Airwave project',
        userDecision: 'ACCEPTED',
      };

      const result = computeResumeDiff(master, tailored, { proposals: [proposal] });
      const airwaveDiff = result.sections.projects.find((d) => d.entityId === 'proj_airwave');

      expect(airwaveDiff).toBeDefined();
      expect(airwaveDiff?.changeType).toBe('PROMOTED');
      expect(airwaveDiff?.source).toBe('TAILORING_PLAN');
    });

    it('treats null vs undefined honors and dates in Education as schema-equivalent', () => {
      const master = createFixture({
        education: [
          {
            id: 'edu_1',
            institution: 'MIT',
            degree: 'B.S.',
            startDate: undefined,
            honors: [],
          },
        ],
      });
      const tailored = createFixture({
        education: [
          {
            id: 'edu_1',
            institution: 'MIT',
            degree: 'B.S.',
            startDate: undefined,
            honors: undefined,
          },
        ],
      });

      const result = computeResumeDiff(master, tailored);
      expect(result.sectionCounts.education).toBe(0);
    });
  });

  // 6. Layout & Section Order Diff
  describe('6. Layout & Section Order Diff', () => {
    it('detects altered section order with collision-safe diff ID', () => {
      const master = createFixture();
      const tailored = createFixture();

      const masterOrder = ['summary', 'skills', 'experience', 'projects', 'education'];
      const tailoredOrder = ['summary', 'experience', 'skills', 'projects', 'education'];

      const proposal: TailoringProposalTrace = {
        id: 'prop_layout_order',
        action: 'REORDER',
        target: { section: 'SECTION_ORDER', field: 'layout.sectionOrder' },
        title: 'Move experience above skills for senior role',
        userDecision: 'ACCEPTED',
      };

      const result = computeResumeDiff(master, tailored, {
        masterSectionOrder: masterOrder,
        tailoredSectionOrder: tailoredOrder,
        proposals: [proposal],
      });

      expect(result.sectionCounts.layout).toBe(1);
      const layoutDiff = result.sections.layout[0];
      expect(layoutDiff.id).toBe('diff:layout:sectionOrder');
      expect(layoutDiff.changeType).toBe('REORDERED');
      expect(layoutDiff.source).toBe('TAILORING_PLAN');
      expect(layoutDiff.masterValue).toEqual(masterOrder);
      expect(layoutDiff.tailoredValue).toEqual(tailoredOrder);
    });

    it('reports zero layout changes when section orders are identical', () => {
      const master = createFixture();
      const tailored = createFixture();
      const order = ['summary', 'skills', 'experience', 'projects'];

      const result = computeResumeDiff(master, tailored, {
        masterSectionOrder: order,
        tailoredSectionOrder: order,
      });

      expect(result.sectionCounts.layout).toBe(0);
    });
  });
});
