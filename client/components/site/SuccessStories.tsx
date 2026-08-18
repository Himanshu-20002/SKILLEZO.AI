"use client";

import { Reveal } from "@/components/site/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { Star, Quote } from "lucide-react";

const STORIES = [
  {
    name: "Rohan Verma",
    role: "Full Stack Engineer @ Flipkart",
    increase: "+38 Score Gain",
    text: "SKILLEZO pinpointed that my system design and resume keywords were keeping me past ATS. Fixed them in 3 weeks and got 4 interview calls!",
  },
  {
    name: "Ananya Sharma",
    role: "AI Developer @ Tech Corp",
    increase: "+42 Score Gain",
    text: "The AI Mock Interview simulator gave me actionable feedback on my technical depth. I felt 100% prepared during my final round.",
  },
  {
    name: "Karan Patel",
    role: "Frontend Dev @ Swiggy",
    increase: "+29 Score Gain",
    text: "The Skill Gap Matrix gave me exact projects to build. No more guessing what recruiters actually care about.",
  },
  {
    name: "Sneha Reddy",
    role: "Backend Engineer @ Amazon",
    increase: "+35 Score Gain",
    text: "The Career GPS roadmap guided my micro-learning daily. Passed my system design round on the first try!",
  },
];

export function SuccessStories() {
  return (
    <section id="stories" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 mb-12 lg:mb-16">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs tracking-[0.2em] uppercase text-[#3D5AFE] font-semibold">
              Proven Results
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Real stories from candidates who closed the gap.
            </h2>
          </div>
        </Reveal>
      </div>

      {/* Auto-scrolling Review Cards using reusable Marquee */}
      <Marquee gap="gap-6" className="py-4">
        {STORIES.map((st) => (
          <div
            key={st.name}
            className="w-[300px] sm:w-[380px] h-[250px] sm:h-[270px] shrink-0 bg-[#0E163B] rounded-3xl p-6 sm:p-7 border border-white/10 relative flex flex-col justify-between hover:border-[#00D9C0]/50 hover:shadow-[0_0_30px_rgba(0,217,192,0.15)] transition-all duration-300 group"
          >
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-1 text-[#FFB800] mb-3">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="h-3.5 sm:h-4 w-3.5 sm:w-4 fill-[#FFB800]" />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-[#3D5AFE]/40 mb-2 group-hover:text-[#00D9C0]/50 transition-colors" />
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed whitespace-normal line-clamp-4 font-normal">
                  &quot;{st.text}&quot;
                </p>
              </div>
              <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-2 mt-auto">
                <div>
                  <p className="font-display font-bold text-white text-xs sm:text-sm group-hover:text-[#00D9C0] transition-colors">
                    {st.name}
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#8A90A6]">
                    {st.role}
                  </p>
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-[#00D9C0] bg-[#00D9C0]/15 border border-[#00D9C0]/30 px-2.5 py-1 rounded-full whitespace-nowrap shadow-[0_0_12px_rgba(0,217,192,0.2)]">
                  {st.increase}
                </span>
              </div>
            </div>
          </div>
        ))}
      </Marquee>
    </section>
  );
}
