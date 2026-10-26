'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  Award,
  Sparkles,
} from 'lucide-react';
import { TrackCatalogItem, TrackDetail, ResourceSummary } from '@/types/learning-hub';
import { learningHubService } from '@/services/learning-hub.service';
import { toast } from 'sonner';

interface TrackSyllabusModalProps {
  track: TrackCatalogItem | null;
  isOpen: boolean;
  onClose: () => void;
  onResourceToggle?: (resourceId: string, completed: boolean) => void;
}

export const TrackSyllabusModal: React.FC<TrackSyllabusModalProps> = ({
  track,
  isOpen,
  onClose,
  onResourceToggle,
}) => {
  const [trackDetail, setTrackDetail] = useState<TrackDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [togglingResourceId, setTogglingResourceId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && track) {
      loadTrackDetail(track.slug);
    } else {
      setTrackDetail(null);
      setExpandedModules({});
    }
  }, [isOpen, track]);

  const loadTrackDetail = async (slug: string) => {
    setLoading(true);
    try {
      const detail = await learningHubService.getTrackBySlug(slug);
      setTrackDetail(detail);

      // Expand all modules by default
      if (detail?.modules) {
        const initialExpand: Record<string, boolean> = {};
        detail.modules.forEach((m) => {
          initialExpand[m.id] = true;
        });
        setExpandedModules(initialExpand);
      }
    } catch (err) {
      console.error('Failed to load track details:', err);
      toast.error('Failed to load track curriculum');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleToggleResource = async (res: ResourceSummary) => {
    setTogglingResourceId(res.id);
    try {
      const result = await learningHubService.toggleResourceProgress(res.id);
      if (result) {
        // Optimistically update local trackDetail state
        setTrackDetail((prev) => {
          if (!prev) return null;
          let completedCount = 0;
          let totalCount = 0;

          const updatedModules = prev.modules.map((mod) => ({
            ...mod,
            resources: mod.resources.map((r) => {
              const isTarget = r.id === res.id;
              const isComp = isTarget ? result.completed : r.completed;
              totalCount++;
              if (isComp) completedCount++;
              return isTarget ? { ...r, completed: result.completed } : r;
            }),
          }));

          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return {
            ...prev,
            modules: updatedModules,
            completedResourcesCount: completedCount,
            progressPercent,
          };
        });

        if (result.completed) {
          toast.success(`Completed: ${res.title}`);
        }
        if (onResourceToggle) {
          onResourceToggle(res.id, result.completed);
        }
      }
    } catch {
      toast.error('Failed to update lesson status');
    } finally {
      setTogglingResourceId(null);
    }
  };

  if (!isOpen || !track) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#61DAFB]">
                  {track.category}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {track.difficulty}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {track.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {track.description}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#3D5AFE]" />
              {track.estimatedMinutes} Minutes Total
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              {trackDetail?.modules?.length || track.totalModules} Modules
            </span>
            {trackDetail && (
              <span className="font-semibold text-[#3D5AFE] ml-auto">
                {trackDetail.progressPercent}% Completed ({trackDetail.completedResourcesCount}/
                {trackDetail.totalResources})
              </span>
            )}
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 rounded-full border-2 border-[#3D5AFE] border-t-transparent animate-spin" />
              <p className="text-xs text-slate-500">Loading syllabus modules...</p>
            </div>
          ) : !trackDetail || trackDetail.modules.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No modules available for this track yet.
            </div>
          ) : (
            trackDetail.modules.map((mod, modIdx) => {
              const isExpanded = expandedModules[mod.id] ?? true;
              return (
                <div
                  key={mod.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/40 dark:bg-slate-900/40"
                >
                  {/* Module Header Accordion Button */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-[#3D5AFE] uppercase tracking-wider block mb-0.5">
                        Module {modIdx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {mod.title}
                      </h4>
                      {mod.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {mod.description}
                        </p>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {/* Module Resources List */}
                  {isExpanded && (
                    <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      {mod.resources.map((res) => {
                        const isToggling = togglingResourceId === res.id;
                        return (
                          <div
                            key={res.id}
                            className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                              res.completed
                                ? 'bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-950/10'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Completion Toggle Button */}
                              <button
                                onClick={() => handleToggleResource(res)}
                                disabled={isToggling}
                                className="text-slate-300 hover:text-emerald-500 dark:text-slate-600 dark:hover:text-emerald-400 transition-colors shrink-0"
                              >
                                {res.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                    {res.title}
                                  </span>
                                  {res.provider && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                                      {res.provider}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                  <span className="capitalize">{res.type.replace('_', ' ')}</span>
                                  <span>•</span>
                                  <span>{res.estimatedMinutes} mins</span>
                                </div>
                              </div>
                            </div>

                            {/* External Link or Action */}
                            {res.externalUrl && (
                              <a
                                href={res.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D5AFE] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#3D5AFE]" />
            Tick lessons off to automatically boost your progress meter
          </span>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
