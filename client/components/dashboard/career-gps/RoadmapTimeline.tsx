'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  Route,
  Sparkles,
  Zap,
  GripHorizontal,
  RotateCcw,
  Plus,
  X,
  Trash2
} from 'lucide-react';
import { RoadmapStage } from '@/types/career-intelligence';
import { healRoadmapStages, getDefaultRoadmapStages, getGpsStorageKey } from '@/lib/career-gps-defaults';
import { toast } from 'sonner';

interface RoadmapTimelineProps {
  stages: RoadmapStage[];
  targetRole?: string;
  userId?: string;
  onStagesChange?: (stages: RoadmapStage[]) => void;
}

interface NodePosition {
  x: number;
  y: number;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({
  stages: initialStages,
  targetRole = 'Full-Stack Engineer',
  userId,
  onStagesChange
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const roleKey = (targetRole || 'default').toLowerCase().replace(/\s+/g, '_');
  const POS_KEY = getGpsStorageKey('positions', userId, roleKey);
  const STAGES_KEY = getGpsStorageKey('stages', userId, roleKey);
  const SELECTED_KEY = getGpsStorageKey('selected', userId, roleKey);

  // Restore custom/persisted stages from localStorage with self-healing
  const [currentStages, setCurrentStages] = useState<RoadmapStage[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(STAGES_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return healRoadmapStages(parsed, targetRole);
        } catch { }
      }
    }
    return healRoadmapStages(initialStages, targetRole);
  });

  const [positions, setPositions] = useState<Record<string, NodePosition>>({});
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Custom stage addition modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newStageTitle, setNewStageTitle] = useState<string>('');
  const [newStageDesc, setNewStageDesc] = useState<string>('');
  const [insertPlacement, setInsertPlacement] = useState<string>('after-current');
  const [newStageStatus, setNewStageStatus] = useState<RoadmapStage['status']>('Pending');

  // Sync state if initialStages or targetRole updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(STAGES_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const healed = healRoadmapStages(parsed, targetRole);
            setCurrentStages(healed);
            return;
          }
        } catch { }
      }
    }
    const healed = healRoadmapStages(initialStages, targetRole);
    setCurrentStages(healed);
  }, [initialStages, STAGES_KEY, targetRole]);

  // Default selected stage: restored from cache or first In Progress
  const [selectedStageId, setSelectedStageId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SELECTED_KEY);
      if (saved) return saved;
    }
    return currentStages.find((s) => s.status === 'In Progress')?.id || currentStages[0]?.id || '';
  });

  const handleSelectStage = useCallback((id: string) => {
    setSelectedStageId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SELECTED_KEY, id);
    }
  }, [SELECTED_KEY]);

  // Sync selected stage if stage list updates
  useEffect(() => {
    if (currentStages.length > 0 && (!selectedStageId || !currentStages.some((s) => s.id === selectedStageId))) {
      const active = currentStages.find((s) => s.status === 'In Progress')?.id || currentStages[0].id;
      handleSelectStage(active);
    }
  }, [currentStages, selectedStageId, handleSelectStage]);

  // ── Calculate initial organic constellation wave positions ─────────────────
  const calculateInitialPositions = useCallback((stageList: RoadmapStage[], width: number, height: number) => {
    const count = stageList.length;
    if (count === 0) return {};

    // Comfortable horizontal padding
    const paddingX = Math.max(54, width * 0.08);
    const availableW = Math.max(width - paddingX * 2, 100);
    const centerY = height * 0.44;
    const amplitude = Math.min(52, height * 0.22);

    const initial: Record<string, NodePosition> = {};
    stageList.forEach((stage, i) => {
      const ratio = count > 1 ? i / (count - 1) : 0.5;
      const x = paddingX + ratio * availableW;

      // Dynamic alternating wave coordinates
      const wave = Math.sin((i / Math.max(count - 1, 1)) * Math.PI * 2);
      const y = centerY + (i % 2 === 0 ? -amplitude : amplitude * 0.88) + wave * 8;
      initial[stage.id] = { x: Math.round(x), y: Math.round(y) };
    });
    return initial;
  }, []);

  // ── Measure canvas on mount & window resize with Persistence ───────────────
  useEffect(() => {
    const updateCanvasLayout = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setPositions((prev) => {
          // 1. Check if user has saved positions in localStorage for this role
          if (typeof window !== 'undefined') {
            const savedStr = localStorage.getItem(POS_KEY);
            if (savedStr) {
              try {
                const saved = JSON.parse(savedStr);
                if (saved && typeof saved === 'object') {
                  const initial = calculateInitialPositions(currentStages, rect.width, rect.height);
                  const merged: Record<string, NodePosition> = {};
                  let hasAnySaved = false;
                  currentStages.forEach((s) => {
                    if (saved[s.id] && typeof saved[s.id].x === 'number' && typeof saved[s.id].y === 'number') {
                      merged[s.id] = saved[s.id];
                      hasAnySaved = true;
                    } else if (initial[s.id]) {
                      merged[s.id] = initial[s.id];
                    }
                  });
                  if (hasAnySaved) {
                    return merged;
                  }
                }
              } catch { }
            }
          }
          // 2. Keep in-memory user positions if already placed
          if (Object.keys(prev).length === currentStages.length && currentStages.every((s) => prev[s.id])) {
            return prev;
          }
          return calculateInitialPositions(currentStages, rect.width, rect.height);
        });
      }
    };

    updateCanvasLayout();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasLayout();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentStages, calculateInitialPositions, POS_KEY]);

  // ── Reset to default wave layout ──────────────────────────────────────────
  const handleResetPositions = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const healed = healRoadmapStages(currentStages, targetRole);
    setCurrentStages(healed);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STAGES_KEY, JSON.stringify(healed));
      localStorage.removeItem(POS_KEY);
    }
    onStagesChange?.(healed);
    const reset = calculateInitialPositions(healed, rect.width, rect.height);
    setPositions(reset);
    toast.success('Roadmap constellation layout reset');
  };

  // ── Add Custom Stage in Between ───────────────────────────────────────────
  const handleAddCustomStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageTitle.trim()) {
      toast.error('Please provide a milestone title.');
      return;
    }

    let insertIndex = currentStages.length;
    if (insertPlacement === 'start') {
      insertIndex = 0;
    } else if (insertPlacement === 'after-current') {
      const curIdx = currentStages.findIndex((s) => s.id === selectedStageId);
      insertIndex = curIdx >= 0 ? curIdx + 1 : currentStages.length;
    } else if (insertPlacement.startsWith('after-')) {
      const targetId = insertPlacement.replace('after-', '');
      const targetIdx = currentStages.findIndex((s) => s.id === targetId);
      insertIndex = targetIdx >= 0 ? targetIdx + 1 : currentStages.length;
    }

    const newStage: RoadmapStage = {
      id: `custom-stage-${Date.now()}`,
      stageNumber: 0,
      title: newStageTitle.trim(),
      status: newStageStatus,
      completionPercentage: newStageStatus === 'Completed' ? 100 : newStageStatus === 'In Progress' ? 50 : 0,
      description: newStageDesc.trim() || 'Custom candidate-defined milestone objective.',
      actionText: newStageStatus === 'Completed' ? 'Review Milestone' : 'Explore Tasks',
    };

    const updatedList = [
      ...currentStages.slice(0, insertIndex),
      newStage,
      ...currentStages.slice(insertIndex),
    ];

    const healed = healRoadmapStages(updatedList, targetRole);

    setCurrentStages(healed);
    handleSelectStage(newStage.id);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STAGES_KEY, JSON.stringify(healed));
    }
    onStagesChange?.(healed);

    // Recompute wave layout for new count
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const updatedPositions = calculateInitialPositions(healed, rect.width, rect.height);
      setPositions(updatedPositions);
      if (typeof window !== 'undefined') {
        localStorage.setItem(POS_KEY, JSON.stringify(updatedPositions));
      }
    }

    setNewStageTitle('');
    setNewStageDesc('');
    setIsAddModalOpen(false);
    toast.success(`Added custom stage "${newStage.title}" to career roadmap!`);
  };

  // ── Remove Stage ──────────────────────────────────────────────────────────
  const handleRemoveStage = (stageId: string) => {
    if (currentStages.length <= 3) {
      toast.error('A minimum of 3 stages is required in the roadmap.');
      return;
    }

    const stageToRemove = currentStages.find((s) => s.id === stageId);
    if (!stageToRemove) return;

    const updatedList = currentStages
      .filter((s) => s.id !== stageId)
      .map((s, idx) => ({ ...s, stageNumber: idx + 1 }));

    setCurrentStages(updatedList);
    const newActiveId = updatedList.find((s) => s.status === 'In Progress')?.id || updatedList[0]?.id || '';
    handleSelectStage(newActiveId);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STAGES_KEY, JSON.stringify(updatedList));
    }
    onStagesChange?.(updatedList);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const updatedPositions = calculateInitialPositions(updatedList, rect.width, rect.height);
      setPositions(updatedPositions);
      if (typeof window !== 'undefined') {
        localStorage.setItem(POS_KEY, JSON.stringify(updatedPositions));
      }
    }

    toast.info(`Deleted Stage ${stageToRemove.stageNumber}: "${stageToRemove.title}"`);
  };

  // ── High-Precision Drag Engine with Window-Level Listeners ────────────────
  const dragRef = useRef<{
    stageId: string;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
    canvasRect: DOMRect;
  } | null>(null);

  const rafIdRef = useRef<number | null>(null);
  const pendingPosRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const positionsRef = useRef<Record<string, NodePosition>>(positions);
  const posKeyRef = useRef<string>(POS_KEY);

  useEffect(() => {
    positionsRef.current = positions;
  }, [positions]);

  useEffect(() => {
    posKeyRef.current = POS_KEY;
  }, [POS_KEY]);

  const handlePointerDown = (e: React.PointerEvent, stageId: string) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (!containerRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = containerRef.current.getBoundingClientRect();
    const currentPos = positions[stageId] || { x: 0, y: 0 };

    dragRef.current = {
      stageId,
      startX: e.clientX,
      startY: e.clientY,
      initX: currentPos.x,
      initY: currentPos.y,
      canvasRect: rect,
    };

    setIsDragging(true);
    handleSelectStage(stageId);
  };

  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      if (!dragRef.current) return;

      const { stageId, startX, startY, initX, initY, canvasRect } = dragRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Restrict node centers within visible canvas bounds
      const nodeRadius = 30;
      const clampedX = Math.max(nodeRadius + 12, Math.min(canvasRect.width - nodeRadius - 12, initX + deltaX));
      const clampedY = Math.max(nodeRadius + 12, Math.min(canvasRect.height - nodeRadius - 28, initY + deltaY));

      pendingPosRef.current = { id: stageId, x: clampedX, y: clampedY };

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          if (pendingPosRef.current) {
            setPositions((prev) => {
              const updated = {
                ...prev,
                [pendingPosRef.current!.id]: {
                  x: Math.round(pendingPosRef.current!.x),
                  y: Math.round(pendingPosRef.current!.y),
                },
              };
              positionsRef.current = updated;
              return updated;
            });
          }
          rafIdRef.current = null;
        });
      }
    };

    const handleWindowPointerUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        setIsDragging(false);
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        if (typeof window !== 'undefined' && positionsRef.current && posKeyRef.current) {
          localStorage.setItem(posKeyRef.current, JSON.stringify(positionsRef.current));
        }
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Helper status badge styles
  const getStatusBadge = (status: RoadmapStage['status']) => {
    switch (status) {
      case 'Completed':
        return {
          icon: CheckCircle2,
          text: 'Completed',
          style: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
        };
      case 'In Progress':
        return {
          icon: Clock,
          text: 'In Progress',
          style: 'bg-indigo-50 dark:bg-indigo-500/20 text-[#3D5AFE] dark:text-cyan-300 border-indigo-200 dark:border-cyan-500/40 shadow-xs'
        };
      case 'Pending':
        return {
          icon: Clock,
          text: 'Pending',
          style: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
        };
      case 'Locked':
      default:
        return {
          icon: Lock,
          text: 'Locked',
          style: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
        };
    }
  };

  const selectedStage = currentStages.find((s) => s.id === selectedStageId) || currentStages[0];
  const selectedBadge = selectedStage ? getStatusBadge(selectedStage.status) : null;
  const SelectedIcon = selectedBadge?.icon;
  const isCustomStage = selectedStage?.id.startsWith('custom-stage-');

  // Short labels for node subtitles
  const getShortLabel = (stage: RoadmapStage) => {
    if (stage.title.length <= 15) return stage.title;
    const words = stage.title.split(' ');
    if (words.length >= 2) return `${words[0]} ${words[1]}`;
    return words[0] || `Stage ${stage.stageNumber}`;
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-6">
      <style>{`
        @keyframes cableFlow {
          from {
            stroke-dashoffset: 36;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-cableFlow {
          animation: cableFlow 1.1s linear infinite;
        }
      `}</style>

      {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-[#3D5AFE]/10 dark:bg-indigo-950/60 text-[#3D5AFE] dark:text-indigo-400 border border-[#3D5AFE]/20 dark:border-indigo-800/60 shadow-xs">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {currentStages.length}-Stage Career Path Roadmap
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#3D5AFE] dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                <Sparkles className="w-3 h-3 text-[#3D5AFE]" />
                Live Constellation
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Drag checkpoints with your mouse • Select any stage to inspect strategic milestones
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#3D5AFE] hover:bg-[#304FFE] px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Stage</span>
          </button>

          {/* Delete Selected Stage Button */}
          {selectedStage && currentStages.length > 3 && (
            <button
              onClick={() => handleRemoveStage(selectedStage.id)}
              title={`Delete selected Stage ${selectedStage.stageNumber}: "${selectedStage.title}"`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Stage {selectedStage.stageNumber}</span>
            </button>
          )}

          <button
            onClick={handleResetPositions}
            title="Reset Constellation Layout"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Wave</span>
          </button>
        </div>
      </div>

      {/* ── Mobile Horizontal Swipe Notice ─────────────────────────────────── */}
      <div className="flex sm:hidden items-center justify-between px-1 text-[11px] text-slate-500 font-medium">
        <span>👉 Swipe horizontally to view all checkpoints</span>
        <span className="text-slate-700 font-bold">{currentStages.length} Stages</span>
      </div>

      {/* ── Responsive Scrollable Canvas Wrapper ────────────────────────────── */}
      <div className="relative w-full overflow-x-auto overflow-y-hidden pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-thin">
        <div
          ref={containerRef}
          className={`relative min-w-[760px] w-full h-[360px] sm:h-[400px] rounded-2xl border border-indigo-900/40 overflow-hidden select-none touch-none transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_-20px_40px_rgba(10,14,35,0.4)] ${isDragging ? 'cursor-grabbing' : 'cursor-default'
            }`}
          style={{
            // Aesthetic deep celestial cobalt / midnight indigo canvas
            background: 'radial-gradient(ellipse at 50% 25%, #152a9eff 0%, #171d3aee 50%, #1f37b0ff 100%)',
          }}
        >
          {/* Subtle Luminous Indigo Dot Matrix */}
          <div
            className="absolute inset-0 pointer-events-none opacity-45"
            style={{
              backgroundImage: 'radial-gradient(rgba(165, 180, 252, 0.3) 1.2px, transparent 1.2px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Ambient Lighting Orbs - Cobalt, Cyan & Emerald Auras */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#3D5AFE]/18 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00D9C0]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-emerald-500/12 rounded-full blur-3xl pointer-events-none" />

          {/* Dynamic Connecting SVG Strings (Fiber Optic Cables) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="activeEnergyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="45%" stopColor="#3D5AFE" />
                <stop offset="100%" stopColor="#00D9C0" />
              </linearGradient>

              <filter id="cableGlowBlur" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {currentStages.slice(0, -1).map((fromStage, i) => {
              const toStage = currentStages[i + 1];
              const posA = positions[fromStage.id];
              const posB = positions[toStage.id];
              if (!posA || !posB) return null;

              const dx = posB.x - posA.x;
              const cp1x = posA.x + dx * 0.45;
              const cp1y = posA.y;
              const cp2x = posB.x - dx * 0.45;
              const cp2y = posB.y;

              const pathD = `M ${posA.x} ${posA.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${posB.x} ${posB.y}`;

              const isCompleted = fromStage.status === 'Completed' && toStage.status === 'Completed';
              const isActiveTransition =
                (fromStage.status === 'Completed' && toStage.status === 'In Progress') ||
                fromStage.status === 'In Progress';

              return (
                <g key={`cable-${fromStage.id}-${toStage.id}`}>
                  {/* Wide Ambient Glow underlay */}
                  {(isCompleted || isActiveTransition) && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isCompleted ? '#10B981' : '#3D5AFE'}
                      strokeWidth={11}
                      strokeOpacity={isCompleted ? 0.28 : 0.38}
                      strokeLinecap="round"
                      filter="url(#cableGlowBlur)"
                    />
                  )}

                  {/* Core Solid Cable Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      isCompleted
                        ? '#10B981'
                        : isActiveTransition
                          ? 'url(#activeEnergyGrad)'
                          : 'rgba(165, 180, 252, 0.25)'
                    }
                    strokeWidth={isCompleted || isActiveTransition ? 3.5 : 2}
                    strokeDasharray={isCompleted || isActiveTransition ? undefined : '5,6'}
                    strokeLinecap="round"
                  />

                  {/* High-Velocity Flowing Energy Stream on Active Segment */}
                  {isActiveTransition && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#00D9C0"
                      strokeWidth={3.5}
                      strokeDasharray="10,22"
                      strokeLinecap="round"
                      className="animate-cableFlow"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* ── Checkpoint Nodes ────────────────────────────────────────────── */}
          {currentStages.map((stage) => {
            const pos = positions[stage.id];
            if (!pos) return null;

            const isSelected = selectedStageId === stage.id;
            const isHovered = hoveredStageId === stage.id;
            const isCompleted = stage.status === 'Completed';
            const isInProgress = stage.status === 'In Progress';
            const shortLabel = getShortLabel(stage);

            return (
              <div
                key={stage.id}
                style={{
                  transform: `translate3d(${pos.x - 27}px, ${pos.y - 27}px, 0)`,
                }}
                onPointerDown={(e) => handlePointerDown(e, stage.id)}
                onMouseEnter={() => setHoveredStageId(stage.id)}
                onMouseLeave={() => setHoveredStageId(null)}
                className="absolute top-0 left-0 z-10 will-change-transform cursor-grab active:cursor-grabbing select-none group"
              >
                {/* Active Stage Radar Pulse Beacons */}
                {isInProgress && (
                  <>
                    <span className="absolute -inset-3 rounded-2xl border-2 border-[#00D9C0]/50 animate-ping pointer-events-none" />
                    <span className="absolute -inset-1.5 rounded-2xl border border-[#3D5AFE]/60 animate-pulse pointer-events-none" />
                  </>
                )}

                {/* Node Outer Ambient Halo */}
                {isCompleted && (
                  <span className="absolute -inset-1 rounded-2xl bg-emerald-500/20 blur-sm pointer-events-none" />
                )}
                {isInProgress && (
                  <span className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] blur-sm opacity-70 pointer-events-none" />
                )}

                {/* Node Glass Card */}
                <div
                  className={`relative w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black transition-all duration-150 backdrop-blur-md ${isCompleted
                    ? 'bg-[#0f172a]/90 text-emerald-300 border-2 border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.35)]'
                    : isInProgress
                      ? 'bg-gradient-to-tr from-[#3D5AFE] via-indigo-600 to-[#00D9C0] text-white shadow-[0_0_28px_rgba(61,90,254,0.65)] ring-4 ring-[#00D9C0]/40 scale-105'
                      : 'bg-[#121936]/90 text-slate-200 border border-indigo-400/30 hover:border-indigo-400 hover:text-white hover:scale-105 shadow-md shadow-indigo-950/40'
                    } ${isSelected
                      ? 'ring-4 ring-offset-2 ring-[#3D5AFE] ring-offset-[#0b0f24] scale-110 shadow-2xl'
                      : ''
                    }`}
                >
                  {/* Drag Grip indicator on hover */}
                  <div className="absolute top-1 text-indigo-300/40 group-hover:text-indigo-200 transition-colors pointer-events-none">
                    <GripHorizontal className="w-3.5 h-3.5" />
                  </div>

                  {/* Stage Number */}
                  <span className="text-base font-black tracking-tight mt-1">
                    {stage.stageNumber}
                  </span>

                  {/* Corner Status Badge */}
                  {isCompleted && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-md border border-[#0f172a]">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}

                  {isInProgress && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#00D9C0] border-2 border-[#0b0f24] shadow-md animate-pulse" />
                  )}
                </div>

                {/* Floating Permanent Stage Title Capsule Below Node */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-[110px] text-center pointer-events-none">
                  <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold truncate backdrop-blur-md border shadow-md ${isInProgress
                    ? 'bg-[#1a2350]/95 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(0,217,192,0.3)] font-black'
                    : isCompleted
                      ? 'bg-[#0b1329]/90 text-emerald-300 border-emerald-500/35'
                      : 'bg-[#0d1329]/85 text-slate-300 border-indigo-500/25'
                    }`}>
                    {shortLabel}
                  </div>
                </div>

                {/* Hover Floating Micro-Inspector Tooltip */}
                {isHovered && !isDragging && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 rounded-2xl bg-slate-900/98 text-white backdrop-blur-xl border border-indigo-500/40 shadow-2xl pointer-events-none z-30 animate-fadeIn text-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 text-cyan-400">
                      Stage {stage.stageNumber} • {stage.status}
                    </div>
                    <div className="text-xs font-bold leading-snug">{stage.title}</div>
                    <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-300">
                      <span>Drag to reposition</span>
                      <span>•</span>
                      <span className="text-cyan-300">Click to select</span>
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-5 border-x-transparent border-t-5 border-t-slate-900/98" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mission-Control Selected Milestone Inspector Console ─────────────── */}
      {selectedStage && selectedBadge && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-50/90 via-indigo-50/20 to-white dark:from-slate-850 dark:via-slate-900 dark:to-indigo-950/20 border border-indigo-100/90 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all">
          <div className="space-y-3 flex-1">
            {/* Stage Number, Title, Status & Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center justify-center w-7.5 h-7.5 rounded-xl bg-[#3D5AFE] text-white font-black text-xs shadow-xs">
                {selectedStage.stageNumber}
              </span>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {selectedStage.title}
              </h3>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedBadge.style}`}
              >
                {SelectedIcon && <SelectedIcon className="w-3.5 h-3.5" />}
                <span>{selectedBadge.text}</span>
              </span>



              {/* Option to Delete Stage */}

            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {selectedStage.description}
            </p>

            {/* Stage Quick Switcher Pills */}
            <div className="pt-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Jump to Stage:
              </span>
              {currentStages.map((st) => {
                const isCur = selectedStageId === st.id;
                const isDone = st.status === 'Completed';
                const isAct = st.status === 'In Progress';

                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStageId(st.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${isCur
                      ? 'bg-[#3D5AFE] text-white shadow-xs'
                      : isDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : isAct
                          ? 'bg-indigo-50 text-[#3D5AFE] border border-indigo-200 hover:bg-indigo-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    title={`Stage ${st.stageNumber}: ${st.title}`}
                  >
                    <span>{st.stageNumber}</span>
                    {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {isAct && <span className="w-1.5 h-1.5 rounded-full bg-[#3D5AFE] animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action CTA Button */}
          <button
            onClick={() => toast.info(`Navigating to ${selectedStage.title}`)}
            disabled={selectedStage.status === 'Locked'}
            className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold shrink-0 transition-all shadow-xs cursor-pointer active:scale-95 w-full sm:w-auto ${selectedStage.status === 'Locked'
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#3D5AFE] to-indigo-600 hover:from-indigo-600 hover:to-[#3D5AFE] text-white shadow-[#3D5AFE]/20 ring-2 ring-indigo-400/20'
              }`}
          >
            <Zap className="w-4 h-4 text-cyan-300" />
            <span>{selectedStage.actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Add Custom Stage Modal Dialog ───────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#3D5AFE] dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Add Custom Roadmap Stage</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Insert a custom learning milestone anywhere in your path</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomStage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Docker, Kubernetes & Microservices"
                  value={newStageTitle}
                  onChange={(e) => setNewStageTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Milestone Objective / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Containerize full-stack services, write docker-compose manifests, and deploy cluster."
                  value={newStageDesc}
                  onChange={(e) => setNewStageDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Insert Location
                  </label>
                  <select
                    value={insertPlacement}
                    onChange={(e) => setInsertPlacement(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5AFE] cursor-pointer"
                  >
                    <option value="after-current">After Currently Selected Stage</option>
                    <option value="start">At the Beginning (Stage 1)</option>
                    {currentStages.map((st) => (
                      <option key={st.id} value={`after-${st.id}`}>
                        After Stage {st.stageNumber}: {st.title.slice(0, 22)}...
                      </option>
                    ))}
                    <option value="end">At the End of Roadmap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Initial Status
                  </label>
                  <select
                    value={newStageStatus}
                    onChange={(e) => setNewStageStatus(e.target.value as RoadmapStage['status'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5AFE] cursor-pointer"
                  >
                    <option value="Pending">Pending (Upcoming)</option>
                    <option value="In Progress">In Progress (Active Focus)</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#3D5AFE] hover:bg-[#304FFE] shadow-xs transition-all cursor-pointer"
                >
                  Insert Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
