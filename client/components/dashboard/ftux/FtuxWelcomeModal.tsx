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
  Flame,
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
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-advance slides every 6 seconds when not hovered
  useEffect(() => {
    if (!isOpen || isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SUPERPOWER_CARDS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isOpen, isPaused]);

  if (!isOpen) return null;

  const currentCard = SUPERPOWER_CARDS[activeSlide];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 lg:p-8 overflow-y-auto"
        data-testid="ftux-welcome-modal"
      >
        {/* Cinematic Ultra-Glass Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="fixed inset-0 bg-[#060A1E]/80 backdrop-blur-2xl"
          data-testid="ftux-backdrop"
        />

        {/* Ambient Moving Gradient Plasma Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#3D5AFE]/30 via-[#7C4DFF]/20 to-transparent blur-[140px] pointer-events-none rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.1, 0.95, 1.1],
            x: [0, -25, 0],
            y: [0, 25, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-[550px] h-[550px] bg-gradient-to-bl from-[#00D9C0]/25 via-[#3D5AFE]/20 to-transparent blur-[130px] pointer-events-none rounded-full"
        />

        {/* Modal Window: Immersive Glassmorphism Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 25 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative z-10 w-full max-w-4xl xl:max-w-5xl rounded-[28px] sm:rounded-[32px] bg-gradient-to-b from-[#111A48]/80 via-[#0B1238]/85 to-[#070D28]/95 border border-white/15 shadow-[0_30px_100px_-15px_rgba(0,0,0,0.85),inset_0_1px_1px_0_rgba(255,255,255,0.25),inset_0_0_60px_rgba(61,90,254,0.1)] backdrop-blur-3xl overflow-hidden"
          data-testid="ftux-modal-content"
        >
          {/* Top Specular Neon Accent Line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00D9C0] via-50% via-[#3D5AFE] to-transparent opacity-90 shadow-[0_0_12px_rgba(0,217,192,0.8)]" />

          {/* Close Button */}
          <button
            onClick={onDismiss}
            aria-label="Close welcome guide"
            data-testid="ftux-close-btn"
            className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-9 lg:p-10 space-y-6 sm:space-y-7">
            {/* Header: Personalized Greeting & Token Gift */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-white/10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00D9C0]/15 to-[#3D5AFE]/15 border border-[#00D9C0]/35 text-[#00D9C0] text-xs font-semibold uppercase tracking-wider shadow-[0_0_15px_rgba(0,217,192,0.15)]">
                  <Sparkles className="w-3.5 h-3.5 text-[#00D9C0] animate-spin-slow" />
                  <span>First-Time User Experience</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
                  Welcome to SKILLEZO, <span className="bg-gradient-to-r from-white via-cyan-200 to-[#00D9C0] bg-clip-text text-transparent">{userName || 'Candidate'}</span>!
                </h2>
                <p className="text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed">
                  Your AI career intelligence cockpit is activated. Discover your 3 primary career superpowers below or jump straight into the guided tour.
                </p>
              </div>

              {/* Shimmering +1,000 Free AI Tokens Reward Card */}
              <div className="relative group shrink-0 rounded-2xl bg-gradient-to-br from-[#3D5AFE]/25 via-white/[0.04] to-[#00D9C0]/25 border border-[#00D9C0]/40 p-4 sm:p-4.5 flex items-center gap-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_20px_rgba(0,217,192,0.15)] overflow-hidden">
                {/* Diagonal Light Sweep Animation */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', repeatDelay: 1 }}
                  className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none"
                />

                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#00D9C0]/30 to-[#3D5AFE]/30 border border-[#00D9C0]/40 flex items-center justify-center text-[#00D9C0] shadow-[0_0_15px_rgba(0,217,192,0.3)]">
                  <Coins className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] uppercase font-extrabold tracking-wider text-[#00D9C0]">
                      Welcome Gift
                    </span>
                    <span className="inline-block w-2 h-2 rounded-full bg-[#00D9C0] shadow-[0_0_8px_#00D9C0] animate-ping" />
                  </div>
                  <div className="font-mono-num font-extrabold text-lg sm:text-xl text-white tracking-tight">
                    +1,000 AI Tokens
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Navigation Tabs (Direct Selection & Prevention of Layout Shifts) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Interactive Superpower Tabs */}
                <div className="flex items-center gap-2 p-1 rounded-xl bg-black/30 border border-white/10 backdrop-blur-md">
                  {SUPERPOWER_CARDS.map((card, idx) => {
                    const isCurrent = activeSlide === idx;
                    return (
                      <button
                        key={card.id}
                        onClick={() => setActiveSlide(idx)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-gradient-to-r from-[#3D5AFE]/40 to-[#00D9C0]/40 border border-[#00D9C0]/50 text-white shadow-[0_0_15px_rgba(0,217,192,0.25)]'
                            : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {card.id === 'resume-studio' && <FileText className="w-3.5 h-3.5 text-[#3D5AFE]" />}
                        {card.id === 'interview-coach' && <Bot className="w-3.5 h-3.5 text-[#00D9C0]" />}
                        {card.id === 'career-gps' && <Compass className="w-3.5 h-3.5 text-[#FFB800]" />}
                        <span className="hidden sm:inline">{card.title}</span>
                        <span className="sm:hidden">{idx + 1}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Arrow Controls */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <span className="text-[11px] font-mono-num font-semibold text-white/40 mr-1">
                    {activeSlide + 1} / {SUPERPOWER_CARDS.length}
                  </span>
                  <button
                    onClick={() =>
                      setActiveSlide(
                        (prev) => (prev - 1 + SUPERPOWER_CARDS.length) % SUPERPOWER_CARDS.length
                      )
                    }
                    data-testid="ftux-carousel-prev"
                    className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                    aria-label="Previous superpower"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveSlide((prev) => (prev + 1) % SUPERPOWER_CARDS.length)
                    }
                    data-testid="ftux-carousel-next"
                    className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                    aria-label="Next superpower"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stabilized Fixed-Height Carousel Container (ZERO CLS Layout Shifts) */}
              <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="relative rounded-2xl bg-white/[0.03] border border-white/15 p-5 sm:p-7 overflow-hidden min-h-[290px] sm:min-h-[240px] flex items-center backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                {/* Ambient glow tuned to active card accent */}
                <div
                  className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-25 transition-all duration-700"
                  style={{ backgroundColor: currentCard.accentColor }}
                />

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentCard.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                    data-testid={`ftux-slide-${currentCard.id}`}
                  >
                    {/* Left Column: Superpower Info */}
                    <div className="md:col-span-7 space-y-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg"
                          style={{
                            backgroundColor: `${currentCard.accentColor}25`,
                            border: `1px solid ${currentCard.accentColor}50`,
                          }}
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
                          <h3 className="text-xl font-extrabold text-white tracking-tight">
                            {currentCard.title}
                          </h3>
                          <p className="text-xs font-semibold text-white/60">
                            {currentCard.subtitle}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
                        {currentCard.description}
                      </p>

                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                        <TrendingUp className="w-3.5 h-3.5 text-[#00D9C0]" />
                        <span className="text-white/60">{currentCard.stats.label}:</span>
                        <span className="font-extrabold text-white font-mono-num">
                          {currentCard.stats.value}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Visual Preview Simulation */}
                    <div className="md:col-span-5 bg-[#090F2C]/90 rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl flex flex-col justify-center min-h-[170px]">
                      {currentCard.id === 'resume-studio' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                            <span className="text-white/70 font-semibold flex items-center gap-1.5">
                              <Flame className="w-3.5 h-3.5 text-[#3D5AFE]" /> ATS Benchmark
                            </span>
                            <span className="font-mono-num font-extrabold text-[#00D9C0] bg-[#00D9C0]/15 px-2.5 py-0.5 rounded-full border border-[#00D9C0]/30 shadow-[0_0_10px_rgba(0,217,192,0.2)]">
                              92 / 100
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {['React 19', 'Next.js', 'System Architecture'].map((k) => (
                              <span
                                key={k}
                                className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-[#3D5AFE]/20 text-indigo-300 border border-[#3D5AFE]/40"
                              >
                                {k}
                              </span>
                            ))}
                          </div>
                          <div className="text-[11px] text-white/70 bg-white/5 p-2 rounded-xl flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Quantified impact bullet points verified</span>
                          </div>
                        </div>
                      )}

                      {currentCard.id === 'interview-coach' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                            <span className="text-white/70 font-semibold flex items-center gap-1.5">
                              <Volume2 className="w-3.5 h-3.5 text-[#00D9C0]" /> Live Speech Cadence
                            </span>
                            <span className="font-mono-num font-extrabold text-white">135 wpm</span>
                          </div>
                          {/* Animated Sound Wave Equalizer */}
                          <div className="flex items-center justify-center gap-1.5 h-10 py-1">
                            {[35, 75, 100, 55, 90, 45, 80, 95, 50, 70, 40, 85].map((h, i) => (
                              <motion.div
                                key={i}
                                animate={{ height: [`${Math.max(25, h * 0.4)}%`, `${h}%`, `${Math.max(25, h * 0.4)}%`] }}
                                transition={{ repeat: Infinity, duration: 1.2 + (i % 4) * 0.2, ease: 'easeInOut' }}
                                className="w-1.5 bg-gradient-to-t from-[#3D5AFE] via-[#00D9C0] to-cyan-300 rounded-full shadow-[0_0_8px_rgba(0,217,192,0.3)]"
                              />
                            ))}
                          </div>
                          <div className="text-[11px] text-white/70 bg-white/5 p-2 rounded-xl flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>STAR method answer rubric verified</span>
                          </div>
                        </div>
                      )}

                      {currentCard.id === 'career-gps' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                            <span className="text-white/70 font-semibold flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#FFB800]" /> Verified Badges
                            </span>
                            <span className="font-mono-num font-extrabold text-[#FFB800] bg-[#FFB800]/15 px-2.5 py-0.5 rounded-full border border-[#FFB800]/30">
                              3 Earned
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#FFB800] via-[#00D9C0] to-emerald-400 w-[75%]" />
                            </div>
                            <div className="flex justify-between text-[10px] text-white/50">
                              <span>Skill Verification</span>
                              <span className="font-bold text-white">75%</span>
                            </div>
                          </div>
                          <div className="text-[11px] text-white/70 bg-white/5 p-2 rounded-xl flex items-center justify-between">
                            <span>Target: Senior Engineer</span>
                            <span className="text-emerald-400 font-bold">Interview Ready</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slide Progress Dots */}
              <div className="flex justify-center items-center gap-2 pt-1">
                {SUPERPOWER_CARDS.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeSlide === idx
                        ? 'w-7 bg-gradient-to-r from-[#00D9C0] to-[#3D5AFE] shadow-[0_0_10px_rgba(0,217,192,0.5)]'
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={onDismiss}
                data-testid="ftux-skip-btn"
                className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors cursor-pointer order-2 sm:order-1 hover:underline"
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
                  className="flex-1 sm:flex-none px-4.5 py-2.5 rounded-xl border border-white/20 hover:border-white/40 text-xs sm:text-sm font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Zap className="w-4 h-4 text-[#00D9C0]" />
                  <span>{currentCard.actionLabel}</span>
                </button>

                <button
                  onClick={onStartTour}
                  data-testid="ftux-start-tour-btn"
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3D5AFE] via-[#2F4EE8] to-[#00D9C0] hover:shadow-[0_0_28px_rgba(0,217,192,0.4)] text-xs sm:text-sm font-extrabold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
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
