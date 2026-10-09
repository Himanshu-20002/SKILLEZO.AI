import React, { useCallback } from 'react';
import { ResumeProjectItem } from '@/types/resume-document';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';
import { ExternalLink, FolderGit2 } from 'lucide-react';
import { resolveConfigClasses } from './templates';
import { cleanProjectContent } from '../utils/resume-content.util';
import { InlineText } from './InlineText';

interface ProjectsSectionProps {
  projects?: ResumeProjectItem[];
  isHighlighted?: boolean;
  onClick?: () => void;
  config?: ResumeBuilderConfig | null;
  onUpdateProjects?: (updatedProjects: ResumeProjectItem[]) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = React.memo(({
  projects,
  isHighlighted,
  onClick,
  config,
  onUpdateProjects,
}) => {
  if (!projects || projects.length === 0) return null;

  const { template, sectionSpacingClass, lineHeightClass, accentTextClass } = resolveConfigClasses(config);
  const isCompact = config?.templateId === 'compact';

  const handleTitleChange = useCallback((projId: string, newTitle: string) => {
    if (!onUpdateProjects) return;
    const updated = projects.map((p) =>
      p.id === projId ? { ...p, title: newTitle } : p
    );
    onUpdateProjects(updated);
  }, [projects, onUpdateProjects]);

  const handleBulletChange = useCallback((projId: string, bulletIdx: number, newText: string) => {
    if (!onUpdateProjects) return;
    const updated = projects.map((p) => {
      if (p.id !== projId) return p;
      const bullets = [...(p.bullets || [])];
      bullets[bulletIdx] = newText;
      return {
        ...p,
        bullets,
      };
    });
    onUpdateProjects(updated);
  }, [projects, onUpdateProjects]);

  const handleDescriptionChange = useCallback((projId: string, newDesc: string) => {
    if (!onUpdateProjects) return;
    const updated = projects.map((p) =>
      p.id === projId ? { ...p, description: newDesc } : p
    );
    onUpdateProjects(updated);
  }, [projects, onUpdateProjects]);

  return (
    <section
      id="resume-section-projects"
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
        Projects
      </h2>

      <div className={isCompact ? 'space-y-2.5' : 'space-y-3.5'}>
        {projects.map((proj) => {
          const { cleanSummary, cleanBullets } = cleanProjectContent(proj);

          return (
            <div
              key={proj.id}
              className={`space-y-1 break-inside-avoid print:break-inside-avoid ${
                isCompact ? 'text-xs' : 'text-xs sm:text-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  {onUpdateProjects ? (
                    <InlineText
                      value={proj.title}
                      onChange={(val) => handleTitleChange(proj.id, val)}
                      placeholder="Project Title"
                      className="font-bold text-slate-900 dark:text-slate-100"
                    />
                  ) : (
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {proj.title}
                    </span>
                  )}
                  {proj.subtitle && (
                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                      — {proj.subtitle}
                    </span>
                  )}
                </div>

                {/* Project Links */}
                <div className="flex items-center gap-3 text-xs">
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 hover:underline font-medium ${accentTextClass}`}
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {proj.repoUrl && (
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    >
                      <FolderGit2 className="w-3 h-3" />
                      <span>Code</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Technologies */}
              {proj.technologies && proj.technologies.length > 0 && (
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Stack: </span>
                  {proj.technologies.join(' · ')}
                </p>
              )}

              {/* Optional Short Summary (when no bullets or distinct summary) */}
              {cleanSummary && (
                <div className={`text-slate-700 dark:text-slate-300 ${lineHeightClass}`}>
                  {onUpdateProjects ? (
                    <InlineText
                      as="p"
                      multiline={true}
                      value={cleanSummary}
                      onChange={(val) => handleDescriptionChange(proj.id, val)}
                      placeholder="Project description..."
                      className="w-full inline-block text-slate-700 dark:text-slate-300 line-clamp-3"
                    />
                  ) : (
                    <p className="line-clamp-3">{cleanSummary}</p>
                  )}
                </div>
              )}

              {/* Clean Individual Bullet Points (Max 4) */}
              {cleanBullets && cleanBullets.length > 0 && (
                <ul
                  className={`${template.bulletStyle} text-slate-700 dark:text-slate-300 ${lineHeightClass}`}
                >
                  {cleanBullets.map((bullet, idx) => (
                    <li key={idx}>
                      {onUpdateProjects ? (
                        <InlineText
                          as="span"
                          multiline={true}
                          value={bullet}
                          onChange={(val) => handleBulletChange(proj.id, idx, val)}
                          placeholder="Project achievement or impact bullet..."
                          className="w-full inline-block"
                        />
                      ) : (
                        <span>{bullet}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
});

ProjectsSection.displayName = 'ProjectsSection';
