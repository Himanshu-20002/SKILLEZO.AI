'use client';

import { useState, useEffect, useCallback } from 'react';
import { FTUX_TOUR_STEPS } from './ftux-steps.config';

export interface FtuxStoredState {
  hasSeenWelcome: boolean;
  hasCompletedTour: boolean;
  completedMilestones: string[];
  isDockMinimized: boolean;
}

const STORAGE_KEY_PREFIX = 'skillezo_ftux_';

export function useFtuxState(userId?: string) {
  const storageKey = `${STORAGE_KEY_PREFIX}${userId || 'guest'}`;

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isDockMinimized, setIsDockMinimized] = useState<boolean>(false);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [hasCompletedTour, setHasCompletedTour] = useState<boolean>(false);

  // Initialize from LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: FtuxStoredState = JSON.parse(raw);
        setHasCompletedTour(!!parsed.hasCompletedTour);
        setCompletedMilestones(parsed.completedMilestones || []);
        setIsDockMinimized(!!parsed.isDockMinimized);

        // If user hasn't seen welcome yet, open it
        if (!parsed.hasSeenWelcome) {
          setShowWelcomeModal(true);
        }
      } else {
        // First time user! Open welcome modal
        setShowWelcomeModal(true);
      }
    } catch (e) {
      console.warn('Failed to parse FTUX state from localStorage:', e);
      setShowWelcomeModal(true);
    } finally {
      setIsInitialized(true);
    }
  }, [storageKey]);

  // Save changes to LocalStorage
  const persistState = useCallback(
    (updates: Partial<FtuxStoredState>) => {
      if (typeof window === 'undefined') return;
      try {
        const raw = localStorage.getItem(storageKey);
        const current: FtuxStoredState = raw
          ? JSON.parse(raw)
          : {
              hasSeenWelcome: false,
              hasCompletedTour: false,
              completedMilestones: [],
              isDockMinimized: false,
            };

        const updated: FtuxStoredState = { ...current, ...updates };
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save FTUX state to localStorage:', e);
      }
    },
    [storageKey]
  );

  const dismissWelcome = useCallback(() => {
    setShowWelcomeModal(false);
    persistState({ hasSeenWelcome: true });
  }, [persistState]);

  const startTour = useCallback(() => {
    setShowWelcomeModal(false);
    setIsTourActive(true);
    setCurrentStepIndex(0);
    persistState({ hasSeenWelcome: true });
  }, [persistState]);

  const nextTourStep = useCallback(() => {
    if (currentStepIndex < FTUX_TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsTourActive(false);
      setHasCompletedTour(true);
      persistState({ hasCompletedTour: true });
    }
  }, [currentStepIndex, persistState]);

  const prevTourStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const skipTour = useCallback(() => {
    setIsTourActive(false);
    setHasCompletedTour(true);
    persistState({ hasCompletedTour: true });
  }, [persistState]);

  const finishTour = useCallback(() => {
    setIsTourActive(false);
    setHasCompletedTour(true);
    persistState({ hasCompletedTour: true });
  }, [persistState]);

  const replayTour = useCallback(() => {
    setIsTourActive(true);
    setCurrentStepIndex(0);
  }, []);

  const openWelcomeModal = useCallback(() => {
    setShowWelcomeModal(true);
  }, []);

  const toggleDock = useCallback(() => {
    setIsDockMinimized((prev) => {
      const next = !prev;
      persistState({ isDockMinimized: next });
      return next;
    });
  }, [persistState]);

  const markMilestone = useCallback(
    (milestoneId: string) => {
      setCompletedMilestones((prev) => {
        if (prev.includes(milestoneId)) return prev;
        const next = [...prev, milestoneId];
        persistState({ completedMilestones: next });
        return next;
      });
    },
    [persistState]
  );

  return {
    isInitialized,
    showWelcomeModal,
    isTourActive,
    currentStepIndex,
    currentStep: FTUX_TOUR_STEPS[currentStepIndex] || FTUX_TOUR_STEPS[0],
    totalSteps: FTUX_TOUR_STEPS.length,
    isDockMinimized,
    completedMilestones,
    hasCompletedTour,
    dismissWelcome,
    startTour,
    nextTourStep,
    prevTourStep,
    skipTour,
    finishTour,
    replayTour,
    openWelcomeModal,
    toggleDock,
    markMilestone,
  };
}
