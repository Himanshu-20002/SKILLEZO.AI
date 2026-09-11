'use client';

import React, { useEffect, useRef } from 'react';
import { ResumeDocument } from '@/types/resume-document';
import { ResumeHeader } from './ResumeHeader';
import { SummarySection } from './SummarySection';
import { SkillsSection } from './SkillsSection';
import { ExperienceSection } from './ExperienceSection';
import { ProjectsSection } from './ProjectsSection';
import { EducationSection } from './EducationSection';
import { AchievementsSection } from './AchievementsSection';

export interface ResumeRendererProps {
  document: ResumeDocument;
  highlightSectionId?: string | null;
  onSectionClick?: (sectionId: string) => void;
  interactive?: boolean;
  className?: string;
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({
  document,
  highlightSectionId,
  onSectionClick,
  interactive = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to highlighted section smoothly if container is mounted
  useEffect(() => {
    if (!highlightSectionId || !containerRef.current) return;

    const targetEl = containerRef.current.querySelector(`#resume-section-${highlightSectionId}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [highlightSectionId]);

  if (!document) {
    return (
      <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-sans">
        No resume document available to preview.
      </div>
    );
  }

  const handleSectionClick = (sectionId: string) => {
    if (interactive && onSectionClick) {
      onSectionClick(sectionId);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl max-w-[850px] w-full mx-auto p-6 sm:p-10 lg:p-12 font-sans transition-all duration-300 print:shadow-none print:border-none print:p-0 print:m-0 ${className}`}
    >
      {/* 1. Contact & Header */}
      <ResumeHeader
        contact={document.contact}
        targetRole={document.targetRole || document.summary?.targetRole}
        isHighlighted={highlightSectionId === 'contact'}
        onClick={interactive ? () => handleSectionClick('contact') : undefined}
      />

      {/* 2. Professional Summary */}
      <SummarySection
        summary={document.summary}
        isHighlighted={highlightSectionId === 'summary'}
        onClick={interactive ? () => handleSectionClick('summary') : undefined}
      />

      {/* 3. Technical Skills */}
      <SkillsSection
        skills={document.skills}
        isHighlighted={highlightSectionId === 'skills'}
        onClick={interactive ? () => handleSectionClick('skills') : undefined}
      />

      {/* 4. Work Experience */}
      <ExperienceSection
        experience={document.experience}
        isHighlighted={highlightSectionId === 'experience'}
        onClick={interactive ? () => handleSectionClick('experience') : undefined}
      />

      {/* 5. Projects */}
      <ProjectsSection
        projects={document.projects}
        isHighlighted={highlightSectionId === 'projects'}
        onClick={interactive ? () => handleSectionClick('projects') : undefined}
      />

      {/* 6. Education */}
      <EducationSection
        education={document.education}
        isHighlighted={highlightSectionId === 'education'}
        onClick={interactive ? () => handleSectionClick('education') : undefined}
      />

      {/* 7. Achievements & Certifications */}
      <AchievementsSection
        achievements={document.achievements}
        isHighlighted={highlightSectionId === 'achievements'}
        onClick={interactive ? () => handleSectionClick('achievements') : undefined}
      />
    </div>
  );
};
