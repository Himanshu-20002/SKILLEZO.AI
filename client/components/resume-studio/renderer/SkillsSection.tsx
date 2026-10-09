import React, { useMemo, useCallback } from 'react';
import { ResumeSkillItem } from '@/types/resume-document';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';
import { resolveConfigClasses } from './templates';
import { groupAndFormatSkills, CATEGORY_LABELS } from '../utils/resume-content.util';
import { InlineText } from './InlineText';

interface SkillsSectionProps {
  skills?: ResumeSkillItem[];
  isHighlighted?: boolean;
  onClick?: () => void;
  config?: ResumeBuilderConfig | null;
  onUpdateSkills?: (updatedSkills: ResumeSkillItem[]) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = React.memo(({
  skills,
  isHighlighted,
  onClick,
  config,
  onUpdateSkills,
}) => {
  const formattedGroups = useMemo(() => {
    return groupAndFormatSkills(skills);
  }, [skills]);

  const { template, sectionSpacingClass, lineHeightClass } = resolveConfigClasses(config);
  const isCompact = config?.templateId === 'compact';

  const handleSkillsChange = useCallback((groupLabel: string, categoryKey: string, newLine: string) => {
    if (!onUpdateSkills) return;

    // Split by dot/bullet/comma/pipe
    const newNames = newLine
      .split(/[·•,|/]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const currentSkills = skills || [];

    // Filter out skills belonging to this group
    const remainingSkills = currentSkills.filter((s) => {
      const rawCat = (s.category || 'OTHER').toUpperCase();
      const mappedLabel = CATEGORY_LABELS[rawCat] || 'Other Skills';
      return mappedLabel !== groupLabel;
    });

    // Create updated skills for this category
    const catEnum: ResumeSkillItem['category'] = (() => {
      const l = groupLabel.toLowerCase();
      if (l.includes('language')) return 'LANGUAGE';
      if (l.includes('front')) return 'FRONTEND';
      if (l.includes('back')) return 'BACKEND';
      if (l.includes('data')) return 'DATABASE';
      if (l.includes('cloud') || l.includes('devops')) return 'CLOUD';
      if (l.includes('ai') || l.includes('tool')) return 'AI_ML';
      if (l.includes('test')) return 'TESTING';
      if (l.includes('mobile')) return 'MOBILE';
      return 'OTHER';
    })();

    const updatedCategorySkills: ResumeSkillItem[] = newNames.map((name) => {
      const existing = currentSkills.find(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      );
      return {
        id: existing?.id || `skill-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name,
        category: catEnum,
        proficiency: existing?.proficiency || 'INTERMEDIATE',
        evidenceIds: existing?.evidenceIds || [],
      };
    });

    onUpdateSkills([...remainingSkills, ...updatedCategorySkills]);
  }, [skills, onUpdateSkills]);

  if ((!formattedGroups || formattedGroups.length === 0) && !onUpdateSkills) return null;

  return (
    <section
      id="resume-section-skills"
      onClick={onClick}
      className={`transition-all duration-200 break-inside-avoid print:break-inside-avoid ${sectionSpacingClass} ${
        isHighlighted
          ? 'ring-2 ring-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-lg p-3 -m-3'
          : onClick
          ? 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-lg p-1 -m-1'
          : ''
      }`}
    >
      <h2 className={template.sectionHeaderStyle}>
        Technical Skills
      </h2>

      <div className={`${isCompact ? 'space-y-1 text-xs' : 'space-y-1.5'} ${lineHeightClass}`}>
        {formattedGroups.map((group) => (
          <div key={group.label} className="grid grid-cols-[130px_1fr] items-baseline gap-x-3 py-0.5">
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-left shrink-0">
              {group.label}:
            </span>
            {onUpdateSkills ? (
              <InlineText
                value={group.formattedLine}
                onChange={(newLine) => handleSkillsChange(group.label, group.categoryKey, newLine)}
                placeholder="Skill 1 · Skill 2 · Skill 3..."
                className="text-slate-700 dark:text-slate-300 w-full inline-block"
              />
            ) : (
              <span className="text-slate-700 dark:text-slate-300 truncate sm:overflow-visible">
                {group.formattedLine}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
});

SkillsSection.displayName = 'SkillsSection';
