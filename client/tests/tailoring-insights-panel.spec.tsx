// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  TailoringInsightsPanel,
  TailoringInsightCard,
  TailoringNotAddedSection,
  TailoringSummaryMetrics,
  TailoringInsightsHeader,
} from '@/components/resume-studio/tailoring-insights';
import {
  TailoringInsightsViewModel,
  TailoringInsightItem,
} from '@/types/tailoring-insights.types';

describe('Phase 6E.3 Component Tests: Tailoring Insights UI Panel', () => {
  const mockItem1: TailoringInsightItem = {
    id: 'insight:prop_1',
    category: 'SUMMARY',
    action: 'REWRITE',
    matchState: 'PROVEN_RELEVANT',
    requirementName: 'React 18',
    requirementCategory: 'SKILL',
    importance: 'REQUIRED',
    proposalId: 'prop_1',
    proposalTitle: 'Rewrite Summary for React 18',
    rationale: 'Aligning with target senior frontend role at Google.',
    evidenceSnippet: 'Led React 18 modernization for 10M users.',
    evidenceSource: 'Acme Corp',
    targetSectionKey: 'summary',
    targetEntityId: 'sec_summary',
    isUserEdited: false,
    isUnattributed: false,
    diffItemId: 'diff:summary:text',
    beforeValue: 'General web developer',
    afterValue: 'Senior React 18 Engineer',
  };

  const mockItem2: TailoringInsightItem = {
    id: 'insight:prop_2',
    category: 'SKILLS',
    action: 'PROMOTE',
    matchState: 'PROVEN_UNDERREPRESENTED',
    requirementName: 'TypeScript',
    requirementCategory: 'SKILL',
    importance: 'REQUIRED',
    proposalId: 'prop_2',
    proposalTitle: 'Promote TypeScript in skill hierarchy',
    rationale: 'TypeScript is required by Google JD.',
    evidenceSnippet: null,
    evidenceSource: null,
    targetSectionKey: 'skills',
    targetEntityId: 'skill_ts',
    isUserEdited: true,
    isUnattributed: false,
    diffItemId: 'diff:skills:ts',
    beforeValue: 'React, Node',
    afterValue: 'TypeScript, React, Node',
  };

  const mockNotAddedItem: TailoringInsightItem = {
    id: 'insight:prop_3',
    category: 'NOT_ADDED',
    action: 'DO_NOT_ADD',
    matchState: 'MISSING',
    requirementName: 'Kubernetes',
    requirementCategory: 'TOOL',
    importance: 'PREFERRED',
    proposalId: 'prop_3',
    proposalTitle: 'Omit Kubernetes',
    rationale: 'No Kubernetes evidence exists in candidate profile; omitted to prevent hallucination.',
    evidenceSnippet: null,
    evidenceSource: null,
    targetSectionKey: null,
    isUserEdited: false,
    isUnattributed: false,
  };

  const mockViewModel: TailoringInsightsViewModel = {
    resumeId: 'res_tailored_01',
    targetJobId: 'jp_google_01',
    targetRole: 'Senior Frontend Engineer',
    targetCompany: 'Google',
    summary: {
      totalAppliedChanges: 2,
      matchedRequirements: 2,
      promotedRequirements: 1,
      notAddedRequirements: 1,
      sectionCounts: {
        SUMMARY: 1,
        SKILLS: 1,
        EXPERIENCE: 0,
        PROJECTS: 0,
        NOT_ADDED: 1,
      },
    },
    items: [mockItem1, mockItem2, mockNotAddedItem],
    itemsByCategory: {
      SUMMARY: [mockItem1],
      SKILLS: [mockItem2],
      EXPERIENCE: [],
      PROJECTS: [],
      NOT_ADDED: [mockNotAddedItem],
    },
    notAddedItems: [mockNotAddedItem],
    unattributedChanges: [],
  };

  it('Scenario 18: Panel renders gracefully with full view model data', () => {
    render(
      <TailoringInsightsPanel
        viewModel={mockViewModel}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByRole('region', { name: /tailoring insights panel/i })).toBeDefined();
    expect(screen.getByText('Senior Frontend Engineer')).toBeDefined();
    expect(screen.getAllByText(/at Google/i).length).toBeGreaterThanOrEqual(1);
  });

  it('Scenario 19: Canonical target role and company rendered from metadata in header', () => {
    render(
      <TailoringInsightsHeader
        targetRole="Principal Cloud Architect"
        targetCompany="Amazon Web Services"
        totalChanges={5}
      />
    );

    expect(screen.getByText('Principal Cloud Architect')).toBeDefined();
    expect(screen.getByText(/at Amazon Web Services/i)).toBeDefined();
    expect(screen.getByText(/5 AST Changes Applied/i)).toBeDefined();
  });

  it('Scenario 20: Category filter pills toggle visible cards correctly', () => {
    render(
      <TailoringInsightsPanel
        viewModel={mockViewModel}
        isLoading={false}
        error={null}
      />
    );

    // Initial state: ALL items visible (Summary, Skills, Not Added)
    expect(screen.getByText('React 18')).toBeDefined();
    expect(screen.getByText('TypeScript')).toBeDefined();
    expect(screen.getByText('Kubernetes')).toBeDefined();

    // Click 'Summary' filter pill
    const summaryPill = screen.getByRole('button', { name: /filter by summary/i });
    fireEvent.click(summaryPill);

    // React 18 visible, TypeScript not rendered in Summary list
    expect(screen.getByText('React 18')).toBeDefined();
    expect(screen.queryByText('TypeScript')).toBeNull();

    // Click 'Not Added' filter pill
    const notAddedPill = screen.getByRole('button', { name: /filter by not added/i });
    fireEvent.click(notAddedPill);

    expect(screen.getByText('Kubernetes')).toBeDefined();
    expect(screen.queryByText('React 18')).toBeNull();
  });

  it('Scenario 21: [View in Resume] button invokes onNavigateToSection callback', () => {
    const handleNavigate = vi.fn();

    render(
      <TailoringInsightCard
        item={mockItem1}
        onNavigateToSection={handleNavigate}
      />
    );

    const viewButton = screen.getByRole('button', { name: /view in resume/i });
    expect(viewButton).toBeDefined();

    fireEvent.click(viewButton);
    expect(handleNavigate).toHaveBeenCalledWith('SUMMARY', 'summary', 'sec_summary');
  });

  it('Scenario 22: Not Added section renders intentional omission cards with trust guarantee', () => {
    render(<TailoringNotAddedSection items={[mockNotAddedItem]} />);

    expect(screen.getByText(/Intentionally Not Added/i)).toBeDefined();
    expect(screen.getByText('TRUST GUARANTEE')).toBeDefined();
    expect(screen.getByText('Kubernetes')).toBeDefined();
    expect(screen.getByText(/No Kubernetes evidence exists/i)).toBeDefined();
  });

  it('Scenario 23: Non-blocking skeleton loader displays during loading state', () => {
    render(
      <TailoringInsightsPanel
        viewModel={null}
        isLoading={true}
        error={null}
      />
    );

    const statusRegion = screen.getByRole('status', { name: /loading tailoring insights/i });
    expect(statusRegion).toBeDefined();
    expect(statusRegion.className).toContain('animate-pulse');
  });
});
