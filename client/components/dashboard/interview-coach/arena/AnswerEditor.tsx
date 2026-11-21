'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface AnswerEditorProps {
  sessionId: string;
  questionId: string;
  isSubmitting: boolean;
  onSubmit: (answerText: string) => void;
}

export const AnswerEditor: React.FC<AnswerEditorProps> = ({
  sessionId,
  questionId,
  isSubmitting,
  onSubmit,
}) => {
  const draftStorageKey = `skillezo_draft_${sessionId}_${questionId}`;
  const [text, setText] = useState<string>('');
  const [isSavedLocally, setIsSavedLocally] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Restore draft on mount or question change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftStorageKey);
      if (saved) {
        setText(saved);
        setIsSavedLocally(true);
      } else {
        setText('');
        setIsSavedLocally(false);
      }
    } catch {
      setText('');
    }
  }, [draftStorageKey]);

  // Debounced autosave to localStorage
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setText(newText);
      setIsSavedLocally(false);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        try {
          if (newText.trim().length > 0) {
            localStorage.setItem(draftStorageKey, newText);
            setIsSavedLocally(true);
          } else {
            localStorage.removeItem(draftStorageKey);
            setIsSavedLocally(false);
          }
        } catch {}
      }, 300);
    },
    [draftStorageKey]
  );

  const handleSubmit = useCallback(() => {
    if (!text.trim() || isSubmitting) return;

    // Clear local draft upon submission
    try {
      localStorage.removeItem(draftStorageKey);
    } catch {}

    onSubmit(text.trim());
  }, [text, isSubmitting, draftStorageKey, onSubmit]);

  // Handle Ctrl+Enter / Cmd+Enter keyboard submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = text.length;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Your Response
        </label>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {isSavedLocally && (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Draft saved
            </span>
          )}
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
        </div>
      </div>

      <textarea
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
        rows={8}
        placeholder="Structure your answer clearly. Walk through your problem-solving approach, technical decisions, trade-offs, and measurable outcomes..."
        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-sans text-sm sm:text-base leading-relaxed resize-y"
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border font-mono">Enter</kbd> to submit response
        </p>

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting Answer...</span>
            </>
          ) : (
            <>
              <span>Submit & Continue</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

