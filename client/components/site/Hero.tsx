"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MaskedLines, Reveal } from "@/components/site/Reveal";
import { ScoreRing } from "@/components/site/ScoreRing";
import { ArrowRight, Play, Sparkles, TrendingUp, Target } from "lucide-react";

interface HeroProps {
  onGetScore: () => void;
}

export function Hero({ onGetScore }: HeroProps) {

  return (
    <section
      id="top"
      className="relative min-h-screen overflow-hidden pt-28 pb-16 lg:pt-40"
      data-testid="hero"
    >
      {/* Mesh blobs with soft blurred gradient background */}
      <div
        className="mesh-blob absolute -top-20 -left-32 h-[560px] w-[560px] rounded-full bg-[#3D5AFE]"
        aria-hidden
      />
      <div
        className="mesh-blob absolute top-40 right-0 h-[460px] w-[460px] rounded-full bg-[#00D9C0]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* left: kinetic headline */}
        <div className="lg:col-span-7 text-center sm:text-left">
          <Reveal delay={0.1}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] sm:text-xs tracking-[0.15em] uppercase text-[#00D9C0]">
              <Sparkles className="h-3.5 w-3.5" /> AI Career Intelligence
            </span>
          </Reveal>

          <h1 className="mt-5 font-display font-black tracking-tighter leading-[1.02] sm:leading-[0.95] text-4xl sm:text-6xl lg:text-7xl text-white">
            <MaskedLines
              delay={0.25}
              lines={["Know your", <>Employability <span className="gradient-text">Score.</span></>, "Close the gap.", "Get hired."]}
            />
          </h1>

          <Reveal delay={0.9}>
            <p className="mt-5 sm:mt-7 max-w-xl mx-auto sm:mx-0 text-sm sm:text-base lg:text-lg leading-relaxed text-[#8A90A6]">
              SKILLEZO reads your resume, benchmarks your skills against real
              hiring data, and hands you a step-by-step Career GPS to become
              job-ready — like a personal AI coach that actually knows the market.
            </p>
          </Reveal>

          <Reveal delay={1.05}>
            <div className="mt-8 sm:mt-9 flex flex-col sm:flex-row gap-3.5 justify-center sm:justify-start">
              <Button
                onClick={onGetScore}
                data-testid="hero-primary-cta"
                className="h-12 sm:h-14 rounded-full bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 hover:shadow-[0_0_28px_rgba(61,90,254,0.5)] transition-all px-6 sm:px-8 text-sm sm:text-base font-semibold group cursor-pointer w-full sm:w-auto"
              >
                Get your free Employability Score
                <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                data-testid="hero-secondary-cta"
                className="h-12 sm:h-14 rounded-full border-white/20 bg-transparent text-white hover:border-[#00D9C0] hover:text-[#00D9C0] hover:bg-transparent px-6 sm:px-8 text-sm sm:text-base font-semibold cursor-pointer w-full sm:w-auto"
              >
                <Play className="mr-2 h-4 w-4" /> Watch demo
              </Button>
            </div>
          </Reveal>

          <Reveal delay={1.2}>
            <div className="mt-8 sm:mt-10 flex items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-[#8A90A6]">
              <div className="flex -space-x-2">
                {["#3D5AFE", "#00D9C0", "#FFB800", "#7C4DFF"].map((c) => (
                  <span
                    key={c}
                    className="h-7 sm:h-8 w-7 sm:w-8 rounded-full border-2 border-[#0B1130]"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <span>
                Trusted by <span className="text-white font-semibold">50,000+</span> students
              </span>
            </div>
          </Reveal>
        </div>

        {/* right: floating dashboard preview */}
        <div className="lg:col-span-5 relative mt-4 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative glass rounded-3xl p-5 sm:p-7 shadow-[0_20px_80px_rgba(0,0,0,0.5)]"
            data-testid="hero-dashboard"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <p className="text-[10px] sm:text-xs tracking-[0.18em] uppercase text-[#8A90A6]">
                  Live report
                </p>
                <p className="font-display text-base sm:text-lg font-semibold text-white">
                  Aisha&apos;s dashboard
                </p>
              </div>
              <span className="rounded-full bg-[#00D9C0]/15 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold text-[#00D9C0]">
                Job-ready
              </span>
            </div>

            <div className="flex justify-center py-2">
              <ScoreRing score={87} size={180} />
            </div>

            <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
              {[
                { icon: TrendingUp, label: "Resume", v: "92" },
                { icon: Target, label: "Skills", v: "81" },
                { icon: Sparkles, label: "Interview", v: "88" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl bg-white/5 border border-white/5 p-2.5 sm:p-3 text-center"
                >
                  <s.icon className="mx-auto h-3.5 sm:h-4 w-3.5 sm:w-4 text-[#00D9C0]" />
                  <p className="font-mono-num text-lg sm:text-xl font-bold text-white mt-1">
                    {s.v}
                  </p>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-[#8A90A6]">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* floating amber badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -10, 0] }}
            transition={{ delay: 1.3, y: { repeat: Infinity, duration: 4 } }}
            className="absolute -bottom-4 sm:-bottom-5 left-2 sm:-left-4 glass-strong rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3"
          >
            <span className="grid h-8 sm:h-9 w-8 sm:w-9 place-items-center rounded-lg bg-[#FFB800]/20">
              <TrendingUp className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-[#FFB800]" />
            </span>
            <div>
              <p className="font-mono-num text-xs sm:text-sm font-bold text-white">+34 pts</p>
              <p className="text-[9px] sm:text-[10px] text-[#8A90A6]">in 6 weeks</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
