"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Share2, Globe, MessageSquare, Mail } from "lucide-react";

import Link from "next/link";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Employability Index", href: "/dashboard/employability-index" },
      { label: "Resume Studio", href: "/dashboard/resume-studio" },
      { label: "Career GPS", href: "/dashboard/career-gps" },
      { label: "AI Coach", href: "/dashboard/ai-career-coach" },
      { label: "Job Center", href: "/dashboard/job-center" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Candidate Dashboard", href: "/dashboard" },

      { label: "For Recruiters", href: "/recruiter/applications" },
      { label: "For Job Seekers", href: "/dashboard/job-center" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#features" },
      { label: "Solutions", href: "#solutions" },
      { label: "Press", href: "#stories" },
      { label: "Contact", href: "#resources" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Skill Assessments", href: "/dashboard/assessments" },
      { label: "Skill Verification", href: "/dashboard/skill-verification" },
      { label: "Portfolio Projects", href: "/dashboard/projects" },
      { label: "Recruiter Portal", href: "/recruiter/applications" },
    ],
  },
];


export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Enter your email.");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Subscribed! Career tips incoming.");
      setEmail("");
    }, 600);
  };

  return (
    <footer className="relative z-10 border-t border-white/5 pt-14 sm:pt-20 overflow-hidden bg-[#080d28]" data-testid="footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Info & Newsletter */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#3D5AFE]">
                <Zap className="h-5 w-5 text-white" fill="white" />
              </span>
              <span className="font-display text-xl sm:text-2xl font-bold text-white">
                SKILL<span className="gradient-text">EZO</span>
              </span>
            </div>
            <p className="mt-4 text-xs sm:text-sm text-[#8A90A6] max-w-xs leading-relaxed">
              AI career intelligence that turns students into hires. Know your
              score, close the gap, get hired.
            </p>
            <form onSubmit={submit} className="mt-6 w-full max-w-sm flex items-center gap-2" data-testid="newsletter-form">
              <div className="relative flex-1">
                <input
                  data-testid="newsletter-input"
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full h-11 px-4 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00D9C0] transition-colors"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                data-testid="newsletter-submit"
                className="h-11 w-11 rounded-full bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 p-0 shrink-0 grid place-items-center cursor-pointer shadow-[0_0_15px_rgba(61,90,254,0.4)]"
              >
                <ArrowRight className="h-4 w-4 text-white" />
              </Button>
            </form>
          </div>

          {/* Footer Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-left">
            {COLUMNS.map((c) => (
              <div key={c.title}>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white mb-3 sm:mb-4">{c.title}</p>
                <ul className="space-y-2.5 sm:space-y-3">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-xs sm:text-sm text-[#8A90A6] hover:text-[#00D9C0] transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}

                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 sm:mt-16 border-t border-white/5 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Corporate Attribution & Pedigree */}
            <div className="space-y-2 text-center lg:text-left max-w-2xl">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-2.5 gap-y-1.5 text-xs text-[#8A90A6]">
                <span className="font-medium text-white/90">
                  © {new Date().getFullYear()} Skillezo.
                </span>
                <span>All rights reserved.</span>
              </div>

              <p className="text-[11px] leading-relaxed text-[#8A90A6]/75">
                Skillezo is a product of{" "}
                <span className="text-white/70 font-medium">SKILLEDHYRE LABS</span>, the innovation and technology division of{" "}
                <span className="text-white/70 font-medium">SKILLEDHYRE</span> — a unit of{" "}
                <span className="text-white/70 font-medium tracking-wide">DEVAADYA TECHNOLOGIES PRIVATE LIMITED</span>.
              </p>
            </div>

            {/* Legal Quick Links & Social Icons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 text-xs text-[#8A90A6]">
                <Link href="/privacy" className="hover:text-[#00D9C0] transition-colors">
                  Privacy
                </Link>
                <span className="text-white/15">•</span>
                <Link href="/terms" className="hover:text-[#00D9C0] transition-colors">
                  Terms
                </Link>
                <span className="text-white/15">•</span>
                <Link href="/security" className="hover:text-[#00D9C0] transition-colors">
                  Security
                </Link>
              </div>

              <div className="flex items-center gap-2">
                {[
                  { Icon: Share2, label: "Share" },
                  { Icon: Globe, label: "Website" },
                  { Icon: MessageSquare, label: "Community" },
                  { Icon: Mail, label: "Contact" },
                ].map(({ Icon, label }, i) => (
                  <a
                    key={i}
                    href="#top"
                    aria-label={label}
                    data-testid={`social-link-${i}`}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.02] text-[#8A90A6] hover:text-white hover:border-[#00D9C0]/50 hover:bg-[#00D9C0]/10 hover:shadow-[0_0_12px_rgba(0,217,192,0.2)] transition-all duration-300"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Massive Brand Watermark Text */}
      <p className="select-none pointer-events-none font-display font-black text-center text-white/[0.03] leading-none tracking-tighter text-[22vw] -mb-[3vw]">
        SKILLEZO
      </p>
    </footer>
  );
}
