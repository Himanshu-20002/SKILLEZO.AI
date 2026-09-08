"use client";

import { Reveal } from "@/components/site/Reveal";
import { GraduationCap, Briefcase, Building, Layers, ArrowRight } from "lucide-react";
import Link from "next/link";

const SOLUTIONS = [
  {
    icon: GraduationCap,
    title: "For Students",
    desc: "Transform academic projects into industry-grade portfolio assets. Get step-by-step guidance to land your first software engineering role.",
    cta: "Explore Candidate Hub",
    href: "/dashboard",
  },

  {
    icon: Briefcase,
    title: "For Job Seekers",
    desc: "Pivot into high-paying roles faster. Fix hidden resume gaps and practice with AI interview simulators trained on target companies.",
    cta: "View Smart Jobs",
    href: "/dashboard/job-center",
  },
  {
    icon: Building,
    title: "For Universities",
    desc: "Empower career placement cells with real-time cohort analytics, skill gap benchmarks, and automated job recommendation pipelines.",
    cta: "Explore Campus Insights",
    href: "/dashboard",
  },
  {
    icon: Layers,
    title: "For Recruiters",
    desc: "Access pre-vetted candidates with verified employability scores and cryptographic certificates. Cut hiring cycle time by up to 60%.",
    cta: "Launch Recruiter Portal",
    href: "/recruiter/applications",
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
              <div className="glass rounded-3xl p-8 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between h-full group">
                <div>
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

                <div className="pt-6 mt-4 border-t border-white/5">
                  <Link
                    href={s.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D9C0] hover:text-white transition-colors group-hover:translate-x-0.5 transform"
                  >
                    <span>{s.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

