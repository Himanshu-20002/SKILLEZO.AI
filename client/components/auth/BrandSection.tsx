"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Cpu, Award, CheckCircle2, Star, Sparkles } from "lucide-react";
import BrandLogo from "@/components/auth/BrandLogo";

export function BrandSection() {
  const features = [
    {
      icon: Cpu,
      title: "AI Skill Verification",
      desc: "Real-time AI benchmarking tailored for enterprise tech roles.",
    },
    {
      icon: ShieldCheck,
      title: "Proctored Skill Audits",
      desc: "Tamper-proof coding & architectural assessments.",
    },
    {
      icon: Award,
      title: "Verified Skill Badges",
      desc: "Instantly shareable credentials backed by telemetry.",
    },
  ];

  return (
    <div className="relative flex flex-col justify-between h-full min-h-[580px] p-8 lg:p-12 overflow-hidden rounded-[32px] bg-[#0E153B]/70 border border-white/10 backdrop-blur-2xl shadow-2xl">
      {/* Background Decorative Mesh & Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#3D5AFE]/30 blur-[90px]" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-[#00D9C0]/20 blur-[90px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top Header */}
      <div className="relative z-10 space-y-6">
        <BrandLogo size="lg" showTagline />

        <div className="space-y-3 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-[#3D5AFE]/15 px-3.5 py-1 text-xs font-semibold text-[#00D9C0] border border-[#3D5AFE]/30"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen Talent Intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight"
          >
            Verify skills with <br />
            <span className="gradient-text">uncompromised precision.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm xl:text-base text-[#8A90A6] leading-relaxed max-w-md"
          >
            Empower hiring managers and developers with AI-driven skill diagnostics, automated scoring, and real-time candidate insights.
          </motion.p>
        </div>
      </div>

      {/* Middle Feature Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative z-10 space-y-4 my-8"
      >
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="group flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#3D5AFE]/40 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#3D5AFE]/20 text-[#00D9C0] border border-[#3D5AFE]/30 group-hover:scale-105 transition-transform">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-display text-sm font-bold text-white group-hover:text-[#00D9C0] transition-colors">
                  {feat.title}
                </h4>
                <p className="text-xs text-[#8A90A6] leading-normal">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Bottom Trust Badge & Testimonial Preview */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 space-y-4 pt-4 border-t border-white/10"
      >
        <div className="flex items-center justify-between text-xs text-[#8A90A6]">
          <span className="flex items-center gap-1.5 font-medium text-white/90">
            <CheckCircle2 className="h-4 w-4 text-[#00D9C0]" /> Trusted by 500+ tech orgs
          </span>
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <Star className="h-3.5 w-3.5 fill-amber-400" /> 4.9/5 Rating
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default BrandSection;
