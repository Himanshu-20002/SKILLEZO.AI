// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TailoringPaywallModal } from '../components/job-tailoring/TailoringPaywallModal';
import { CareerMatchView } from '../components/job-matching/CareerMatchView';
import { planService } from '../services/plan.service';

vi.mock('../services/plan.service', () => ({
  planService: {
    getPlanStatus: vi.fn(),
  },
}));

vi.mock('../hooks/useJobMatch', () => ({
  useJobMatch: () => ({
    matchResult: {
      summary: {
        totalRequirements: 5,
        provenCount: 3,
        underrepresentedCount: 1,
        relatedCount: 1,
        missingCount: 0,
        overallScore: 82,
      },
      matches: [],
    },
    loading: false,
    error: null,
    filter: 'ALL',
    setFilter: vi.fn(),
    requiredOnly: false,
    setRequiredOnly: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    filteredMatches: [],
    loadMatch: vi.fn(),
    runMatch: vi.fn(),
  }),
}));

describe('TailoringPaywallModal & Gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TailoringPaywallModal Component', () => {
    it('renders when isOpen is true with headline and pricing options', () => {
      const handleClose = vi.fn();
      render(<TailoringPaywallModal isOpen={true} onClose={handleClose} />);

      expect(screen.getByTestId('tailoring-paywall-modal')).toBeDefined();
      expect(screen.getByText('Unlock 1-Click AI Resume Tailoring')).toBeDefined();
      expect(screen.getByText(/7-Day Job Hunt & Interview Sprint Pass/)).toBeDefined();
      expect(screen.getByText('₹199')).toBeDefined();
      expect(screen.getByText('SKILLEZO Pro (Monthly)')).toBeDefined();
      expect(screen.getByText('₹499/mo')).toBeDefined();

      const sprintBtn = screen.getByTestId('btn-get-sprint-pass');
      expect(sprintBtn.getAttribute('href')).toBe('/dashboard/plan');

      const closeBtn = screen.getByTestId('btn-close-paywall-modal');
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('renders nothing when isOpen is false', () => {
      render(<TailoringPaywallModal isOpen={false} onClose={vi.fn()} />);
      expect(screen.queryByTestId('tailoring-paywall-modal')).toBeNull();
    });
  });

  describe('CareerMatchView Paywall Trigger Integration', () => {
    it('triggers paywall modal when candidate on free tier clicks Generate Tailoring Plan', async () => {
      (planService.getPlanStatus as any).mockResolvedValue({
        tier: 'FREE',
        status: 'ACTIVE',
      });

      const onProceedMock = vi.fn();

      render(
        <CareerMatchView
          jobProfileId="jp_123"
          jobTitle="Senior React Engineer"
          onBack={vi.fn()}
          onProceedToTailoring={onProceedMock}
        />
      );

      // Initially paywall modal is closed
      expect(screen.queryByTestId('tailoring-paywall-modal')).toBeNull();

      const proceedBtn = screen.getByTestId('btn-proceed-to-tailoring');
      fireEvent.click(proceedBtn);

      // Paywall modal opens and onProceedToTailoring is blocked
      await waitFor(() => {
        expect(screen.getByTestId('tailoring-paywall-modal')).toBeDefined();
      });
      expect(onProceedMock).not.toHaveBeenCalled();
    });

    it('allows proceeding to tailoring when candidate is Pro', async () => {
      (planService.getPlanStatus as any).mockResolvedValue({
        tier: 'PRO',
        status: 'ACTIVE',
      });

      const onProceedMock = vi.fn();

      render(
        <CareerMatchView
          jobProfileId="jp_123"
          jobTitle="Senior React Engineer"
          onBack={vi.fn()}
          onProceedToTailoring={onProceedMock}
        />
      );

      await waitFor(() => {
        // Wait for plan check to resolve
      });

      const proceedBtn = screen.getByTestId('btn-proceed-to-tailoring');
      fireEvent.click(proceedBtn);

      await waitFor(() => {
        expect(onProceedMock).toHaveBeenCalledTimes(1);
      });
      expect(screen.queryByTestId('tailoring-paywall-modal')).toBeNull();
    });
  });
});
