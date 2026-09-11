import React, { useMemo } from 'react';
import { ResumeSkillItem } from '@/types/resume-document';

interface SkillsSectionProps {
  skills?: ResumeSkillItem[];
  isHighlighted?: boolean;
  onClick?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  LANGUAGE: 'Languages',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Databases & Storage',
  CLOUD: 'Cloud & Infrastructure',
  DEVOPS: 'DevOps & CI/CD',
  AI_ML: 'AI & Machine Learning',
  TESTING: 'Testing & QA',
  MOBILE: 'Mobile Development',
  TOOLS: 'Tools & Platforms',
  OTHER: 'Other Skills',
};

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  isHighlighted,
  onClick,
}) => {
  const groupedSkills = useMemo(() => {
    if (!skills || skills.length === 0) return {};

    const groups: Record<string, string[]> = {};
    for (const skill of skills) {
      if (!skill.name) continue;
      const cat = skill.category || 'OTHER';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(skill.name);
    }
    return groups;
  }, [skills]);

  if (!skills || skills.length === 0) return null;

  return (
    <section
      id="resume-section-skills"
      onClick={onClick}
      className={`transition-all duration-200 mb-6 ${
        isHighlighted
          ? 'ring-2 ring-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-lg p-3 -m-3'
          : onClick
          ? 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-lg p-1 -m-1'
          : ''
      }`}
    >
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-700 pb-1 mb-2 font-mono">
        Technical Skills
      </h2>

      <div className="space-y-1.5 text-xs sm:text-sm">
        {Object.entries(groupedSkills).map(([catKey, skillNames]) => (
          <div key={catKey} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100 shrink-0 min-w-[130px]">
              {CATEGORY_LABELS[catKey] || catKey}:
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {skillNames.join(' · ')}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
