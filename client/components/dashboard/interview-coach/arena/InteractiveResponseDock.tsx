'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Keyboard,
  Send,
  Loader2,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/interview-coach/useSpeechRecognition';
import { analyzeFillerWords } from '@/lib/interview-coach/filler-words';

export interface InteractiveResponseDockProps {
  sessionId: string;
  questionId: string;
  isSubmitting?: boolean;
  onSubmit: (answerText: string) => void;
  isAISpeaking?: boolean;
}

export type InputMode = 'voice' | 'text';

export const InteractiveResponseDock: React.FC<InteractiveResponseDockProps> = ({
  sessionId,
  questionId,
  isSubmitting = false,
  onSubmit,
  isAISpeaking = false,
}) => {
  const [mode, setMode] = useState<InputMode>('voice');
  const [answerText, setAnswerText] = useState<string>('');

  const draftKey = `skillezo_draft_${sessionId}_${questionId}`;

  // Restore draft on mount or when questionId changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        setAnswerText(saved);
      } else {
        setAnswerText('');
      }
    } catch {
      // Ignored
    }
  }, [draftKey]);

  // Handle Speech Recognition
  const {
    isListening,
    isSupported,
    status: speechStatus,
    transcript,
    toggleListening,
    resetTranscript,
    errorMessage: speechError,
  } = useSpeechRecognition({
    initialTranscript: answerText,
    onTranscriptChange: (liveText) => {
      setAnswerText(liveText);
      try {
        localStorage.setItem(draftKey, liveText);
      } catch {
        // Ignored
      }
    },
  });

  // Keep answerText updated and synced to localStorage
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updated = e.target.value;
    setAnswerText(updated);
    try {
      localStorage.setItem(draftKey, updated);
    } catch {
      // Ignored
    }
  };

  // Real-time filler-word analysis
  const fillerAnalysis = useMemo(() => {
    return analyzeFillerWords(answerText);
  }, [answerText]);

  const wordCount = useMemo(() => {
    if (!answerText.trim()) return 0;
    return answerText.trim().split(/\s+/).filter(Boolean).length;
  }, [answerText]);

  // Submit response
  const handleSubmit = useCallback(() => {
    if (!answerText.trim() || isSubmitting) return;

    if (isListening) {
      toggleListening();
    }

    try {
      localStorage.removeItem(draftKey);
    } catch {
      // Ignored
    }

    onSubmit(answerText.trim());
  }, [answerText, isSubmitting, isListening, toggleListening, draftKey, onSubmit]);

  // Hotkey support: Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  // Clear current transcript/answer
  const handleClear = () => {
    setAnswerText('');
    resetTranscript();
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900">
      {/* Mode Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {/* Voice vs Text Segmented Pill */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setMode('voice')}
              data-testid="mode-tab-voice"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                mode === 'voice'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Mic className="h-3.5 w-3.5 text-indigo-500" />
              <span>Voice Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('text')}
              data-testid="mode-tab-text"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                mode === 'text'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Keyboard className="h-3.5 w-3.5 text-slate-500" />
              <span>Text Mode</span>
            </button>
          </div>

          {/* AI Speaking Warning */}
          {isAISpeaking && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 animate-pulse">
              <Sparkles className="h-3 w-3" />
              AI is speaking...
            </span>
          )}
        </div>

        {/* Word Count Indicator */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{answerText.length} chars</span>
        </div>
      </div>

      {/* Voice Mode Command Stage */}
      {mode === 'voice' && (
        <div className="space-y-4 pt-4">
          {/* Large Push-to-Talk Action Center */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-5 text-center dark:border-slate-800 dark:bg-slate-950/40">
            {/* Animated Mic Button */}
            <div className="relative">
              {isListening && (
                <>
                  <div className="absolute -inset-2 animate-ping rounded-full bg-emerald-500/20" />
                  <div className="absolute -inset-4 animate-pulse rounded-full bg-emerald-500/10" />
                </>
              )}

              <button
                type="button"
                onClick={toggleListening}
                disabled={!isSupported || isSubmitting}
                data-testid="btn-toggle-recording"
                className={`relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 ${
                  isListening
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30 ring-4 ring-emerald-400/30'
                    : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-indigo-500/30 hover:opacity-95'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isListening ? (
                  <MicOff className="h-7 w-7 animate-pulse" />
                ) : (
                  <Mic className="h-7 w-7" />
                )}
              </button>
            </div>

            {/* Instruction / Status Label */}
            <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isListening ? 'Listening to your response...' : 'Click microphone to speak answer'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {isListening
                ? 'Speak clearly into your microphone. Words stream live below.'
                : 'Zero-cost browser speech transcription enabled.'}
            </p>

            {/* Unsupported / Error Alert */}
            {(!isSupported || speechStatus === 'denied' || speechError) && (
              <div
                data-testid="speech-error-alert"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-400"
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {speechStatus === 'denied'
                    ? 'Microphone permission denied. Switch to Text Mode or allow permissions in browser.'
                    : !isSupported
                    ? 'Speech recognition is not available in this browser. Please use Text Mode.'
                    : speechError}
                </span>
              </div>
            )}
          </div>

          {/* Live Transcript Box (Editable) */}
          <div className="relative">
            <div className="flex items-center justify-between pb-1.5">
              <label
                htmlFor="speech-transcript-box"
                className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Live Speech Transcript (Editable)
              </label>

              {answerText.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  data-testid="btn-clear-transcript"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>

            <textarea
              id="speech-transcript-box"
              rows={4}
              value={answerText}
              onChange={handleTextChange}
              placeholder="Your spoken words will appear here in real time. You can also edit and refine text before submitting..."
              data-testid="speech-transcript-input"
              className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Real-time Filler Word Pill */}
          {answerText.trim().length > 0 && (
            <div
              data-testid="filler-analysis-pill"
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-2 text-xs dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="flex items-center gap-2">
                {fillerAnalysis.totalCount === 0 ? (
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Clean & articulate (0 filler words)
                  </span>
                ) : fillerAnalysis.hasHighFillerUsage ? (
                  <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    High filler count: {fillerAnalysis.totalCount} detected (
                    {fillerAnalysis.breakdown.map((b) => `${b.word}: ${b.count}`).join(', ')})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    {fillerAnalysis.totalCount} filler{fillerAnalysis.totalCount > 1 ? 's' : ''}:{' '}
                    {fillerAnalysis.breakdown.map((b) => b.word).join(', ')}
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-400">Verbal fluency monitor</span>
            </div>
          )}
        </div>
      )}

      {/* Text Mode Command Stage */}
      {mode === 'text' && (
        <div className="space-y-4 pt-4">
          <div className="relative">
            <textarea
              rows={7}
              value={answerText}
              onChange={handleTextChange}
              placeholder="Structure your answer clearly. Walk through your problem-solving approach, technical decisions, trade-offs, and measurable outcomes..."
              data-testid="text-mode-input"
              className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Submit Action Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
        <span className="text-xs text-slate-400">
          Press <kbd className="rounded border border-slate-300 bg-slate-100 px-1 py-0.5 text-[10px] font-mono dark:border-slate-700 dark:bg-slate-800">Ctrl</kbd> + <kbd className="rounded border border-slate-300 bg-slate-100 px-1 py-0.5 text-[10px] font-mono dark:border-slate-700 dark:bg-slate-800">Enter</kbd> to submit
        </span>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!answerText.trim() || isSubmitting}
          data-testid="btn-submit-answer"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition-all hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting & Scoring...</span>
            </>
          ) : (
            <>
              <span>Submit & Continue</span>
              <Send className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

