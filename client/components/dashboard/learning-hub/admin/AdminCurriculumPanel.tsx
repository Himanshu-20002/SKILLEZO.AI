'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  ChevronRight,
  ArrowLeft,
  X,
  FileText,
  Video,
  Shield,
  Search,
  Sparkles,
  Save,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { learningHubService } from '@/services/learning-hub.service';
import {
  AdminTrackDetail,
  AdminTrackModule,
  ResourceSummary,
  CreateTrackInput,
  CreateModuleInput,
  CreateResourceInput,
  LearningDifficulty,
} from '@/types/learning-hub';
import { LessonViewerModal } from '../LessonViewerModal';
import { platformRolesService } from '@/services/platform-roles.service';

const CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'Cloud',
  'DevOps',
  'System Design',
  'AI/ML',
] as const;

const TARGET_ROLES = [
  'Full-Stack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'AI/ML Specialist',
  'DevOps & Cloud Engineer',
  'Mobile App Developer',
];

export const AdminCurriculumPanel: React.FC = () => {
  const [tracks, setTracks] = useState<AdminTrackDetail[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>(TARGET_ROLES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<AdminTrackDetail | null>(null);

  // Modals state
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<AdminTrackDetail | null>(null);

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<AdminTrackModule | null>(null);

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [editingResource, setEditingResource] = useState<{
    id?: string;
    moduleId: string;
    title: string;
    type: 'lesson' | 'external_doc' | 'external_video';
    category: string;
    skills: string[];
    difficulty: LearningDifficulty;
    estimatedMinutes: number;
    provider: string;
    markdown: string;
    externalUrl: string;
  } | null>(null);

  const [previewResourceId, setPreviewResourceId] = useState<string | null>(null);

  // Track Form state
  const [trackForm, setTrackForm] = useState<CreateTrackInput>({
    title: '',
    category: 'Frontend',
    description: '',
    targetRoles: ['Full-Stack Engineer'],
    targetSkills: ['TypeScript', 'React'],
    difficulty: 'intermediate',
    estimatedMinutes: 120,
    accentColor: '#3D5AFE',
    published: true,
  });

  // Module Form state
  const [moduleForm, setModuleForm] = useState<CreateModuleInput>({
    title: '',
    description: '',
  });

  // Resource Form state
  const [resourceTab, setResourceTab] = useState<'write' | 'preview'>('write');

  useEffect(() => {
    loadTracks();
    platformRolesService.getActiveRoles().then((r) => {
      if (r && r.length > 0) setAvailableRoles(r.map((x) => x.name));
    }).catch(() => {});
  }, []);

  const loadTracks = async () => {
    setLoading(true);
    try {
      const data = await learningHubService.adminListTracks();
      setTracks(data);
      if (selectedTrack) {
        const fresh = data.find((t) => t.id === selectedTrack.id);
        setSelectedTrack(fresh || null);
      }
    } catch {
      toast.error('Failed to load curriculum tracks');
    } finally {
      setLoading(false);
    }
  };

  // Track Actions
  const handleOpenCreateTrack = () => {
    setEditingTrack(null);
    setTrackForm({
      title: '',
      category: 'Frontend',
      description: '',
      targetRoles: ['Full-Stack Engineer'],
      targetSkills: ['TypeScript'],
      difficulty: 'intermediate',
      estimatedMinutes: 120,
      accentColor: '#3D5AFE',
      published: true,
    });
    setIsTrackModalOpen(true);
  };

  const handleOpenEditTrack = (track: AdminTrackDetail) => {
    setEditingTrack(track);
    setTrackForm({
      title: track.title,
      category: track.category,
      description: track.description,
      targetRoles: track.targetRoles,
      targetSkills: track.targetSkills,
      difficulty: track.difficulty,
      estimatedMinutes: track.estimatedMinutes,
      accentColor: track.accentColor,
      published: track.published,
    });
    setIsTrackModalOpen(true);
  };

  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackForm.title.trim() || !trackForm.description.trim()) {
      toast.error('Please enter title and description');
      return;
    }

    try {
      if (editingTrack) {
        await learningHubService.adminUpdateTrack(editingTrack.id, trackForm);
        toast.success(`Track '${trackForm.title}' updated successfully`);
      } else {
        await learningHubService.adminCreateTrack(trackForm);
        toast.success(`Track '${trackForm.title}' created successfully`);
      }
      setIsTrackModalOpen(false);
      await loadTracks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save track');
    }
  };

  const handleDeleteTrack = async (track: AdminTrackDetail) => {
    if (!confirm(`Are you sure you want to delete track "${track.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await learningHubService.adminDeleteTrack(track.id);
      toast.success(`Track "${track.title}" deleted`);
      if (selectedTrack?.id === track.id) {
        setSelectedTrack(null);
      }
      await loadTracks();
    } catch {
      toast.error('Failed to delete track');
    }
  };

  // Module Actions
  const handleOpenAddModule = () => {
    setEditingModule(null);
    setModuleForm({ title: '', description: '' });
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: AdminTrackModule) => {
    setEditingModule(mod);
    setModuleForm({ title: mod.title, description: mod.description || '' });
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrack) return;
    if (!moduleForm.title.trim()) {
      toast.error('Module title is required');
      return;
    }

    try {
      if (editingModule) {
        await learningHubService.adminUpdateModule(selectedTrack.id, editingModule.id, moduleForm);
        toast.success('Module updated');
      } else {
        await learningHubService.adminAddModule(selectedTrack.id, moduleForm);
        toast.success('Module added to curriculum');
      }
      setIsModuleModalOpen(false);
      await loadTracks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!selectedTrack) return;
    if (!confirm('Are you sure you want to delete this module and its curriculum?')) return;
    try {
      await learningHubService.adminDeleteModule(selectedTrack.id, moduleId);
      toast.success('Module removed');
      await loadTracks();
    } catch {
      toast.error('Failed to delete module');
    }
  };

  // Resource Actions
  const handleOpenAddResource = (moduleId: string) => {
    setTargetModuleId(moduleId);
    setEditingResource({
      moduleId,
      title: '',
      type: 'lesson',
      category: selectedTrack?.category || 'Frontend',
      skills: selectedTrack?.targetSkills || [],
      difficulty: selectedTrack?.difficulty || 'intermediate',
      estimatedMinutes: 20,
      provider: 'SKILLEZO Engineering',
      markdown: '# Lesson Title\n\nExplain the architectural concepts, code patterns, and practical trade-offs.\n\n### Implementation Details\n\n```tsx\n// Write clean TypeScript/React code here\n```',
      externalUrl: '',
    });
    setResourceTab('write');
    setIsResourceModalOpen(true);
  };

  const handleOpenEditResource = (moduleId: string, res: any) => {
    setTargetModuleId(moduleId);
    setEditingResource({
      id: res.id,
      moduleId,
      title: res.title,
      type: res.type,
      category: res.category,
      skills: res.skills || [],
      difficulty: res.difficulty,
      estimatedMinutes: res.estimatedMinutes,
      provider: res.provider || 'SKILLEZO Engineering',
      markdown: res.markdown || '',
      externalUrl: res.externalUrl || '',
    });
    setResourceTab('write');
    setIsResourceModalOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrack || !targetModuleId || !editingResource) return;

    if (!editingResource.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    if (editingResource.type !== 'lesson' && !editingResource.externalUrl) {
      toast.error('External URL is required for external docs/videos');
      return;
    }

    if (editingResource.externalUrl && !/^https?:\/\/.+/i.test(editingResource.externalUrl)) {
      toast.error('External URL must start with http:// or https://');
      return;
    }

    try {
      const payload: CreateResourceInput = {
        title: editingResource.title,
        type: editingResource.type,
        category: editingResource.category,
        skills: editingResource.skills,
        difficulty: editingResource.difficulty,
        estimatedMinutes: editingResource.estimatedMinutes,
        provider: editingResource.provider,
        markdown: editingResource.markdown,
        externalUrl: editingResource.externalUrl || undefined,
      };

      if (editingResource.id) {
        await learningHubService.adminUpdateResource(editingResource.id, payload);
        toast.success(`Lesson '${editingResource.title}' updated successfully`);
      } else {
        await learningHubService.adminCreateResource(selectedTrack.id, targetModuleId, payload);
        toast.success(`Lesson '${editingResource.title}' added to module`);
      }

      setIsResourceModalOpen(false);
      await loadTracks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save lesson');
    }
  };

  const handleDeleteResource = async (moduleId: string, resourceId: string) => {
    if (!selectedTrack) return;
    if (!confirm('Are you sure you want to delete this learning resource?')) return;
    try {
      await learningHubService.adminDeleteResource(selectedTrack.id, moduleId, resourceId);
      toast.success('Resource deleted');
      await loadTracks();
    } catch {
      toast.error('Failed to delete resource');
    }
  };

  const filteredTracks = tracks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#3D5AFE]/30 text-[#61DAFB] border border-[#3D5AFE]/40">
                Curriculum Architecture Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Production Live
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Curriculum, Track & Lesson Manager
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Create and manage enterprise learning tracks, modules, and in-depth lessons with live Markdown rendering, code snippets, and external references.
            </p>
          </div>

          <button
            onClick={handleOpenCreateTrack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Track</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Tracks</span>
            <span className="text-lg font-bold text-white">{tracks.length}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Total Modules</span>
            <span className="text-lg font-bold text-[#61DAFB]">
              {tracks.reduce((sum, t) => sum + (t.modules?.length || 0), 0)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Total Lessons</span>
            <span className="text-lg font-bold text-emerald-400">
              {tracks.reduce((sum, t) => sum + (t.totalResources || 0), 0)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Enrolled Candidates</span>
            <span className="text-lg font-bold text-indigo-300">
              {tracks.reduce((sum, t) => sum + (t.enrollmentCount || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Work Area */}
      {!selectedTrack ? (
        /* Track Catalog View */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0B1130] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tracks by title, skill, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#3D5AFE]"
              />
            </div>
            <span className="text-xs text-slate-500">
              Showing {filteredTracks.length} of {tracks.length} tracks
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#3D5AFE] border-t-transparent animate-spin" />
              <p className="text-xs text-slate-500">Loading curriculum tracks...</p>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#0B1130] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No tracks found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No learning tracks matched your query. Click "Create New Track" to author a new curriculum.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-white dark:bg-[#0B1130] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs hover:border-[#3D5AFE]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#61DAFB]">
                        {track.category}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize">
                        {track.difficulty}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                      {track.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {track.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {track.targetRoles?.slice(0, 2).map((role) => (
                        <span
                          key={role}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                        >
                          {role}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        {track.modules?.length || 0} Modules
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#3D5AFE]" />
                        {track.estimatedMinutes} Mins
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditTrack(track)}
                        title="Edit track metadata"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTrack(track)}
                        title="Delete track"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedTrack(track)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Manage Modules ({track.modules?.length || 0})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Detailed Module & Lesson Builder for Selected Track */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#0B1130] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedTrack(null)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Back to all tracks"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3D5AFE]/15 text-[#3D5AFE]">
                    {selectedTrack.category}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedTrack.title}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Curriculum Editor • {selectedTrack.modules?.length || 0} Modules • {selectedTrack.totalResources || 0} Lessons
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleOpenEditTrack(selectedTrack)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Edit Track Info
              </button>
              <button
                onClick={handleOpenAddModule}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Module</span>
              </button>
            </div>
          </div>

          {/* Module List Accordions */}
          {selectedTrack.modules?.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#0B1130] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <Layers className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No modules in this track yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Begin structuring this track by creating Module 1 (e.g., Core Primitives & State Management).
              </p>
              <button
                onClick={handleOpenAddModule}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#3D5AFE] text-white shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Module 1</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedTrack.modules?.map((mod, modIdx) => (
                <div
                  key={mod.id}
                  className="bg-white dark:bg-[#0B1130] rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs"
                >
                  {/* Module Header Bar */}
                  <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                          Module {modIdx + 1}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {mod.title}
                        </h3>
                      </div>
                      {mod.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAddResource(mod.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Lesson</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModule(mod)}
                        title="Edit module info"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        title="Delete module"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons List in Module */}
                  <div className="p-4 space-y-2">
                    {mod.resources.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No lessons in this module yet. Click "+ Add Lesson" above.
                      </div>
                    ) : (
                      mod.resources.map((res: any) => (
                        <div
                          key={res.id}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
                              {res.type === 'lesson' ? (
                                <FileText className="w-4 h-4" />
                              ) : res.type === 'external_video' ? (
                                <Video className="w-4 h-4" />
                              ) : (
                                <ExternalLink className="w-4 h-4" />
                              )}
                            </span>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {res.title}
                                </h4>
                                {res.provider && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    {res.provider}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="capitalize">{res.type.replace('_', ' ')}</span>
                                <span>•</span>
                                <span>{res.estimatedMinutes} mins</span>
                                {res.skills?.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-xs">{res.skills.join(', ')}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {res.type === 'lesson' && (
                              <button
                                onClick={() => setPreviewResourceId(res.id)}
                                title="Preview lesson modal"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D5AFE] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditResource(mod.id, res)}
                              title="Edit lesson"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteResource(mod.id, res.id)}
                              title="Delete lesson"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TRACK MODAL */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTrack ? 'Edit Track' : 'Create New Learning Track'}
              </h3>
              <button
                onClick={() => setIsTrackModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrack} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Track Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed System Design & Microservice Scalability"
                  value={trackForm.title}
                  onChange={(e) => setTrackForm({ ...trackForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={trackForm.category}
                    onChange={(e) => setTrackForm({ ...trackForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty *
                  </label>
                  <select
                    value={trackForm.difficulty}
                    onChange={(e) =>
                      setTrackForm({ ...trackForm, difficulty: e.target.value as LearningDifficulty })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Comprehensive summary of what candidates will build and master..."
                  value={trackForm.description}
                  onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Job Roles (Check all that apply)
                </label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {availableRoles.map((role) => {
                    const isChecked = trackForm.targetRoles.includes(role);
                    return (
                      <label
                        key={role}
                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTrackForm({
                                ...trackForm,
                                targetRoles: [...trackForm.targetRoles, role],
                              });
                            } else {
                              setTrackForm({
                                ...trackForm,
                                targetRoles: trackForm.targetRoles.filter((r) => r !== role),
                              });
                            }
                          }}
                        />
                        <span className="truncate">{role}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, Next.js, Redux"
                    value={trackForm.targetSkills.join(', ')}
                    onChange={(e) =>
                      setTrackForm({
                        ...trackForm,
                        targetSkills: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={trackForm.estimatedMinutes}
                    onChange={(e) =>
                      setTrackForm({ ...trackForm, estimatedMinutes: parseInt(e.target.value) || 60 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTrackModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3D5AFE] text-white font-semibold shadow-sm"
                >
                  Save Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODULE MODAL */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingModule ? 'Edit Module' : 'Add Module'}
              </h3>
              <button
                onClick={() => setIsModuleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Module Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 1: React 19 Primitives & Actions"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short overview of topics covered in this module..."
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3D5AFE] text-white font-semibold shadow-sm"
                >
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOURCE / LESSON MODAL WITH LIVE MARKDOWN EDITOR */}
      {isResourceModalOpen && editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingResource.id ? 'Edit Lesson / Resource' : 'Add New Lesson to Module'}
                </h3>
                <p className="text-xs text-slate-400">
                  Author rich lessons with Markdown, code snippets, or curated external references.
                </p>
              </div>
              <button
                onClick={() => setIsResourceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleSaveResource} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React 19 Actions & Asynchronous State Transitions"
                    value={editingResource.title}
                    onChange={(e) =>
                      setEditingResource({ ...editingResource, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Resource Type *
                  </label>
                  <select
                    value={editingResource.type}
                    onChange={(e) =>
                      setEditingResource({
                        ...editingResource,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="lesson">In-Platform Interactive Lesson (Markdown)</option>
                    <option value="external_doc">External Documentation Guide</option>
                    <option value="external_video">External Masterclass Video</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Provider
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SKILLEZO Architecture"
                    value={editingResource.provider}
                    onChange={(e) =>
                      setEditingResource({ ...editingResource, provider: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Est. Duration (Mins)
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={editingResource.estimatedMinutes}
                    onChange={(e) =>
                      setEditingResource({
                        ...editingResource,
                        estimatedMinutes: parseInt(e.target.value) || 15,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, Hooks, State"
                    value={editingResource.skills.join(', ')}
                    onChange={(e) =>
                      setEditingResource({
                        ...editingResource,
                        skills: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* External URL if applicable */}
              {editingResource.type !== 'lesson' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    External Resource URL (must start with https://) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://react.dev/blog/2024/04/25/react-19"
                    value={editingResource.externalUrl}
                    onChange={(e) =>
                      setEditingResource({ ...editingResource, externalUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              {/* In-Platform Markdown Editor */}
              {editingResource.type === 'lesson' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Lesson Markdown Content *
                    </label>
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => setResourceTab('write')}
                        className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                          resourceTab === 'write'
                            ? 'bg-white dark:bg-slate-700 text-[#3D5AFE] dark:text-white shadow-xs'
                            : 'text-slate-500'
                        }`}
                      >
                        Write
                      </button>
                      <button
                        type="button"
                        onClick={() => setResourceTab('preview')}
                        className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                          resourceTab === 'preview'
                            ? 'bg-white dark:bg-slate-700 text-[#3D5AFE] dark:text-white shadow-xs'
                            : 'text-slate-500'
                        }`}
                      >
                        Live Preview
                      </button>
                    </div>
                  </div>

                  {resourceTab === 'write' ? (
                    <textarea
                      rows={12}
                      required
                      value={editingResource.markdown}
                      onChange={(e) =>
                        setEditingResource({ ...editingResource, markdown: e.target.value })
                      }
                      className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 leading-relaxed"
                    />
                  ) : (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 max-h-80 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300">
                        {editingResource.markdown || 'No content written yet.'}
                      </pre>
                    </div>
                  )}

                  {/* Optional supplementary external link for a lesson */}
                  <div className="pt-2">
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Optional Supplementary URL (e.g. official docs)
                    </label>
                    <input
                      type="url"
                      placeholder="https://official-docs-url.com"
                      value={editingResource.externalUrl}
                      onChange={(e) =>
                        setEditingResource({ ...editingResource, externalUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* Form Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResourceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3D5AFE] text-white font-semibold shadow-sm"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewResourceId && (
        <LessonViewerModal
          resourceId={previewResourceId}
          isOpen={Boolean(previewResourceId)}
          onClose={() => setPreviewResourceId(null)}
        />
      )}
    </div>
  );
};

