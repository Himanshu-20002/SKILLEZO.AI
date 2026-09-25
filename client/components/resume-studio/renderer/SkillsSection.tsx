import React, { useMemo } from 'react';
import { ResumeSkillItem } from '@/types/resume-document';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';
import { resolveConfigClasses } from './templates';
import { groupAndFormatSkills } from '../utils/resume-content.util';

interface SkillsSectionProps {
  skills?: ResumeSkillItem[];
  isHighlighted?: boolean;
  onClick?: () => void;
  config?: ResumeBuilderConfig | null;
}

export const SkillsSection: React.FC<SkillsSectionProps> = React.memo(({
  skills,
  isHighlighted,
  onClick,
  config,
}) => {
  const formattedGroups = useMemo(() => {
    return groupAndFormatSkills(skills);
  }, [skills]);

  if (!formattedGroups || formattedGroups.length === 0) return null;

  const { template, sectionSpacingClass, lineHeightClass } = resolveConfigClasses(config);
  const isCompact = config?.templateId === 'compact';

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
            <span className="text-slate-700 dark:text-slate-300 truncate sm:overflow-visible">
              {group.formattedLine}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
});

SkillsSection.displayName = 'SkillsSection';
