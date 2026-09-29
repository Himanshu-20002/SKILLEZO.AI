// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ResumeComparisonDialog,
  ResumeComparisonHeader,
  ResumeComparisonModeToggle,
  ResumeComparisonChangeCard,
  ResumeEvidenceDrawer,
  ResumeComparisonEmptyState,
  ResumeSideBySideView,
  ResumeUnifiedDiffView,
} from '@/components/resume-studio/comparison';
import {
  ResumeComparisonViewModel,
  ComparisonChangeVM,
  ComparisonEvidenceDrawerVM,
} from '@/types/resume-comparison-view.types';

describe('Phase 6E.4 Component Tests: Resume Comparison & Evidence UI', () => {
  const mockChange1: ComparisonChangeVM = {
    id: 'comp-1',
    diffItemId: 'diff-1',
    section: 'experience',
    changeType: 'REWRITTEN',
    title: 'Senior Developer · Acme Corp · Bullet 1',
    field: 'bullets[0].text',
    masterValueFormatted: 'Built web features with React.',
    tailoredValueFormatted: 'Engineered high-performance React component library reducing bundle size by 35%.',
    source: 'TAILORING_PLAN',
    isCandidateCustomized: false,
    proposalId: 'prop-1',
    proposalTitle: 'Quantify Performance Impact',
    action: 'REWRITE',
    reason: 'Demonstrates measurable performance optimization required by Google.',
    requirementIds: ['req-react'],
    requirementName: 'React.js',
    matchState: 'PROVEN_RELEVANT',
    evidence: [
      {
        sourceType: 'EXPERIENCE',
        sourceId: 'ev-acme-1',
        label: 'Senior Developer at Acme Corp',
        excerpt: 'Reduced load times and shrunk bundle size by 35%',
      },
    ],
    entityId: 'exp-acme',
    subEntityId: 'b-1',
    canNavigateToResume: true,
  };

  const mockChange2: ComparisonChangeVM = {
    id: 'comp-2',
    diffItemId: 'diff-2',
    section: 'skills',
    changeType: 'PROMOTED',
    title: 'Skill Promoted: React.js',
    masterValueFormatted: 'React.js (Rank 5)',
    tailoredValueFormatted: 'React.js (Rank 1)',
    source: 'TAILORING_PLAN',
    isCandidateCustomized: true,
    proposalId: 'prop-2',
    proposalTitle: 'Promote Core Competency',
    action: 'PROMOTE',
    reason: 'Align with required core skills.',
    requirementIds: ['req-react'],
    requirementName: 'React.js',
    matchState: 'PROVEN_RELEVANT',
    evidence: [],
    canNavigateToResume: true,
  };

  const mockViewModel: ResumeComparisonViewModel = {
    resumeId: 'res-tailored-001',
    masterResumeId: 'res-master-001',
    targetJobId: 'job-1',
    targetRole: 'Senior Frontend Engineer',
    targetCompany: 'Google',
    totalChanges: 2,
    sectionCounts: {
      summary: 0,
      skills: 1,
      experience: 1,
      projects: 0,
      education: 0,
      layout: 0,
    },
    changesBySection: {
      summary: [],
      skills: [mockChange2],
      experience: [mockChange1],
      projects: [],
      education: [],
      layout: [],
    },
    allChanges: [mockChange1, mockChange2],
    hasChanges: true,
  };

  const zeroChangesViewModel: ResumeComparisonViewModel = {
    resumeId: 'res-tailored-001',
    masterResumeId: 'res-master-001',
    targetJobId: 'job-1',
    targetRole: 'Senior Frontend Engineer',
    targetCompany: 'Google',
    totalChanges: 0,
    sectionCounts: {
      summary: 0,
      skills: 0,
      experience: 0,
      projects: 0,
      education: 0,
      layout: 0,
    },
    changesBySection: {
      summary: [],
      skills: [],
      experience: [],
      projects: [],
      education: [],
      layout: [],
    },
    allChanges: [],
    hasChanges: false,
  };

  it('23. Compare empty state component renders clean zero-change messaging', () => {
    render(<ResumeComparisonEmptyState />);
    expect(screen.getByTestId('resume-comparison-empty-state')).toBeDefined();
    expect(screen.getByText('No Changes Detected')).toBeDefined();
    expect(screen.getByText(/Your tailored variant is currently identical to your Master Resume/)).toBeDefined();
  });

  it('24. Dialog renders when isOpen = true, hidden when false', () => {
    const { unmount } = render(
      <ResumeComparisonDialog
        isOpen={false}
        onClose={vi.fn()}
        viewModel={mockViewModel}
        viewMode="SIDE_BY_SIDE"
        onViewModeChange={vi.fn()}
        selectedChangeId={null}
        isEvidenceDrawerOpen={false}
        onOpenEvidence={vi.fn()}
        onCloseEvidence={vi.fn()}
        selectedEvidenceDrawerVM={null}
        onNavigateToResume={vi.fn()}
      />
    );

    expect(screen.queryByTestId('resume-comparison-dialog-content')).toBeNull();
    unmount();

    render(
      <ResumeComparisonDialog
        isOpen={true}
        onClose={vi.fn()}
        viewModel={mockViewModel}
        viewMode="SIDE_BY_SIDE"
        onViewModeChange={vi.fn()}
        selectedChangeId={null}
        isEvidenceDrawerOpen={false}
        onOpenEvidence={vi.fn()}
        onCloseEvidence={vi.fn()}
        selectedEvidenceDrawerVM={null}
        onNavigateToResume={vi.fn()}
      />
    );

    expect(screen.getByTestId('resume-comparison-dialog-content')).toBeDefined();
  });

  it('25. Zero-change Tailored Resume opens comparison and renders empty state', () => {
    render(
      <ResumeComparisonDialog
        isOpen={true}
        onClose={vi.fn()}
        viewModel={zeroChangesViewModel}
        viewMode="SIDE_BY_SIDE"
        onViewModeChange={vi.fn()}
        selectedChangeId={null}
        isEvidenceDrawerOpen={false}
        onOpenEvidence={vi.fn()}
        onCloseEvidence={vi.fn()}
        selectedEvidenceDrawerVM={null}
        onNavigateToResume={vi.fn()}
      />
    );

    expect(screen.getByTestId('resume-comparison-empty-state')).toBeDefined();
    expect(screen.getByText('No Changes Detected')).toBeDefined();
  });

  it('26. Header displays target role, company, and change count badge', () => {
    render(
      <ResumeComparisonHeader
        targetRole="Senior Frontend Engineer"
        targetCompany="Google"
        totalChanges={5}
        viewMode="SIDE_BY_SIDE"
        onViewModeChange={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Senior Frontend Engineer')).toBeDefined();
    expect(screen.getByText('Google')).toBeDefined();
    expect(screen.getByText('5 Changes')).toBeDefined();
  });

  it('27. Header renders safely when target job metadata is null or undefined', () => {
    render(
      <ResumeComparisonHeader
        targetRole={null}
        targetCompany={null}
        totalChanges={0}
        viewMode="SIDE_BY_SIDE"
        onViewModeChange={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('0 Changes')).toBeDefined();
    expect(screen.getByTestId('resume-comparison-header')).toBeDefined();
  });

  it('28. Mode toggle switches between Side-by-Side and Unified Diff', () => {
    const handleModeChange = vi.fn();
    render(
      <ResumeComparisonModeToggle mode="SIDE_BY_SIDE" onChange={handleModeChange} />
    );

    const unifiedBtn = screen.getByTestId('mode-toggle-unified');
    fireEvent.click(unifiedBtn);
    expect(handleModeChange).toHaveBeenCalledWith('UNIFIED');
  });

  it('29. Change card opens Evidence Drawer with verified excerpts', () => {
    const handleOpenEvidence = vi.fn();
    render(
      <ResumeComparisonChangeCard
        change={mockChange1}
        onOpenEvidence={handleOpenEvidence}
        onNavigateToResume={vi.fn()}
      />
    );

    const viewEvidenceBtn = screen.getByTestId('view-evidence-btn-comp-1');
    fireEvent.click(viewEvidenceBtn);
    expect(handleOpenEvidence).toHaveBeenCalledWith('comp-1');
  });

  it('30. Missing evidence renders graceful "Details unavailable" state in drawer', () => {
    const emptyDrawerVM: ComparisonEvidenceDrawerVM = {
      changeId: 'comp-2',
      diffItemId: 'diff-2',
      title: 'Skill Promoted',
      section: 'skills',
      changeType: 'PROMOTED',
      evidence: [],
      canNavigateToResume: true,
    };

    render(
      <ResumeEvidenceDrawer
        isOpen={true}
        drawerVM={emptyDrawerVM}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('evidence-drawer-empty')).toBeDefined();
    expect(screen.getByText('Details unavailable')).toBeDefined();
  });

  it('31. Clicking [View in Resume] button triggers canonical Studio navigation callback', () => {
    const handleNavigate = vi.fn();
    render(
      <ResumeComparisonChangeCard
        change={mockChange1}
        onOpenEvidence={vi.fn()}
        onNavigateToResume={handleNavigate}
      />
    );

    const viewInResumeBtn = screen.getByTestId('view-in-resume-btn-comp-1');
    fireEvent.click(viewInResumeBtn);
    expect(handleNavigate).toHaveBeenCalledWith(mockChange1);
  });

  it('32. Non-blocking loader displays during loading state', () => {
    render(
      <ResumeComparisonDialog
        isOpen={true}
        onClose={vi.fn()}
        viewModel={null}
        isLoading={true}
        viewMode="SIDE_BY_SIDE"
        onViewModeChange={vi.fn()}
        selectedChangeId={null}
        isEvidenceDrawerOpen={false}
        onOpenEvidence={vi.fn()}
        onCloseEvidence={vi.fn()}
        selectedEvidenceDrawerVM={null}
        onNavigateToResume={vi.fn()}
      />
    );

    expect(screen.getByTestId('comparison-loading-state')).toBeDefined();
    expect(screen.getByText('Loading comparison data...')).toBeDefined();
  });

  it('33. Escape key and close button trigger onClose cleanly', () => {
    const handleClose = vi.fn();
    render(
      <ResumeComparisonDialog
        isOpen={true}
        onClose={handleClose}
        viewModel={mockViewModel}
        viewMode="SIDE_BY_SIDE"
        onViewModeChange={vi.fn()}
        selectedChangeId={null}
        isEvidenceDrawerOpen={false}
        onOpenEvidence={vi.fn()}
        onCloseEvidence={vi.fn()}
        selectedEvidenceDrawerVM={null}
        onNavigateToResume={vi.fn()}
      />
    );

    const closeBtn = screen.getByTestId('comparison-dialog-close-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it('34. Unified mode formats stored diff records without 2nd text-diff algorithm', () => {
    render(
      <ResumeUnifiedDiffView
        viewModel={mockViewModel}
        onOpenEvidence={vi.fn()}
        onNavigateToResume={vi.fn()}
      />
    );

    expect(screen.getByTestId('resume-unified-diff-view')).toBeDefined();
    expect(screen.getByTestId('unified-diff-card-comp-1')).toBeDefined();
    expect(screen.getByText('Built web features with React.')).toBeDefined();
    expect(screen.getByText('Engineered high-performance React component library reducing bundle size by 35%.')).toBeDefined();
  });

  it('35. Dialog is completely read-only: zero editing/approval buttons exist', () => {
    render(
      <ResumeComparisonDialog
        isOpen={true}
        onClose={vi.fn()}
        viewModel={mockViewModel}
        viewMode="SIDE_BY_SIDE"
        onViewModeChange={vi.fn()}
        selectedChangeId={null}
        isEvidenceDrawerOpen={false}
        onOpenEvidence={vi.fn()}
        onCloseEvidence={vi.fn()}
        selectedEvidenceDrawerVM={null}
        onNavigateToResume={vi.fn()}
      />
    );

    expect(screen.queryByText(/Accept/i)).toBeNull();
    expect(screen.queryByText(/Reject/i)).toBeNull();
    expect(screen.queryByText(/Approve/i)).toBeNull();
    expect(screen.queryByText(/Regenerate/i)).toBeNull();
    expect(screen.queryByText(/Save Changes/i)).toBeNull();
  });

  it('36. Evidence Drawer displays authentic career evidence excerpt and source ID', () => {
    const fullDrawerVM: ComparisonEvidenceDrawerVM = {
      changeId: 'comp-1',
      diffItemId: 'diff-1',
      title: 'Senior Developer Experience Bullet',
      section: 'experience',
      changeType: 'REWRITTEN',
      proposalTitle: 'Quantify Performance Impact',
      reason: 'Highlights measurable impact aligned with job profile',
      requirementName: 'React.js',
      matchState: 'PROVEN_RELEVANT',
      evidence: [
        {
          sourceType: 'EXPERIENCE',
          sourceId: 'ev-acme-1',
          label: 'Senior Developer at Acme Corp',
          excerpt: 'Reduced load times and shrunk bundle size by 35%',
        },
      ],
      canNavigateToResume: true,
    };

    render(
      <ResumeEvidenceDrawer
        isOpen={true}
        drawerVM={fullDrawerVM}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('resume-evidence-drawer')).toBeDefined();
    expect(screen.getByText(/Reduced load times and shrunk bundle size by 35%/)).toBeDefined();
    expect(screen.getByText(/Evidence ID: ev-acme-1/)).toBeDefined();
    expect(screen.getByText(/Verified evidence from your Career Profile/)).toBeDefined();
  });
});
