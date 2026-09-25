'use client';

import React, { useDeferredValue, useCallback, useState, useRef, useEffect } from 'react';
import { ResumeDocument } from '@/types/resume-document';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';
import { SAMPLE_RESUME_DOCUMENT_FIXTURE } from '@/types/resume-document.fixture';
import { ResumeRenderer } from './renderer';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Move, FileText, UploadCloud } from 'lucide-react';

interface LiveResumeCanvasProps {
  document: ResumeDocument | null;
  config: ResumeBuilderConfig;
  highlightSectionId?: string | null;
  onSectionClick?: (sectionId: string) => void;
  isVisibleOnMobile?: boolean;
  className?: string;
}

export const LiveResumeCanvas: React.FC<LiveResumeCanvasProps> = React.memo(({
  document,
  config,
  highlightSectionId,
  onSectionClick,
  isVisibleOnMobile = false,
  className = '',
}) => {
  // Concurrently defer heavy A4 DOM re-renders so builder controls & typing run at 60-120 FPS
  const deferredConfig = useDeferredValue(config);
  const deferredDoc = useDeferredValue(document);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  // Zoom Modes: 'fit' (entire resume visible on screen with zero scrolling) vs '100%' (natural reading size) vs custom
  const [zoomMode, setZoomMode] = useState<'fit' | '100%' | 'custom'>('fit');
  const [fitScale, setFitScale] = useState<number>(0.68);
  const [customScale, setCustomScale] = useState<number>(1);
  const [contentHeight, setContentHeight] = useState<number>(1150);

  // Measure container and content to compute the exact scale needed to fit 100% of the resume on screen
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current || !contentWrapperRef.current) return;

      const containerHeight = containerRef.current.clientHeight;
      const containerWidth = containerRef.current.clientWidth;
      const naturalHeight = contentWrapperRef.current.scrollHeight || 1150;
      const standardWidth = 850;

      setContentHeight(naturalHeight);

      if (containerWidth > 0) {
        // Fit width of resume to container with comfortable padding while allowing full vertical scrolling
        const scaleW = (containerWidth - 48) / standardWidth;
        setFitScale(Math.max(0.45, Math.min(scaleW, 1)));
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (contentWrapperRef.current) resizeObserver.observe(contentWrapperRef.current);

    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [deferredDoc, deferredConfig]);

  const activeScale =
    zoomMode === 'fit' ? fitScale : zoomMode === '100%' ? 1 : customScale;

  const handleZoomIn = () => {
    setZoomMode('custom');
    setCustomScale((prev) => Math.min(1.5, Number((prev + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomMode('custom');
    setCustomScale((prev) => Math.max(0.45, Number((prev - 0.1).toFixed(2))));
  };

  const handleSectionClick = useCallback((sectionId: string) => {
    if (onSectionClick) {
      onSectionClick(sectionId);
    }
  }, [onSectionClick]);

  return (
    <div
      className={`w-full space-y-3 ${
        isVisibleOnMobile ? 'block' : 'hidden lg:block'
      } ${className || ''}`}
    >
      {/* Canvas Header & Interactive Zoom Controller */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Live Resume Canvas
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync</span>
          </span>
        </div>

        {/* View Scaling Toolbar */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs">
          <button
            onClick={() => setZoomMode('fit')}
            title="Fit entire 1-page resume on screen without scrolling"
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              zoomMode === 'fit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Fit Page
          </button>

          <button
            onClick={() => {
              setZoomMode('100%');
              setCustomScale(1);
            }}
            title="View at 100% actual reading size"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              zoomMode === '100%'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            100%
          </button>

          <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 px-1 min-w-[36px] text-center">
            {Math.round(activeScale * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Container */}
      <div
        ref={containerRef}
        className="min-h-[calc(100vh-140px)] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-950/60 p-4 flex justify-center items-start overflow-x-auto will-change-scroll"
      >
        {/* Scaled A4 Sheet Wrapper */}
        <div
          style={{
            width: `${850 * activeScale}px`,
            minHeight: `${contentHeight * activeScale}px`,
            height: `${contentHeight * activeScale}px`,
          }}
          className="relative shrink-0 flex justify-center py-2 pointer-events-auto"
        >
          <div
            ref={contentWrapperRef}
            style={{
              width: '850px',
              transform: `scale(${activeScale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="absolute top-2 shadow-2xl rounded-2xl pointer-events-auto select-text"
          >
            {deferredDoc ? (
              <ResumeRenderer
                document={deferredDoc}
                highlightSectionId={highlightSectionId}
                onSectionClick={handleSectionClick}
                interactive={true}
                config={deferredConfig}
              />
            ) : (
              <div className="w-[850px] min-h-[1100px] bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    No Resume Document Loaded
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Upload a PDF resume to activate visual rendering, font customization, and live bullet editing.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

LiveResumeCanvas.displayName = 'LiveResumeCanvas';
