// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, renderHook, act, waitFor } from '@testing-library/react';
import {
  useFtuxState,
  FtuxWelcomeModal,
  DashboardSpotlightTour,
  FloatingOnboardingDock,
  FTUX_TOUR_STEPS,
  SUPERPOWER_CARDS,
} from '../components/dashboard/ftux';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('First-Time User Experience (FTUX) Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('1. useFtuxState Hook', () => {
    it('initializes with showWelcomeModal=true for a fresh user', () => {
      const { result } = renderHook(() => useFtuxState('test-user-1'));

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.showWelcomeModal).toBe(true);
      expect(result.current.isTourActive).toBe(false);
      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.totalSteps).toBe(4);
    });

    it('dismisses welcome modal and persists to localStorage', () => {
      const { result } = renderHook(() => useFtuxState('test-user-1'));

      act(() => {
        result.current.dismissWelcome();
      });

      expect(result.current.showWelcomeModal).toBe(false);
      const stored = JSON.parse(localStorage.getItem('skillezo_ftux_test-user-1') || '{}');
      expect(stored.hasSeenWelcome).toBe(true);
    });

    it('starts tour correctly from welcome modal', () => {
      const { result } = renderHook(() => useFtuxState('test-user-1'));

      act(() => {
        result.current.startTour();
      });

      expect(result.current.showWelcomeModal).toBe(false);
      expect(result.current.isTourActive).toBe(true);
      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.currentStep.id).toBe(FTUX_TOUR_STEPS[0].id);
    });

    it('navigates next and prev steps, then finishes tour', () => {
      const { result } = renderHook(() => useFtuxState('test-user-1'));

      act(() => {
        result.current.startTour();
      });

      // Next step
      act(() => {
        result.current.nextTourStep();
      });
      expect(result.current.currentStepIndex).toBe(1);

      // Prev step
      act(() => {
        result.current.prevTourStep();
      });
      expect(result.current.currentStepIndex).toBe(0);

      // Step to end
      act(() => {
        result.current.nextTourStep(); // index 1
      });
      act(() => {
        result.current.nextTourStep(); // index 2
      });
      act(() => {
        result.current.nextTourStep(); // index 3 (last)
      });
      expect(result.current.currentStepIndex).toBe(3);

      act(() => {
        result.current.nextTourStep(); // Finish!
      });
      expect(result.current.isTourActive).toBe(false);
      expect(result.current.hasCompletedTour).toBe(true);
    });

    it('allows replaying tour anytime', () => {
      const { result } = renderHook(() => useFtuxState('test-user-1'));

      act(() => {
        result.current.skipTour();
      });
      expect(result.current.isTourActive).toBe(false);

      act(() => {
        result.current.replayTour();
      });
      expect(result.current.isTourActive).toBe(true);
      expect(result.current.currentStepIndex).toBe(0);
    });
  });

  describe('2. FtuxWelcomeModal Component', () => {
    it('renders candidate greeting and welcome token celebration', () => {
      render(
        <FtuxWelcomeModal
          isOpen={true}
          userName="Alex Rivera"
          onStartTour={vi.fn()}
          onDismiss={vi.fn()}
        />
      );

      expect(screen.getByText(/Welcome to SKILLEZO, Alex Rivera!/i)).toBeDefined();
      expect(screen.getByText('+1,000 AI Tokens')).toBeDefined();
      expect(screen.getByTestId('ftux-welcome-modal')).toBeDefined();
    });

    it('cycles superpower carousel slides on prev/next clicks', async () => {
      render(
        <FtuxWelcomeModal
          isOpen={true}
          userName="Alex Rivera"
          onStartTour={vi.fn()}
          onDismiss={vi.fn()}
        />
      );

      // Initial slide is Resume Studio
      expect(screen.getByText('AI Resume Studio')).toBeDefined();

      // Click next
      const nextBtn = screen.getByTestId('ftux-carousel-next');
      fireEvent.click(nextBtn);

      // Second slide is Mock Interview Coach
      await waitFor(() => {
        expect(screen.getByText('AI Mock Interview Coach')).toBeDefined();
      });

      // Click prev
      const prevBtn = screen.getByTestId('ftux-carousel-prev');
      fireEvent.click(prevBtn);

      await waitFor(() => {
        expect(screen.getByText('AI Resume Studio')).toBeDefined();
      });
    });

    it('fires onStartTour when clicking "Take Interactive Tour"', () => {
      const onStart = vi.fn();
      render(
        <FtuxWelcomeModal
          isOpen={true}
          userName="Alex Rivera"
          onStartTour={onStart}
          onDismiss={vi.fn()}
        />
      );

      const tourBtn = screen.getByTestId('ftux-start-tour-btn');
      fireEvent.click(tourBtn);

      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('fires onDismiss and routes on fast-track action click', () => {
      const onDismiss = vi.fn();
      render(
        <FtuxWelcomeModal
          isOpen={true}
          userName="Alex Rivera"
          onStartTour={vi.fn()}
          onDismiss={onDismiss}
        />
      );

      const fastTrackBtn = screen.getByTestId('ftux-fast-track-btn');
      fireEvent.click(fastTrackBtn);

      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(SUPERPOWER_CARDS[0].actionHref);
    });
  });

  describe('3. DashboardSpotlightTour Component', () => {
    it('renders tour popover and target highlight ring when active', () => {
      const step = FTUX_TOUR_STEPS[0];
      render(
        <DashboardSpotlightTour
          isActive={true}
          currentStep={step}
          currentStepIndex={0}
          totalSteps={4}
          onNext={vi.fn()}
          onPrev={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      expect(screen.getByTestId('dashboard-spotlight-tour')).toBeDefined();
      expect(screen.getByTestId('spotlight-popover')).toBeDefined();
      expect(screen.getByText(step.title)).toBeDefined();
      expect(screen.getByText(step.description)).toBeDefined();
      expect(screen.getByText(step.badge)).toBeDefined();
    });

    it('calls onNext when clicking Next button', () => {
      const onNext = vi.fn();
      render(
        <DashboardSpotlightTour
          isActive={true}
          currentStep={FTUX_TOUR_STEPS[0]}
          currentStepIndex={0}
          totalSteps={4}
          onNext={onNext}
          onPrev={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      const nextBtn = screen.getByTestId('spotlight-next-btn');
      fireEvent.click(nextBtn);

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('renders "Finish Tour" on the final step', () => {
      render(
        <DashboardSpotlightTour
          isActive={true}
          currentStep={FTUX_TOUR_STEPS[3]}
          currentStepIndex={3}
          totalSteps={4}
          onNext={vi.fn()}
          onPrev={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      expect(screen.getByText('Finish Tour')).toBeDefined();
    });
  });

  describe('4. FloatingOnboardingDock Component', () => {
    it('renders minimized guide pill with computed progress percent', () => {
      render(
        <FloatingOnboardingDock
          resumesCount={1}
          verifiedSkillsCount={0}
          hasProfileGoal={false}
          onReplayTour={vi.fn()}
          onOpenWelcome={vi.fn()}
        />
      );

      expect(screen.getByTestId('floating-onboarding-dock')).toBeDefined();
      expect(screen.getByTestId('dock-trigger-btn')).toBeDefined();
      // 1 out of 4 is 25%
      expect(screen.getByText('25%')).toBeDefined();
    });

    it('expands drawer on click and exposes replay tour button', () => {
      const onReplay = vi.fn();
      render(
        <FloatingOnboardingDock
          resumesCount={2}
          verifiedSkillsCount={1}
          hasProfileGoal={true}
          onReplayTour={onReplay}
          onOpenWelcome={vi.fn()}
        />
      );

      const triggerBtn = screen.getByTestId('dock-trigger-btn');
      fireEvent.click(triggerBtn);

      expect(screen.getByTestId('onboarding-dock-drawer')).toBeDefined();
      expect(screen.getByText(/3 of 4 milestones unlocked/i)).toBeDefined();

      const replayBtn = screen.getByTestId('dock-replay-tour-btn');
      fireEvent.click(replayBtn);

      expect(onReplay).toHaveBeenCalledTimes(1);
    });
  });
});
