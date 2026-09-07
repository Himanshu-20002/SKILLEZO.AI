'use client';

import React from 'react';
import {
  FolderGit2,
  Plus,
  Globe,
  Star,
  Trash2,
  ExternalLink,
  Code2,
  Layers,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { CandidateProject } from '@/services/profile.service';

interface ProjectsPortfolioSectionProps {
  projects?: CandidateProject[];
  onAddProject: () => void;
  onDeleteProject?: (projectId: string) => Promise<void>;
  onSeedProjects?: () => Promise<void>;
}

export const ProjectsPortfolioSection: React.FC<ProjectsPortfolioSectionProps> = ({
  projects = [],
  onAddProject,
  onDeleteProject,
  onSeedProjects,
}) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D5AFE]/20 to-[#00D9C0]/20 flex items-center justify-center text-[#3D5AFE]">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Technical Portfolio & Projects
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#8098FF] border border-[#3D5AFE]/20">
                {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified production apps, GitHub repositories, and full-stack deployments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSeedProjects && (
            <button
              onClick={onSeedProjects}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Sample Projects</span>
            </button>
          )}
          <button
            onClick={onAddProject}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#3D5AFE]/20 hover:opacity-95 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 space-y-4">
          <Code2 className="w-8 h-8 text-slate-400 mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No projects in your portfolio yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Attaching GitHub repositories and live demo links accelerates your Employability Index and unlocks Career GPS Stage 3.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {onSeedProjects && (
              <button
                onClick={onSeedProjects}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] text-white text-xs font-semibold shadow-md hover:opacity-95 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load 3 Sample Projects</span>
              </button>
            )}
            <button
              onClick={onAddProject}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:opacity-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Project</span>
            </button>
          </div>
        </div>
      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, idx) => (
            <div
              key={project._id || idx}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 group hover:shadow-lg ${
                project.featured
                  ? 'bg-gradient-to-b from-amber-500/5 via-white dark:via-slate-900/80 to-transparent border-amber-500/30'
                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-750 hover:border-[#3D5AFE]/30'
              }`}
            >
              <div className="space-y-3">
                {/* Title and Featured Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#3D5AFE] dark:group-hover:text-[#8098FF] transition">
                        {project.title}
                      </h4>
                      {project.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <Star className="w-3 h-3 fill-amber-500" />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {onDeleteProject && (
                    <button
                      onClick={() => onDeleteProject(project._id || project.title)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Remove Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Stack Pills */}
                {project.techStack && project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.techStack.map((tech, techIdx) => (
                      <span
                        key={techIdx}
                        className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-600/50"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Links */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}

                  {project.liveDemoUrl && (
                    <a
                      href={project.liveDemoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20 hover:bg-[#3D5AFE]/20 text-[#3D5AFE] dark:text-[#8098FF] font-medium transition cursor-pointer border border-[#3D5AFE]/20"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Verified Candidate Asset
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
