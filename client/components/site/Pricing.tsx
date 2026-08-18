"use client";

import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingProps {
  onGetScore: () => void;
}

const PLANS = [
  {
    name: "Free Explorer",
    price: "₹0",
    desc: "Perfect for getting your initial employability baseline and score.",
    features: [
      "Basic ATS Resume Audit",
      "Employability Score (0-100)",
      "Top 3 Skill Gap Highlights",
      "Community Support",
    ],
    cta: "Get Free Audit",
    highlight: false,
  },
  {
    name: "Pro Career GPS",
    price: "₹999",
    period: "/ month",
    desc: "Full access to AI micro-learning, mock interviews, and recruiter matching.",
    features: [
      "Unlimited AI Resume Rewrites",
      "Complete Skill Matrix & GPS Path",
      "10 AI Mock Interview Sessions / mo",
      "Direct Hiring Partner Referral",
      "Priority Support",
    ],
    cta: "Start 7-Day Free Trial",
    highlight: true,
  },
  {
    name: "Campus & University",
    price: "Custom",
    desc: "For institutions and placement cells driving campus success.",
    features: [
      "Cohort Analytics Dashboard",
      "Custom Skill Benchmarking",
      "Bulk Resume Analysis",
      "Dedicated Placement Account Manager",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export function Pricing({ onGetScore }: PricingProps) {
  return (
    <section id="pricing" className="relative py-28 border-t border-white/5 bg-white/[0.01]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs tracking-[0.2em] uppercase text-[#00D9C0] font-semibold">
              Flexible Plans
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Invest in your career growth today.
            </h2>
          </div>
        </Reveal>

        <div className="mt-16 grid md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={0.15 * i}>
              <div
                className={`glass rounded-3xl p-8 border relative h-full flex flex-col justify-between ${
                  p.highlight
                    ? "border-[#3D5AFE] shadow-[0_0_40px_rgba(61,90,254,0.3)] bg-[#141b4d]/80"
                    : "border-white/10"
                }`}
              >
                <div>
                  {p.highlight && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#3D5AFE] text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-display font-bold text-xl text-white mb-2">
                    {p.name}
                  </h3>
                  <p className="text-xs text-[#8A90A6] mb-6">
                    {p.desc}
                  </p>
                  <div className="mb-6">
                    <span className="font-display text-4xl font-black text-white">
                      {p.price}
                    </span>
                    {p.period && (
                      <span className="text-sm text-[#8A90A6] ml-1">{p.period}</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                        <Check className="h-4 w-4 text-[#00D9C0] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={onGetScore}
                  className={`w-full h-12 rounded-full font-semibold cursor-pointer ${
                    p.highlight
                      ? "bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {p.cta}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
