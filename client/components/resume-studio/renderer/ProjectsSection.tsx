import React from 'react';
import { ResumeProjectItem } from '@/types/resume-document';
import { ExternalLink, FolderGit2 } from 'lucide-react';

interface ProjectsSectionProps {
  projects?: ResumeProjectItem[];
  isHighlighted?: boolean;
  onClick?: () => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  isHighlighted,
  onClick,
}) => {
  if (!projects || projects.length === 0) return null;

  return (
    <section
      id="resume-section-projects"
      onClick={onClick}
      className={`transition-all duration-200 mb-6 ${
        isHighlighted
          ? 'ring-2 ring-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-lg p-3 -m-3'
          : onClick
          ? 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-lg p-1 -m-1'
          : ''
      }`}
    >
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-700 pb-1 mb-3 font-mono">
        Projects
      </h2>

      <div className="space-y-4">
        {projects.map((proj) => (
          <div key={proj.id} className="space-y-1.5 text-xs sm:text-sm">
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
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
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

            {/* Description */}
            {proj.description && (
              <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {proj.description}
              </p>
            )}

            {/* Bullets */}
            {proj.bullets && proj.bullets.length > 0 && (
              <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {proj.bullets.map((bullet, idx) => (
                  <li key={idx}>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
