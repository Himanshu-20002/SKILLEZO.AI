import React from 'react';
import { ResumeProjectItem } from '@/types/resume-document';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';
import { ExternalLink, FolderGit2 } from 'lucide-react';
import { resolveConfigClasses } from './templates';

interface ProjectsSectionProps {
  projects?: ResumeProjectItem[];
  isHighlighted?: boolean;
  onClick?: () => void;
  config?: ResumeBuilderConfig | null;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = React.memo(({
  projects,
  isHighlighted,
  onClick,
  config,
}) => {
  if (!projects || projects.length === 0) return null;

  const { template, sectionSpacingClass, lineHeightClass, accentTextClass } = resolveConfigClasses(config);
  const isCompact = config?.templateId === 'compact';

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
          // Parse description and bullets to eliminate duplication and strip raw bullet characters
          const rawDesc = proj.description?.trim() || '';
          const rawBullets = (proj.bullets || []).map((b) => b.trim()).filter(Boolean);

          const splitBullets = (text: string): string[] => {
            return text
              .split(/(?:^|\s+)[•\-\*]\s+|\n+/)
              .map((s) => s.trim().replace(/^[•\-\*]\s*/, ''))
              .filter((s) => s.length > 0);
          };

          let cleanBullets: string[] = [];
          if (rawBullets.length > 0) {
            if (rawBullets.length === 1 && (rawBullets[0].includes('•') || rawBullets[0].includes('\n'))) {
              cleanBullets = splitBullets(rawBullets[0]);
            } else {
              cleanBullets = rawBullets.flatMap(splitBullets);
            }
          } else if (rawDesc) {
            cleanBullets = splitBullets(rawDesc);
          }

          // Deduplicate and cap at max 4 bullets
          const seen = new Set<string>();
          cleanBullets = cleanBullets
            .map((b) => b.replace(/^[•\-\*]\s*/, '').trim())
            .filter((b) => {
              const lower = b.toLowerCase();
              if (!lower || seen.has(lower)) return false;
              seen.add(lower);
              return true;
            })
            .slice(0, 4);

          // Only show description as a short 1-2 line summary if it's NOT a duplicate of the bullets
          let cleanSummary: string | null = null;
          if (rawDesc) {
            const descNorm = rawDesc.replace(/^[•\-\*]\s*/, '').trim().toLowerCase();
            const isBulletList = rawDesc.includes('•') || rawDesc.startsWith('-');
            const isDuplicate = cleanBullets.some((b) => b.toLowerCase() === descNorm);
            if (!isBulletList && !isDuplicate) {
              cleanSummary = rawDesc;
            }
          }

          return (
            <div
              key={proj.id}
              className={`space-y-1 break-inside-avoid print:break-inside-avoid ${
                isCompact ? 'text-xs' : 'text-xs sm:text-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {proj.title}
                  </span>
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

              {/* Optional Short Summary (Max 2 lines) */}
              {cleanSummary && (
                <p className={`text-slate-700 dark:text-slate-300 line-clamp-2 ${lineHeightClass}`}>
                  {cleanSummary}
                </p>
              )}

              {/* Clean Individual Bullet Points (Max 4) */}
              {cleanBullets && cleanBullets.length > 0 && (
                <ul
                  className={`${template.bulletStyle} text-slate-700 dark:text-slate-300 ${lineHeightClass}`}
                >
                  {cleanBullets.map((bullet, idx) => (
                    <li key={idx}>
                      <span>{bullet}</span>
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
