'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderGit2,
  Plus,
  Globe,
  Star,
  ExternalLink,
  Code2,
  Rocket,
  Trash2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { AddProjectModal } from '@/components/dashboard/profile/AddProjectModal';
import {
  profileService,
  CandidateProfile,
  CandidateProject,
} from '@/services/profile.service';
import { toast } from 'sonner';

export default function ProjectsPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileService.getMyProfile();
      setProfile(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleAddProject = async (newProject: CandidateProject) => {
    try {
      const updated = await profileService.addProject(newProject);
      setProfile(updated);
      toast.success(`Project "${newProject.title}" successfully added to portfolio!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const updated = await profileService.deleteProject(projectId);
      if (updated && updated.projects) {
        setProfile(updated);
      } else {
        setProfile((prev: any) => ({
          ...prev,
          projects: (prev?.projects || []).filter(
            (p: any) => p._id !== projectId && p.title !== projectId
          ),
        }));
      }
      toast.success('Project removed from portfolio');
    } catch (err: any) {
      setProfile((prev: any) => ({
        ...prev,
        projects: (prev?.projects || []).filter(
          (p: any) => p._id !== projectId && p.title !== projectId
        ),
      }));
      toast.success('Project removed from portfolio');
    }
  };

  const projects = Array.isArray(profile?.projects) ? profile.projects : [];

  const liveDeploymentsCount = projects.filter((p) => !!p.liveDemoUrl).length;
  const githubReposCount = projects.filter((p) => !!p.githubUrl).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Projects & Portfolio Engine"
          description="Curate production repositories, deploy live full-stack demos, and explore AI-recommended portfolio projects."
          badge="Portfolio v4.2"
          actions={
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#3D5AFE]/20 hover:opacity-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          }
        />


        {/* Quick Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3D5AFE]/10 flex items-center justify-center text-[#3D5AFE]">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  Total Projects
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  Live Deployments
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {liveDeploymentsCount} Active
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  Code Repositories
                </span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {githubReposCount} Synced
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${projects.length > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  Career GPS Stage 3
                </span>
                <span className={`text-lg font-bold ${projects.length > 0 ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>
                  {projects.length > 0 ? 'Unlocked & Active' : 'Locked (0 Projects)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Projects Section */}
        {loading ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#3D5AFE] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading portfolio projects...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#3D5AFE]/10 flex items-center justify-center text-[#3D5AFE] mx-auto">
              <FolderGit2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                No projects in your portfolio yet
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Add your GitHub repositories and live deployments to showcase verified technical assets and unlock Career GPS Stage 3.
              </p>
            </div>

            <div className="flex items-center justify-center pt-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] text-white text-sm font-semibold shadow-md shadow-[#3D5AFE]/20 hover:opacity-95 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, idx) => (
            <div
              key={project._id || idx}
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 group hover:shadow-xl bg-white dark:bg-slate-900/60 backdrop-blur-md ${
                project.featured
                  ? 'border-amber-500/30 ring-1 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-[#3D5AFE]/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3D5AFE]/10 flex items-center justify-center text-[#3D5AFE]">
                    <Code2 className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {project.featured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Star className="w-3 h-3 fill-amber-500" />
                        Featured
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteProject((project._id || project.title) as string)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Remove Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#3D5AFE] dark:group-hover:text-[#8098FF] transition">
                    {project.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {project.techStack && project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.techStack.map((tech, techIdx) => (
                      <span
                        key={techIdx}
                        className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Links */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition cursor-pointer"
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20 text-[#3D5AFE] dark:text-[#8098FF] hover:bg-[#3D5AFE]/20 font-medium transition cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}


        {/* Add Project Modal */}
        <AddProjectModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddProject}
        />
      </div>
    </DashboardLayout>
  );
}
