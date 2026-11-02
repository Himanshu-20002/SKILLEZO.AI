'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  Circle,
  ExternalLink,
  BookOpen,
  Copy,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { LearningResourceDetail } from '@/types/learning-hub';
import { learningHubService } from '@/services/learning-hub.service';
import { toast } from 'sonner';

interface LessonViewerModalProps {
  resourceId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (resourceId: string, completed: boolean) => void;
}

/**
 * Pure, 100% XSS-immune Markdown renderer using native React nodes
 */
function SafeLessonMarkdown({ content }: { content: string }) {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const renderInline = (text: string): React.ReactNode[] => {
    const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={index} className="font-semibold text-slate-900 dark:text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#3D5AFE] dark:text-[#61DAFB] font-mono text-[11px]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';
  let codeBlockKey = 0;

  let currentList: React.ReactNode[] = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${listKey++}`} className="space-y-1.5 my-3 pl-4 list-disc marker:text-[#3D5AFE]">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Multi-line code block start/end
    if (trimmed.startsWith('```')) {
      flushList();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
        codeBlockLines = [];
      } else {
        inCodeBlock = false;
        const codeText = codeBlockLines.join('\n');
        const blockId = `code-${codeBlockKey++}`;
        elements.push(
          <div
            key={blockId}
            className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-md"
          >
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
              <span className="uppercase text-slate-300 font-semibold">{codeBlockLang || 'code'}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(codeText, blockId)}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {copiedCodeId === blockId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushList();
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-6 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          {trimmed.slice(2)}
        </h1>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2">
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-bold text-[#3D5AFE] dark:text-[#61DAFB] uppercase tracking-wider mt-4 mb-1.5">
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }

    // Unordered lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.replace(/^[-*]\s+/, '');
      currentList.push(
        <li key={`li-${i}`} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {renderInline(itemText)}
        </li>
      );
      continue;
    }

    // Numbered lists
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      flushList();
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <span className="font-semibold text-[#3D5AFE] shrink-0">{numMatch[1]}.</span>
          <div className="flex-1">{renderInline(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed my-2">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className="space-y-1">{elements}</div>;
}

export const LessonViewerModal: React.FC<LessonViewerModalProps> = ({
  resourceId,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const [resource, setResource] = useState<LearningResourceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (isOpen && resourceId) {
      loadResource(resourceId);
    } else {
      setResource(null);
    }
  }, [isOpen, resourceId]);

  const loadResource = async (id: string) => {
    setLoading(true);
    try {
      const data = await learningHubService.getResourceById(id);
      setResource(data);
    } catch {
      toast.error('Failed to load lesson details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompleted = async () => {
    if (!resource) return;
    setIsToggling(true);
    try {
      const res = await learningHubService.toggleResourceProgress(resource.id);
      if (res) {
        setResource((prev) => (prev ? { ...prev, completed: res.completed } : null));
        if (res.completed) {
          toast.success('Lesson marked as completed! Progress updated.');
        } else {
          toast.info('Lesson marked as in-progress.');
        }
        if (onStatusChange) {
          onStatusChange(resource.id, res.completed);
        }
      }
    } catch {
      toast.error('Failed to update progress');
    } finally {
      setIsToggling(false);
    }
  };

  // Safe external URL validator to eliminate javascript: / unsafe protocols
  const safeExternalUrl = resource?.externalUrl && /^https?:\/\//i.test(resource.externalUrl)
    ? resource.externalUrl
    : null;

  if (!isOpen || !resourceId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#61DAFB]">
                  {resource?.category || 'Curriculum'}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {resource?.difficulty || 'Intermediate'}
                </span>
                {resource?.provider && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                    {resource.provider}
                  </span>
                )}
                {resource?.completed && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Completed
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {resource?.title || 'Loading Lesson...'}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#3D5AFE]" />
                  {resource?.estimatedMinutes || 15} Mins Read
                </span>
                <span>•</span>
                <span className="capitalize">{resource?.type.replace('_', ' ') || 'Lesson'}</span>
                {resource?.skills && resource.skills.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-slate-400 dark:text-slate-500 truncate max-w-xs">
                      {resource.skills.join(', ')}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Reading Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#3D5AFE] border-t-transparent animate-spin" />
              <p className="text-xs text-slate-500">Loading lesson content & architecture patterns...</p>
            </div>
          ) : !resource ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              Unable to load lesson details. Please try again.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Markdown Body */}
              {resource.markdown ? (
                <div className="prose dark:prose-invert max-w-none">
                  <SafeLessonMarkdown content={resource.markdown} />
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <BookOpen className="w-8 h-8 text-[#3D5AFE] mx-auto opacity-70" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Curated External Learning Resource
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    This module links to verified reference documentation or video masterclass from{' '}
                    <strong>{resource.provider || 'official publishers'}</strong>.
                  </p>
                  {safeExternalUrl && (
                    <a
                      href={safeExternalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white shadow-sm transition-all"
                    >
                      <span>Open External Resource</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Extra External Link Pill if resource has both markdown and external link */}
              {resource.markdown && safeExternalUrl && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Official Reference & Docs:</span>
                  <a
                    href={safeExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3D5AFE] hover:underline"
                  >
                    <span>View Official Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Verified Learning Unit</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleCompleted}
              disabled={isToggling || !resource}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                resource?.completed
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white shadow-sm'
              }`}
            >
              {resource?.completed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Completed (Click to Undo)</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  <span>Mark as Completed</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

