"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/site/Reveal";
import {
  FileText,
  GitCompareArrows,
  Gauge,
  Route,
  MessageSquareHeart,
  Briefcase,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "Resume Intelligence",
    copy: "Line-by-line AI feedback that rewrites weak bullets into recruiter-magnet impact statements — scored against real ATS filters.",
    span: "lg:col-span-8",
    accent: "#3D5AFE",
  },
  {
    icon: Gauge,
    title: "Employability Index",
    copy: "One number that tells you exactly how hireable you are today, benchmarked against peers targeting the same roles.",
    span: "lg:col-span-4",
    accent: "#00D9C0",
  },
  {
    icon: GitCompareArrows,
    title: "Skill Gap Analysis",
    copy: "See the precise skills standing between you and your dream job — ranked by impact on your score.",
    span: "lg:col-span-4",
    accent: "#00D9C0",
  },
  {
    icon: Route,
    title: "Career GPS",
    copy: "A turn-by-turn roadmap of courses, projects and milestones that takes you from where you are to job-ready.",
    span: "lg:col-span-4",
    accent: "#FFB800",
  },
  {
    icon: MessageSquareHeart,
    title: "AI Career Coach",
    copy: "24/7 conversational coach for mock interviews, salary negotiation and next-step advice — trained on hiring outcomes.",
    span: "lg:col-span-4",
    accent: "#3D5AFE",
  },
  {
    icon: Briefcase,
    title: "Job Center",
    copy: "Curated openings matched to your profile, with a readiness gauge and one-click tailored applications.",
    span: "lg:col-span-12",
    accent: "#00D9C0",
  },
];

export function Features() {
  return (
    <section id="features" className="relative z-10 py-20 lg:py-32" data-testid="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <p className="text-xs tracking-[0.22em] uppercase text-[#00D9C0] mb-3 font-semibold">
            THE PLATFORM
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-2xl leading-tight">
            Everything you need to go from{" "}
            <span className="gradient-text">enrolled to employed.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06} className={f.span}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="group glass rounded-2xl p-7 lg:p-8 h-full relative overflow-hidden border border-white/10 hover:border-[#00D9C0]/40 transition-all duration-300"
                data-testid={`feature-card-${i}`}
              >
                {/* Glow blob background effect */}
                <div
                  className="absolute -top-16 -right-16 h-44 w-44 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none"
                  style={{ background: f.accent }}
                />

                <span
                  className="relative grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/5 group-hover:scale-110 transition-transform duration-300"
                  style={{ color: f.accent }}
                >
                  <f.icon className="h-6 w-6" />
                </span>

                <h3 className="relative mt-6 font-display text-xl font-semibold text-white">
                  {f.title}
                </h3>
                
                <p className="relative mt-2.5 text-sm text-[#8A90A6] leading-relaxed max-w-xl">
                  {f.copy}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
