"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Building2, Zap } from "lucide-react";

interface PricingProps {
  onGetScore: () => void;
}

export function Pricing({ onGetScore }: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free Explorer",
      badge: "Free Forever",
      price: "₹0",
      period: "",
      desc: "Essential AI career launchpad with 5,000 welcome tokens.",
      tokens: "5,000 Free AI Tokens",
      features: [
        "5,000 Free AI Welcome Tokens",
        "Full ATS Resume Diagnostic Score",
        "Career GPS Skill Roadmap",
        "Interactive AI Mock Interview (1 session)",
        "Job Match Suitability Scoring",
      ],
      cta: "Get Free Score",
      highlight: false,
      icon: Zap,
    },
    {
      name: "SKILLEZO Pro",
      badge: "Most Popular",
      price: billingCycle === "monthly" ? "₹399" : "₹3,999",
      period: billingCycle === "monthly" ? "/ month" : "/ year",
      subtext: billingCycle === "yearly" ? "Billed annually (₹333/mo) • Save 17%" : "Billed monthly • Cancel anytime",
      desc: "Unlimited career acceleration, priority AI models & resume tailorings.",
      tokens: "100,000 Tokens / Month",
      features: [
        "100,000 Monthly AI Tokens (Refreshed every 30 days)",
        "Unlimited Resume Tailoring & ATS Alignment",
        "Unlimited Voice & Video Mock Interviews with Rubrics",
        "Deep AI Career Coach with Personalized Career GPS",
        "Recruiter Spotlight & Verified Skills Badge",
        "Priority Access to Gemini 1.5 Pro & GPT-4o Models",
      ],
      cta: "Upgrade to Pro",
      highlight: true,
      icon: Sparkles,
    },
    {
      name: "University & Enterprise",
      badge: "Institutional",
      price: "Custom",
      period: "",
      subtext: "Tailored institutional licensing",
      desc: "Custom bulk quotas for colleges, universities, and placement cells.",
      tokens: "1,000,000+ Cohort Pool",
      features: [
        "Dedicated Token Pools per Student Cohort",
        "Placement Officer Dashboard & Aggregate Analytics",
        "Custom Interview Rubrics & Institutional LMS Integration",
        "Bulk ATS Resume Batch Processing",
        "Dedicated Placement Account Manager & 24/7 SLA",
      ],
      cta: "Contact Enterprise",
      highlight: false,
      icon: Building2,
    },
  ];

  return (
    <section id="pricing" className="relative py-28 border-t border-white/5 bg-white/[0.01]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs tracking-[0.2em] uppercase text-[#00D9C0] font-semibold">
              Transparent Pricing
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Invest in your career growth today.
            </h2>
            <p className="mt-3 text-sm text-[#8A90A6]">
              Simple, transparent pricing backed by cryptographic skill verification and real hiring benchmarks.
            </p>

            {/* Monthly / Yearly Billing Toggle */}
            <div className="mt-8 inline-flex items-center p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-[#3D5AFE] text-white shadow-md shadow-[#3D5AFE]/30"
                    : "text-[#8A90A6] hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-[#3D5AFE] text-white shadow-md shadow-[#3D5AFE]/30"
                    : "text-[#8A90A6] hover:text-white"
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#00D9C0]/20 text-[#00D9C0] text-[10px] font-bold">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.name} delay={0.12 * i}>
                <div
                  className={`glass rounded-3xl p-8 border relative h-full flex flex-col justify-between transition-all duration-300 ${
                    p.highlight
                      ? "border-[#3D5AFE] shadow-[0_0_40px_rgba(61,90,254,0.3)] bg-[#141b4d]/90 ring-1 ring-[#3D5AFE]/50"
                      : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                  }`}
                >
                  <div>
                    {p.highlight && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#3D5AFE] text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg shadow-[#3D5AFE]/50 border border-white/20">
                        {p.badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-xl ${
                            p.highlight ? "bg-[#3D5AFE]/20 text-[#3D5AFE]" : "bg-white/5 text-[#00D9C0]"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-display font-bold text-xl text-white">
                          {p.name}
                        </h3>
                      </div>
                      {!p.highlight && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 text-[#8A90A6] border border-white/10">
                          {p.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#8A90A6] mb-4 min-h-[32px]">
                      {p.desc}
                    </p>

                    {/* Token Quota Pill */}
                    <div className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-[#00D9C0] font-medium">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{p.tokens}</span>
                    </div>

                    {/* Price Block */}
                    <div className="mb-2 flex items-baseline gap-1">
                      <span className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
                        {p.price}
                      </span>
                      {p.period && (
                        <span className="text-sm text-[#8A90A6] font-medium">{p.period}</span>
                      )}
                    </div>

                    {p.subtext ? (
                      <p className="text-[11px] text-[#00D9C0] font-medium mb-6">
                        {p.subtext}
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#8A90A6] mb-6">
                        Free tier with no credit card required
                      </p>
                    )}

                    <div className="border-t border-white/10 pt-6 mb-8">
                      <p className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-3">
                        Included Features:
                      </p>
                      <ul className="space-y-3">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-start gap-3 text-xs sm:text-sm text-white/80 leading-snug">
                            <Check className="h-4 w-4 text-[#00D9C0] shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {p.highlight ? (
                    <Link href="/register?plan=pro" className="w-full block">
                      <Button
                        className="w-full h-12 rounded-full font-semibold cursor-pointer bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white shadow-lg shadow-[#3D5AFE]/30"
                      >
                        {p.cta}
                      </Button>
                    </Link>
                  ) : p.name === "Free Explorer" ? (
                    <Button
                      onClick={onGetScore}
                      className="w-full h-12 rounded-full font-semibold cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    >
                      {p.cta}
                    </Button>
                  ) : (
                    <a href="mailto:partners@skillezo.com?subject=Enterprise%20Institution%20Inquiry" className="w-full block">
                      <Button
                        className="w-full h-12 rounded-full font-semibold cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/10"
                      >
                        {p.cta}
                      </Button>
                    </a>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
