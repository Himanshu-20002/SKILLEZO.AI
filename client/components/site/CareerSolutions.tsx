"use client";

import { Reveal } from "@/components/site/Reveal";
import { GraduationCap, Briefcase, Building, Layers } from "lucide-react";

const SOLUTIONS = [
  {
    icon: GraduationCap,
    title: "For Students",
    desc: "Transform academic projects into industry-grade portfolio assets. Get step-by-step guidance to land your first software engineering role.",
  },
  {
    icon: Briefcase,
    title: "For Job Seekers",
    desc: "Pivot into high-paying roles faster. Fix hidden resume gaps and practice with AI interview simulators trained on target companies.",
  },
  {
    icon: Building,
    title: "For Universities",
    desc: "Empower career placement cells with real-time cohort analytics, skill gap benchmarks, and automated job recommendation pipelines.",
  },
  {
    icon: Layers,
    title: "For Recruiters",
    desc: "Access pre-vetted candidates with verified employability scores and interview transcripts. Cut hiring cycle time by up to 60%.",
  },
];

export function CareerSolutions() {
  return (
    <section id="solutions" className="relative py-28 border-t border-white/5 bg-white/[0.01]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs tracking-[0.2em] uppercase text-[#00D9C0] font-semibold">
              Tailored Ecosystem
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Solutions for every step of the career spectrum.
            </h2>
          </div>
        </Reveal>

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {SOLUTIONS.map((s, i) => (
            <Reveal key={s.title} delay={0.1 * i}>
              <div className="glass rounded-3xl p-8 border border-white/5 hover:border-white/20 transition-colors h-full">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#00D9C0]/15 text-[#00D9C0] mb-5">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#8A90A6]">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
