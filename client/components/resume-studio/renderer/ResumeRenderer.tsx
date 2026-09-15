'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { ResumeDocument } from '@/types/resume-document';
import { ResumeBuilderConfig, CANONICAL_SECTION_ORDER, ReorderableSectionId } from '@/types/resume-builder.types';
import { ResumeHeader } from './ResumeHeader';
import { SummarySection } from './SummarySection';
import { SkillsSection } from './SkillsSection';
import { ExperienceSection } from './ExperienceSection';
import { ProjectsSection } from './ProjectsSection';
import { EducationSection } from './EducationSection';
import { AchievementsSection } from './AchievementsSection';
import { resolveConfigClasses } from './templates';

export interface ResumeRendererProps {
  document: ResumeDocument;
  highlightSectionId?: string | null;
  onSectionClick?: (sectionId: string) => void;
  interactive?: boolean;
  className?: string;
  config?: ResumeBuilderConfig | null;
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = React.memo(({
  document,
  highlightSectionId,
  onSectionClick,
  interactive = true,
  className = '',
  config,
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

  const sectionHandlers = useMemo(() => {
    if (!interactive || !onSectionClick) return {} as Record<string, () => void>;
    return {
      contact: () => onSectionClick('contact'),
      summary: () => onSectionClick('summary'),
      skills: () => onSectionClick('skills'),
      experience: () => onSectionClick('experience'),
      projects: () => onSectionClick('projects'),
      education: () => onSectionClick('education'),
      achievements: () => onSectionClick('achievements'),
    };
  }, [interactive, onSectionClick]);

  const {
    fontFamilyClass,
    fontSizeClass,
    lineHeightClass,
    pageMarginClass,
  } = resolveConfigClasses(config);

  const sectionOrder: ReorderableSectionId[] =
    config?.sectionOrder && config.sectionOrder.length > 0
      ? config.sectionOrder
      : CANONICAL_SECTION_ORDER;

  // Render individual body section by id with stable memoized handlers
  const renderBodySection = (sectionId: ReorderableSectionId) => {
    switch (sectionId) {
      case 'summary':
        return (
          <SummarySection
            key="summary"
            summary={document.summary}
            isHighlighted={highlightSectionId === 'summary'}
            onClick={sectionHandlers.summary}
            config={config}
          />
        );
      case 'skills':
        return (
          <SkillsSection
            key="skills"
            skills={document.skills}
            isHighlighted={highlightSectionId === 'skills'}
            onClick={sectionHandlers.skills}
            config={config}
          />
        );
      case 'experience':
        return (
          <ExperienceSection
            key="experience"
            experience={document.experience}
            isHighlighted={highlightSectionId === 'experience'}
            onClick={sectionHandlers.experience}
            config={config}
          />
        );
      case 'projects':
        return (
          <ProjectsSection
            key="projects"
            projects={document.projects}
            isHighlighted={highlightSectionId === 'projects'}
            onClick={sectionHandlers.projects}
            config={config}
          />
        );
      case 'education':
        return (
          <EducationSection
            key="education"
            education={document.education}
            isHighlighted={highlightSectionId === 'education'}
            onClick={sectionHandlers.education}
            config={config}
          />
        );
      case 'achievements':
        return (
          <AchievementsSection
            key="achievements"
            achievements={document.achievements}
            isHighlighted={highlightSectionId === 'achievements'}
            onClick={sectionHandlers.achievements}
            config={config}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl max-w-[850px] w-full mx-auto transition-[box-shadow,border-color] duration-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none transform-gpu ${fontFamilyClass} ${fontSizeClass} ${lineHeightClass} ${pageMarginClass} ${className}`}
    >
      {/* 1. Contact & Header (Always structurally first) */}
      <ResumeHeader
        contact={document.contact}
        targetRole={document.targetRole || document.summary?.targetRole}
        isHighlighted={highlightSectionId === 'contact'}
        onClick={sectionHandlers.contact}
        config={config}
      />

      {/* 2. Reorderable Body Sections */}
      {sectionOrder.map((sectionId) => renderBodySection(sectionId))}
    </div>
  );
});

ResumeRenderer.displayName = 'ResumeRenderer';
