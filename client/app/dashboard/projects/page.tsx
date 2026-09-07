'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderGit2,
  Plus,
  Globe,
  Star,
  ExternalLink,
  Code2,
  Sparkles,
  Layers,
  CheckCircle2,
  Rocket,
  Compass,
  Cpu,
  Trash2,
  GitBranch,
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

interface RecommendedProject {
  id: string;
  title: string;
  category: string;
  difficulty: 'Intermediate' | 'Advanced';
  estimatedHours: number;
  description: string;
  techStack: string[];
  keyFeatures: string[];
}

const RECOMMENDED_PROJECTS: RecommendedProject[] = [
  {
    id: 'rec_1',
    title: 'High-Scale Event-Driven Message Broker',
    category: 'Backend & Cloud',
    difficulty: 'Advanced',
    estimatedHours: 24,
    description:
      'Build a distributed event pipeline using Redis Pub/Sub, Node.js worker threads, and Docker with automatic backpressure and dead-letter queues.',
    techStack: ['Node.js', 'Redis', 'Docker', 'TypeScript', 'Jest'],
    keyFeatures: ['Sub-millisecond latency', 'Cluster horizontal scaling', 'Prometheus metrics export'],
  },
  {
    id: 'rec_2',
    title: 'Real-Time Collaborative Markdown Workspace',
    category: 'Full Stack',
    difficulty: 'Intermediate',
    estimatedHours: 18,
    description:
      'Live CRDT-powered collaborative editor with WebSocket sync, GitHub OAuth, and syntax-highlighted export.',
    techStack: ['Next.js 15', 'TypeScript', 'WebSockets', 'Tailwind CSS', 'PostgreSQL'],
    keyFeatures: ['Conflict-free replicated data types (CRDT)', 'Zero-latency cursors', 'Dark mode glassmorphism'],
  },
  {
    id: 'rec_3',
    title: 'AI Resume Keyword & ATS Semantic Analyzer',
    category: 'AI & Data',
    difficulty: 'Advanced',
    estimatedHours: 20,
    description:
      'Vector search and cosine similarity engine comparing uploaded PDFs against job descriptions with real-time scoring.',
    techStack: ['Python', 'FastAPI', 'Next.js', 'OpenAI / Gemini API', 'ChromaDB'],
    keyFeatures: ['Semantic vector embeddings', 'PDF parsing pipeline', 'Score breakdown chart'],
  },
];

export default function ProjectsPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'recommended'>('portfolio');
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

  const handleSeedProjects = async () => {
    try {
      setLoading(true);
      const updated = await profileService.seedSampleProjects();
      setProfile(updated);
      toast.success('Added 3 verified sample projects to your portfolio!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load sample projects');
    } finally {
      setLoading(false);
    }
  };

  const handleImportRecommended = async (rec: RecommendedProject) => {
    try {
      const project: CandidateProject = {
        title: rec.title,
        description: rec.description,
        techStack: rec.techStack,
        githubUrl: `https://github.com/candidate/${rec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        liveDemoUrl: `https://${rec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.vercel.app`,
        featured: rec.difficulty === 'Advanced',
      };
      const updated = await profileService.addProject(project);
      setProfile(updated);
      setActiveTab('portfolio');
      toast.success(`Imported "${rec.title}" to your portfolio!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to import project');
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleSeedProjects}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Load Sample Projects</span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#3D5AFE]/20 hover:opacity-95 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>
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
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  Career GPS Stage 3
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  Unlocked & Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'portfolio'
                ? 'border-[#3D5AFE] text-[#3D5AFE] dark:text-[#8098FF]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>My Portfolio Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recommended')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'recommended'
                ? 'border-[#3D5AFE] text-[#3D5AFE] dark:text-[#8098FF]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Recommended Projects</span>
          </button>
        </div>

        {/* Tab 1: My Portfolio Projects */}
        {activeTab === 'portfolio' && (
          projects.length === 0 ? (
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

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleSeedProjects}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#3D5AFE]/20 hover:opacity-95 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Load 3 Starter Projects</span>
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Project</span>
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
          )
        )}

        {/* Tab 2: AI Recommended Projects */}
        {activeTab === 'recommended' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {RECOMMENDED_PROJECTS.map((rec) => (
              <div
                key={rec.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                      {rec.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ~{rec.estimatedHours} hrs build
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>

                  {/* Key Features checklist */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                      Target Competencies
                    </span>
                    {rec.keyFeatures.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rec.techStack.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleImportRecommended(rec)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-[#3D5AFE]/20 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Import to My Portfolio</span>
                  </button>
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
