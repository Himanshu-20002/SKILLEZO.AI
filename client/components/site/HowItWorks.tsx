"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/site/Reveal";
import { Upload, ScanSearch, Route, Rocket } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: Upload,
    title: "Upload your resume",
    copy: "Drop in your CV or LinkedIn. We parse it in seconds — no forms to fill.",
  },
  {
    n: "02",
    icon: ScanSearch,
    title: "Get analyzed",
    copy: "AI benchmarks your profile against live hiring data and returns your Employability Index.",
  },
  {
    n: "03",
    icon: Route,
    title: "Follow your Career GPS",
    copy: "A personalised roadmap of skills, projects and milestones — ordered by impact.",
  },
  {
    n: "04",
    icon: Rocket,
    title: "Get job-ready",
    copy: "Watch your score climb, ace mock interviews, and apply to matched roles with confidence.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative z-10 py-20 lg:py-32 bg-[#080d28]"
      data-testid="how-it-works"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <p className="text-xs tracking-[0.22em] uppercase text-[#00D9C0] mb-3 font-medium">
            How it works
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-2xl">
            Four steps to your first offer.
          </h2>
        </Reveal>

        <div className="mt-12 sm:mt-20 relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-8">
          {/* Horizontal Animated Glowing Connector line (Desktop) */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ transformOrigin: "left" }}
            className="hidden md:block absolute top-7 left-[28px] right-[28px] h-[2px] bg-gradient-to-r from-[#3D5AFE] via-[#00D9C0] to-[#FFB800] opacity-50 shadow-[0_0_12px_rgba(0,217,192,0.8)]"
          />

          {/* Vertical Glowing Connector line (Mobile) */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ transformOrigin: "top" }}
            className="md:hidden absolute top-7 left-[27px] bottom-10 w-[2px] bg-gradient-to-b from-[#3D5AFE] via-[#00D9C0] to-[#FFB800] opacity-40"
          />

          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12} className="relative">
              <div className="flex flex-row md:flex-col items-start gap-5 md:gap-0 group" data-testid={`step-${i}`}>
                {/* Icon box with subtle hover glow */}
                <motion.span
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#0B1130] border border-white/15 shadow-[0_0_25px_rgba(61,90,254,0.35)] group-hover:border-[#00D9C0]/60 group-hover:shadow-[0_0_30px_rgba(0,217,192,0.4)] transition-all duration-300"
                >
                  <s.icon className="h-6 w-6 text-[#00D9C0] group-hover:text-white transition-colors" />
                </motion.span>
                
                <div className="flex-1">
                  <span className="font-mono-num md:mt-5 block text-xs md:text-sm font-bold text-[#3D5AFE]">
                    {s.n}
                  </span>
                  
                  <h3 className="mt-0.5 md:mt-1 font-display text-base md:text-lg font-semibold text-white group-hover:text-[#00D9C0] transition-colors">
                    {s.title}
                  </h3>
                  
                  <p className="mt-1.5 md:mt-2 text-xs md:text-sm text-[#8A90A6] leading-relaxed">
                    {s.copy}
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
