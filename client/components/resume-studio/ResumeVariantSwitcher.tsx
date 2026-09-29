'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Sparkles, Target, Briefcase } from 'lucide-react';
import { ResumeRecord } from '@/types/resume';

export interface ResumeVariantSwitcherProps {
  resumes: ResumeRecord[];
  activeResumeId: string | null;
  onSelectResume: (resumeId: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ResumeVariantSwitcher: React.FC<ResumeVariantSwitcherProps> = ({
  resumes,
  activeResumeId,
  onSelectResume,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Group resumes: strictly 1 canonical Master Resume, all others as tailored variants
  const canonicalMaster =
    resumes.find((r) => r.variantType === 'MASTER' && (r.title === 'Master Resume' || r.storageKey === 'profile-generated')) ||
    resumes.find((r) => r.variantType === 'MASTER') ||
    null;

  const masterResumes = canonicalMaster ? [canonicalMaster] : [];
  const tailoredResumes = resumes.filter((r) => r._id !== canonicalMaster?._id);
  const allOrderedResumes = [...masterResumes, ...tailoredResumes];

  // Currently active resume
  const activeResume = resumes.find((r) => r._id === activeResumeId) || null;
  const isMasterActive = activeResume?.variantType === 'MASTER';

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (resumeId: string) => {
      setIsOpen(false);
      if (resumeId !== activeResumeId) {
        onSelectResume(resumeId);
      }
      buttonRef.current?.focus();
    },
    [activeResumeId, onSelectResume]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        const activeIdx = allOrderedResumes.findIndex((r) => r._id === activeResumeId);
        setFocusedIndex(activeIdx >= 0 ? activeIdx : 0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % allOrderedResumes.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + allOrderedResumes.length) % allOrderedResumes.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < allOrderedResumes.length) {
          handleSelect(allOrderedResumes[focusedIndex]._id);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Switch resume"
        className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
          isMasterActive
            ? 'bg-amber-500/5 hover:bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/30'
            : 'bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 border-indigo-500/30'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="flex items-center gap-1.5 truncate max-w-[140px] sm:max-w-[180px]">
          {isMasterActive ? (
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
          ) : (
            <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0" aria-hidden="true" />
          )}
          <span className="truncate">
            {activeResume?.title || (isMasterActive ? 'Master Resume' : 'Tailored Resume')}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          aria-label="Available resumes"
          className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-1.5 focus:outline-hidden max-h-96 overflow-y-auto"
        >
          {/* Section 1: Master Resume */}
          {masterResumes.length > 0 && (
            <li role="presentation">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Master Resume
              </div>
              <ul role="group" aria-label="Master Resume" className="space-y-0.5">
                {masterResumes.map((resume) => {
                  const isSelected = resume._id === activeResumeId;
                  const itemIndex = allOrderedResumes.findIndex((r) => r._id === resume._id);
                  const isFocused = itemIndex === focusedIndex;

                  return (
                    <li
                      key={resume._id}
                      role="option"
                      aria-selected={isSelected}
                      aria-current={isSelected ? 'true' : undefined}
                      onClick={() => handleSelect(resume._id)}
                      onMouseEnter={() => setFocusedIndex(itemIndex)}
                      className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors text-xs ${
                        isFocused ? 'bg-amber-500/10' : ''
                      } ${isSelected ? 'font-bold text-amber-900 dark:text-amber-300' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
                        <div className="truncate">
                          <div className="truncate font-semibold">{resume.title || 'Master Resume'}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            Source: Career Profile
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-amber-500 shrink-0 ml-2" aria-hidden="true" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          )}

          {/* Divider if both exist */}
          {masterResumes.length > 0 && tailoredResumes.length > 0 && (
            <li role="separator" className="my-1 border-t border-slate-100 dark:border-slate-800" />
          )}

          {/* Section 2: Tailored Resumes */}
          {tailoredResumes.length > 0 && (
            <li role="presentation">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Tailored Resumes
              </div>
              <ul role="group" aria-label="Tailored Resumes" className="space-y-0.5">
                {tailoredResumes.map((resume) => {
                  const isSelected = resume._id === activeResumeId;
                  const itemIndex = allOrderedResumes.findIndex((r) => r._id === resume._id);
                  const isFocused = itemIndex === focusedIndex;
                  const targetJob = resume.targetJobTitle || resume.targetCompany
                    ? `${resume.targetJobTitle || ''}${resume.targetJobTitle && resume.targetCompany ? ' · ' : ''}${resume.targetCompany || ''}`
                    : null;

                  return (
                    <li
                      key={resume._id}
                      role="option"
                      aria-selected={isSelected}
                      aria-current={isSelected ? 'true' : undefined}
                      onClick={() => handleSelect(resume._id)}
                      onMouseEnter={() => setFocusedIndex(itemIndex)}
                      className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors text-xs ${
                        isFocused ? 'bg-indigo-500/10' : ''
                      } ${isSelected ? 'font-bold text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0" aria-hidden="true" />
                        <div className="truncate">
                          <div className="truncate font-semibold">{resume.title || 'Tailored Resume'}</div>
                          {targetJob && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                              <Briefcase className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <span className="truncate">{targetJob}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-500 shrink-0 ml-2" aria-hidden="true" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          )}

          {allOrderedResumes.length === 0 && (
            <li role="presentation" className="px-4 py-3 text-center text-xs text-slate-500 dark:text-slate-400">
              No resume variants available.
            </li>
          )}
        </ul>
      )}
    </div>
  );
};
