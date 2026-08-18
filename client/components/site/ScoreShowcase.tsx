"use client";

import { Reveal } from "@/components/site/Reveal";
import { ScoreRing } from "@/components/site/ScoreRing";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface ScoreShowcaseProps {
  onGetScore: () => void;
}

export function ScoreShowcase({ onGetScore }: ScoreShowcaseProps) {
  return (
    <section className="relative py-16 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="glass rounded-3xl p-6 sm:p-10 lg:p-14 border border-white/10 relative overflow-hidden grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-6 text-center sm:text-left">
            <Reveal>
              <span className="text-[11px] sm:text-xs tracking-[0.2em] uppercase text-[#00D9C0] font-semibold">
                Intelligence Engine
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-4xl font-black text-white leading-tight">
                Understand your true value in today&apos;s job market.
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#8A90A6]">
                Our proprietary algorithm analyzes over 120+ signals from your resume, GitHub commits, project depth, and interview responses.
              </p>

              <ul className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3 text-left">
                {[
                  "ATS Compatibility Score (0-100%)",
                  "Skill Gap vs Top 10% Industry Performers",
                  "Actionable 30-day Roadmap to Boost Score",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-white/90">
                    <CheckCircle2 className="h-4 w-4 text-[#00D9C0] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 sm:mt-8">
                <Button
                  onClick={onGetScore}
                  className="h-12 rounded-full bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 px-6 sm:px-7 text-sm font-semibold cursor-pointer w-full sm:w-auto"
                >
                  Calculate My Employability Score
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <Reveal delay={0.2}>
              <div className="glass-strong rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl border border-white/10 w-full max-w-sm">
                <ScoreRing score={94} size={190} />
                <p className="mt-4 font-display font-bold text-base sm:text-lg text-white">
                  Senior Frontend Architect
                </p>
                <p className="text-xs text-[#00D9C0] mt-1 font-semibold">
                  Top 3% Candidate Match
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
