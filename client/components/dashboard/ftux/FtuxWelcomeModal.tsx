'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  ArrowRight,
  FileText,
  Bot,
  Compass,
  CheckCircle2,
  X,
  Coins,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Volume2,
  ShieldCheck,
} from 'lucide-react';
import { SUPERPOWER_CARDS } from './ftux-steps.config';

interface FtuxWelcomeModalProps {
  isOpen: boolean;
  userName?: string;
  onStartTour: () => void;
  onDismiss: () => void;
}

export function FtuxWelcomeModal({
  isOpen,
  userName,
  onStartTour,
  onDismiss,
}: FtuxWelcomeModalProps) {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Auto-advance slides every 5 seconds if not interacted
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SUPERPOWER_CARDS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCard = SUPERPOWER_CARDS[activeSlide];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        data-testid="ftux-welcome-modal"
      >
        {/* Cinematic Backdrop with Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="fixed inset-0 bg-[#070B1E]/85 backdrop-blur-2xl"
          data-testid="ftux-backdrop"
        />

        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#3D5AFE]/30 via-[#00D9C0]/20 to-[#7C4DFF]/25 blur-[120px] pointer-events-none rounded-full" />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-3xl rounded-3xl bg-[#0D153A]/95 border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden"
          data-testid="ftux-modal-content"
        >
          {/* Top Banner Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#3D5AFE] via-[#00D9C0] to-[#7C4DFF]" />

          {/* Close Button */}
          <button
            onClick={onDismiss}
            aria-label="Close welcome guide"
            data-testid="ftux-close-btn"
            className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8">
            {/* Header: Personalized Greeting & Token Gift */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D9C0]/10 border border-[#00D9C0]/30 text-[#00D9C0] text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> First-Time User Experience
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  Welcome to SKILLEZO, {userName || 'Candidate'}!
                </h2>
                <p className="text-sm text-white/70 mt-1 max-w-md">
                  Your AI-powered career intelligence suite is primed. Here is your platform orientation.
                </p>
              </div>

              {/* 1,000 Free Tokens Reward Card */}
              <div className="shrink-0 rounded-2xl bg-gradient-to-br from-[#3D5AFE]/20 to-[#00D9C0]/20 border border-[#00D9C0]/40 p-3.5 flex items-center gap-3 shadow-[0_0_24px_rgba(0,217,192,0.15)]">
                <div className="w-10 h-10 rounded-xl bg-[#00D9C0]/20 flex items-center justify-center text-[#00D9C0]">
                  <Coins className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#00D9C0]">Welcome Gift</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00D9C0] animate-ping" />
                  </div>
                  <div className="font-mono-num font-bold text-base text-white">+1,000 AI Tokens</div>
                </div>
              </div>
            </div>

            {/* Carousel Section: Superpower Highlights */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold tracking-wider text-white/50">
                  Platform Core Superpowers ({activeSlide + 1} of {SUPERPOWER_CARDS.length})
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setActiveSlide(
                        (prev) => (prev - 1 + SUPERPOWER_CARDS.length) % SUPERPOWER_CARDS.length
                      )
                    }
                    data-testid="ftux-carousel-prev"
                    className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Previous superpower"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveSlide((prev) => (prev + 1) % SUPERPOWER_CARDS.length)
                    }
                    data-testid="ftux-carousel-next"
                    className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Next superpower"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Animated Carousel Card */}
              <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={currentCard.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center"
                    data-testid={`ftux-slide-${currentCard.id}`}
                  >
                    {/* Left: Info */}
                    <div className="md:col-span-7 space-y-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: `${currentCard.accentColor}25` }}
                        >
                          {currentCard.iconName === 'FileText' && (
                            <FileText className="w-5 h-5 text-[#3D5AFE]" />
                          )}
                          {currentCard.iconName === 'Bot' && (
                            <Bot className="w-5 h-5 text-[#00D9C0]" />
                          )}
                          {currentCard.iconName === 'Compass' && (
                            <Compass className="w-5 h-5 text-[#FFB800]" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{currentCard.title}</h3>
                          <p className="text-xs font-semibold text-white/60">
                            {currentCard.subtitle}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-white/80 leading-relaxed">
                        {currentCard.description}
                      </p>

                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                        <TrendingUp className="w-3.5 h-3.5 text-[#00D9C0]" />
                        <span className="text-white/60">{currentCard.stats.label}:</span>
                        <span className="font-bold text-white font-mono-num">
                          {currentCard.stats.value}
                        </span>
                      </div>
                    </div>

                    {/* Right: Visual Preview Simulation */}
                    <div className="md:col-span-5 bg-[#0B1130]/90 rounded-xl p-4 border border-white/10 flex flex-col justify-center">
                      {currentCard.id === 'resume-studio' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                            <span className="text-white/70">ATS Score</span>
                            <span className="font-mono-num font-bold text-[#00D9C0] bg-[#00D9C0]/10 px-2 py-0.5 rounded-md">
                              92 / 100
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {['React 19', 'Next.js', 'System Architecture'].map((k) => (
                              <span
                                key={k}
                                className="text-[10px] px-2 py-0.5 rounded bg-[#3D5AFE]/15 text-[#3D5AFE] border border-[#3D5AFE]/30"
                              >
                                {k}
                              </span>
                            ))}
                          </div>
                          <div className="text-[11px] text-white/60 bg-white/5 p-2 rounded-lg flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Quantified impact bullet points verified</span>
                          </div>
                        </div>
                      )}

                      {currentCard.id === 'interview-coach' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                            <span className="text-white/70 flex items-center gap-1.5">
                              <Volume2 className="w-3.5 h-3.5 text-[#00D9C0]" /> Speech Cadence
                            </span>
                            <span className="font-mono-num font-bold text-white">135 wpm</span>
                          </div>
                          <div className="flex items-center justify-center gap-1 h-8">
                            {[40, 75, 100, 60, 90, 45, 80, 95, 50, 70].map((h, i) => (
                              <div
                                key={i}
                                className="w-1.5 bg-gradient-to-t from-[#3D5AFE] to-[#00D9C0] rounded-full"
                                style={{ height: `${h}%` }}
                              />
                            ))}
                          </div>
                          <div className="text-[11px] text-white/60 bg-white/5 p-2 rounded-lg flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>STAR method answer rubric passed</span>
                          </div>
                        </div>
                      )}

                      {currentCard.id === 'career-gps' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                            <span className="text-white/70 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#FFB800]" /> Verified Badges
                            </span>
                            <span className="font-mono-num font-bold text-[#FFB800]">3 Earned</span>
                          </div>
                          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#FFB800] to-[#00D9C0] w-[75%]" />
                          </div>
                          <div className="text-[11px] text-white/60 bg-white/5 p-2 rounded-lg flex items-center justify-between">
                            <span>Target Role: Senior Fullstack</span>
                            <span className="text-emerald-400 font-bold">75% Ready</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Indicator Dots */}
              <div className="flex justify-center items-center gap-2 mt-4">
                {SUPERPOWER_CARDS.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeSlide === idx ? 'w-6 bg-[#00D9C0]' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={onDismiss}
                data-testid="ftux-skip-btn"
                className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors cursor-pointer order-2 sm:order-1"
              >
                Explore dashboard on my own
              </button>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                <button
                  onClick={() => {
                    onDismiss();
                    router.push(currentCard.actionHref);
                  }}
                  data-testid="ftux-fast-track-btn"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-white/20 hover:border-white/40 text-xs sm:text-sm font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#00D9C0]" />
                  {currentCard.actionLabel}
                </button>

                <button
                  onClick={onStartTour}
                  data-testid="ftux-start-tour-btn"
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] hover:shadow-[0_0_24px_rgba(61,90,254,0.4)] text-xs sm:text-sm font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Take Interactive Tour</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
