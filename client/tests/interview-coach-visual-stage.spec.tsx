// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  AIInterviewAvatarStage,
  CandidateWebcamMirror,
  ReadyCountdownOverlay,
} from '../components/dashboard/interview-coach/arena';

describe('Visual Stage & Video Mirror — Phase B', () => {
  describe('1. AI Interviewer Persona Stage (AIInterviewAvatarStage.tsx)', () => {
    it('renders with idle status badge and default interviewer title', () => {
      render(
        <AIInterviewAvatarStage
          status="idle"
          interviewerName="SKILLEZO Evaluator"
          roleTitle="React Developer"
        />
      );

      expect(screen.getByText('SKILLEZO Evaluator')).toBeDefined();
      expect(screen.getByText(/React Developer/)).toBeDefined();
      expect(screen.getByTestId('status-idle')).toBeDefined();
    });

    it('renders speaking status and triggers replay / stop callbacks', () => {
      const onReplay = vi.fn();
      const onStop = vi.fn();

      render(
        <AIInterviewAvatarStage
          status="speaking"
          isSpeaking={true}
          onReplayQuestion={onReplay}
          onStopAudio={onStop}
        />
      );

      expect(screen.getByTestId('status-speaking')).toBeDefined();
      expect(screen.getByText(/Speaking question/)).toBeDefined();

      const stopBtn = screen.getByTestId('btn-stop-audio');
      fireEvent.click(stopBtn);
      expect(onStop).toHaveBeenCalledTimes(1);

      const replayBtn = screen.getByTestId('btn-replay-audio');
      fireEvent.click(replayBtn);
      expect(onReplay).toHaveBeenCalledTimes(1);
    });

    it('renders listening and analyzing states accurately', () => {
      const { rerender } = render(<AIInterviewAvatarStage status="listening" />);
      expect(screen.getByTestId('status-listening')).toBeDefined();
      expect(screen.getByText(/Listening to you/)).toBeDefined();

      rerender(<AIInterviewAvatarStage status="analyzing" />);
      expect(screen.getByTestId('status-analyzing')).toBeDefined();
      expect(screen.getByText(/Analyzing response/)).toBeDefined();
    });
  });

  describe('2. Candidate Webcam Mirror Feed (CandidateWebcamMirror.tsx)', () => {
    let originalMediaDevices: MediaDevices;

    const mockTrack = {
      stop: vi.fn(),
      enabled: true,
    };

    const mockStream = {
      getTracks: vi.fn(() => [mockTrack]),
      getVideoTracks: vi.fn(() => [mockTrack]),
      getAudioTracks: vi.fn(() => [mockTrack]),
    } as unknown as MediaStream;

    beforeEach(() => {
      originalMediaDevices = navigator.mediaDevices;
    });

    afterEach(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: originalMediaDevices,
        configurable: true,
      });
    });

    it('handles camera permission failure gracefully without crashing', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: vi.fn().mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError')),
        },
        configurable: true,
      });

      render(<CandidateWebcamMirror candidateName="Alex Candidate" />);

      await waitFor(() => {
        expect(screen.getByTestId('camera-permission-fallback')).toBeDefined();
        expect(screen.getByText(/Camera or microphone access was denied/)).toBeDefined();
      });
    });

    it('initializes stream and allows camera and mic toggling', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: vi.fn().mockResolvedValue(mockStream),
        },
        configurable: true,
      });

      const onCamChange = vi.fn();
      const onMicChange = vi.fn();

      render(
        <CandidateWebcamMirror
          candidateName="John Doe"
          onCameraStateChange={onCamChange}
          onMicStateChange={onMicChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('candidate-video-feed')).toBeDefined();
      });

      expect(screen.getByText('John Doe')).toBeDefined();
      expect(screen.getByText('Local Mirror Only')).toBeDefined();

      // Toggle camera off
      const camBtn = screen.getByTestId('btn-toggle-camera');
      fireEvent.click(camBtn);

      expect(onCamChange).toHaveBeenCalledWith(false);
      expect(screen.getByTestId('camera-off-fallback')).toBeDefined();
      expect(screen.getByText('Camera is turned off')).toBeDefined();

      // Toggle mic
      const micBtn = screen.getByTestId('btn-toggle-mic');
      fireEvent.click(micBtn);
      expect(onMicChange).toHaveBeenCalledWith(false); // muted -> enabled=false
    });
  });

  describe('3. Ready Countdown Overlay (ReadyCountdownOverlay.tsx)', () => {
    it('renders 3-second countdown number, role, and checklist', () => {
      render(
        <ReadyCountdownOverlay
          countdown={3}
          role="React Developer"
        />
      );

      expect(screen.getByTestId('ready-countdown-overlay')).toBeDefined();
      expect(screen.getByTestId('countdown-number').textContent).toBe('3');
      expect(screen.getByText('React Developer')).toBeDefined();
      expect(screen.getByText(/Get Ready • Mock Interview Starting/)).toBeDefined();
    });

    it('renders Let\'s Go! when countdown hits 0', () => {
      render(
        <ReadyCountdownOverlay
          countdown={0}
          role=".NET Microservices Lead"
        />
      );

      expect(screen.getByTestId('countdown-number').textContent).toBe("Let's Go!");
      expect(screen.getByText('.NET Microservices Lead')).toBeDefined();
    });

    it('triggers onSkip callback when skip button is clicked', () => {
      const onSkip = vi.fn();
      render(
        <ReadyCountdownOverlay
          countdown={2}
          role="Python Developer"
          onSkip={onSkip}
        />
      );

      const skipBtn = screen.getByTestId('btn-skip-countdown');
      fireEvent.click(skipBtn);
      expect(onSkip).toHaveBeenCalledTimes(1);
    });
  });
});

