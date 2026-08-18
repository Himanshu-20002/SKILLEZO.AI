"use client";

import { Reveal } from "@/components/site/Reveal";
import { BookOpen, FileCode, Video, ArrowUpRight } from "lucide-react";

const RESOURCES = [
  {
    icon: BookOpen,
    category: "Guide",
    title: "2026 Tech Hiring Report & Skill Benchmarks",
    desc: "Discover which technical skills saw 140%+ surge in recruiter demand across top engineering startups.",
  },
  {
    icon: FileCode,
    category: "Template",
    title: "High-ATS Software Engineer Resume Pack",
    desc: "Clean, recruiter-tested markdown & LaTeX resume templates formatted for 99% parser readability.",
  },
  {
    icon: Video,
    category: "Masterclass",
    title: "System Design Interview Playbook",
    desc: "Step-by-step breakdown of microservice design questions asked at tier-1 tech companies.",
  },
];

export function Resources() {
  return (
    <section id="resources" className="relative py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-xs tracking-[0.2em] uppercase text-[#3D5AFE] font-semibold">
                Knowledge Hub
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Free resources to accelerate your search.
              </h2>
            </div>
            <a
              href="#resources"
              className="text-sm font-semibold text-[#00D9C0] hover:underline inline-flex items-center gap-1"
            >
              View all resources <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {RESOURCES.map((r, i) => (
            <Reveal key={r.title} delay={0.15 * i}>
              <div className="glass rounded-3xl p-7 border border-white/5 hover:border-white/20 transition-all group h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#3D5AFE]/20 text-[#3D5AFE]">
                      {r.category}
                    </span>
                    <r.icon className="h-5 w-5 text-[#8A90A6] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-[#00D9C0] transition-colors">
                    {r.title}
                  </h3>
                  <p className="text-xs text-[#8A90A6] leading-relaxed">
                    {r.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
