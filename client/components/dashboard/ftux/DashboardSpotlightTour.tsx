'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Target,
  Award,
  Compass,
  FileText,
  Bot,
  Lightbulb,
} from 'lucide-react';
import { FtuxTourStep } from './ftux-steps.config';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface DashboardSpotlightTourProps {
  isActive: boolean;
  currentStep: FtuxTourStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export function DashboardSpotlightTour({
  isActive,
  currentStep,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: DashboardSpotlightTourProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const measureTarget = useCallback(() => {
    if (!isActive || !currentStep?.targetSelector) return;

    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });

      // Scroll smoothly if element is out of comfortable viewing range
      const isInComfortZone =
        rect.top >= 80 && rect.bottom <= (window.innerHeight || 800) - 80;

      if (!isInComfortZone) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // Fallback: center in screen if target selector element isn't found
      setTargetRect({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 250,
        width: 500,
        height: 300,
      });
    }
  }, [isActive, currentStep]);

  useEffect(() => {
    if (!isActive) {
      setTargetRect(null);
      return;
    }

    // Small delay to allow any layout rendering
    const timer = setTimeout(measureTarget, 80);

    const handleScrollOrResize = () => {
      measureTarget();
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isActive, currentStep, measureTarget]);

  if (!isActive) return null;

  const padding = 10;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Calculate tooltip popover positioning
  let tooltipTop = 100;
  let tooltipLeft = 20;

  if (targetRect) {
    const spaceBelow = window.innerHeight - (targetRect.top + targetRect.height);
    const spaceAbove = targetRect.top;

    if (spaceBelow >= 260 || spaceBelow > spaceAbove) {
      // Position below target
      tooltipTop = targetRect.top + targetRect.height + padding + 16;
    } else {
      // Position above target
      tooltipTop = Math.max(20, targetRect.top - 260);
    }

    // Clamp horizontally to stay inside viewport
    const desiredLeft = targetRect.left + targetRect.width / 2 - 200;
    tooltipLeft = Math.max(16, Math.min(window.innerWidth - 416, desiredLeft));
  }

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden" data-testid="dashboard-spotlight-tour">
      {/* SVG Cutout Mask */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-auto"
        onClick={onSkip}
        aria-hidden="true"
      >
        <defs>
          <mask id="ftux-spotlight-mask">
            {/* White background makes entire screen visible to the mask */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout creates the transparent hole */}
            {targetRect && (
              <rect
                x={Math.max(0, targetRect.left - padding)}
                y={Math.max(0, targetRect.top - padding)}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx="20"
                ry="20"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Dark dimming backdrop with mask applied */}
        <rect
          x="0"
          y="0"
          width="100%" height="100%"
          fill="rgba(7, 11, 30, 0.78)"
          mask="url(#ftux-spotlight-mask)"
        />
      </svg>

      {/* Animated Glowing Ring around Cutout */}
      {targetRect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{
            top: targetRect.top - padding,
            left: targetRect.left - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
            opacity: 1,
            scale: 1,
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed pointer-events-none z-[92] rounded-[22px] border-2 border-[#00D9C0] shadow-[0_0_35px_rgba(0,217,192,0.45)] ring-4 ring-[#00D9C0]/20"
        />
      )}

      {/* Tour Step Popover Dialog */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 15, scale: 0.96 }}
          animate={{
            top: tooltipTop,
            left: tooltipLeft,
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{ opacity: 0, y: 15, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="fixed z-[95] w-[380px] sm:w-[400px] rounded-2xl bg-[#0D153A] border border-[#00D9C0]/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-5 text-white"
          data-testid="spotlight-popover"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-[#3D5AFE]/20 text-[#3D5AFE] border border-[#3D5AFE]/30">
                {currentStep.badge}
              </span>
              <span className="text-xs text-white/50">
                {currentStepIndex + 1} / {totalSteps}
              </span>
            </div>
            <button
              onClick={onSkip}
              className="text-white/40 hover:text-white transition-colors cursor-pointer p-1 rounded-md"
              aria-label="Skip tour"
              data-testid="spotlight-skip-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="mt-3.5 space-y-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              {currentStep.iconName === 'Sparkles' && (
                <Sparkles className="w-4 h-4 text-[#00D9C0]" />
              )}
              {currentStep.iconName === 'Target' && (
                <Target className="w-4 h-4 text-[#00D9C0]" />
              )}
              {currentStep.iconName === 'Award' && (
                <Award className="w-4 h-4 text-[#FFB800]" />
              )}
              {currentStep.iconName === 'Compass' && (
                <Compass className="w-4 h-4 text-[#3D5AFE]" />
              )}
              <span>{currentStep.title}</span>
            </h4>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Action Hint */}
          {currentStep.actionHint && (
            <div className="mt-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-start gap-2 text-[11px] text-[#00D9C0]">
              <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{currentStep.actionHint}</span>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'w-5 bg-[#00D9C0]'
                      : idx < currentStepIndex
                      ? 'w-2 bg-[#3D5AFE]'
                      : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={onPrev}
                  data-testid="spotlight-prev-btn"
                  className="px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40 text-xs font-semibold text-white hover:bg-white/5 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={onNext}
                data-testid="spotlight-next-btn"
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] hover:shadow-[0_0_18px_rgba(0,217,192,0.4)] text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isLastStep ? 'Finish Tour' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
