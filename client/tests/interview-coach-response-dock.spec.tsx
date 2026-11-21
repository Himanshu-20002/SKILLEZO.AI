// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveResponseDock } from '../components/dashboard/interview-coach/arena';

describe('Interactive Response Dock — Phase C', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders in Voice Mode by default with toggle recording button', () => {
    render(
      <InteractiveResponseDock
        sessionId="sess-123"
        questionId="q-456"
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByTestId('mode-tab-voice')).toBeDefined();
    expect(screen.getByTestId('mode-tab-text')).toBeDefined();
    expect(screen.getByTestId('btn-toggle-recording')).toBeDefined();
    expect(screen.getByTestId('speech-transcript-input')).toBeDefined();
  });

  it('switches to Text Mode when clicking Text Mode tab', () => {
    render(
      <InteractiveResponseDock
        sessionId="sess-123"
        questionId="q-456"
        onSubmit={vi.fn()}
      />
    );

    const textTab = screen.getByTestId('mode-tab-text');
    fireEvent.click(textTab);

    expect(screen.getByTestId('text-mode-input')).toBeDefined();
  });

  it('detects verbal filler words and updates word counters in real-time', () => {
    render(
      <InteractiveResponseDock
        sessionId="sess-123"
        questionId="q-456"
        onSubmit={vi.fn()}
      />
    );

    const input = screen.getByTestId('speech-transcript-input');
    fireEvent.change(input, {
      target: { value: 'Um, basically like React 19 handles async actions well.' },
    });

    expect(screen.getByText('9 words')).toBeDefined();
    expect(screen.getByTestId('filler-analysis-pill')).toBeDefined();
    expect(screen.getByText(/High filler count: 3 detected/)).toBeDefined();
  });

  it('triggers onSubmit with trimmed text when Submit & Continue is clicked', () => {
    const onSubmit = vi.fn();
    render(
      <InteractiveResponseDock
        sessionId="sess-123"
        questionId="q-456"
        onSubmit={onSubmit}
      />
    );

    const input = screen.getByTestId('speech-transcript-input');
    fireEvent.change(input, {
      target: { value: 'This is my comprehensive technical answer.' },
    });

    const submitBtn = screen.getByTestId('btn-submit-answer');
    expect(submitBtn).not.toBeNull();
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith('This is my comprehensive technical answer.');
  });

  it('disables submit button when answer text is empty or isSubmitting is true', () => {
    const { rerender } = render(
      <InteractiveResponseDock
        sessionId="sess-123"
        questionId="q-456"
        onSubmit={vi.fn()}
      />
    );

    const submitBtn = screen.getByTestId('btn-submit-answer') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);

    rerender(
      <InteractiveResponseDock
        sessionId="sess-123"
        questionId="q-456"
        isSubmitting={true}
        onSubmit={vi.fn()}
      />
    );
    expect(submitBtn.disabled).toBe(true);
  });
});
