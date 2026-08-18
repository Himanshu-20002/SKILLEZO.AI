"use client";

import { Reveal } from "@/components/site/Reveal";
import { useCountUp } from "@/lib/countup";
import { Marquee } from "@/components/ui/Marquee";

const PARTNERS = [
  "Google",
  "Deloitte",
  "TCS",
  "Amazon",
  "Infosys",
  "Accenture",
  "Microsoft",
  "Flipkart",
  "Zomato",
  "Razorpay",
];

function StatItem({
  end,
  prefix = "",
  suffix = "",
  label,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  label: string;
}) {
  const { value, ref } = useCountUp(end, { duration: 1800 });

  return (
    <div className="text-center">
      <p className="font-mono-num text-2xl sm:text-4xl lg:text-5xl font-bold gradient-text">
        <span ref={ref}>
          {prefix}
          {value}
          {suffix}
        </span>
      </p>
      <p className="mt-1 text-[10px] sm:text-xs md:text-sm text-[#8A90A6] font-medium leading-tight">{label}</p>
    </div>
  );
}

export function TrustBar() {
  return (
    <section className="relative z-10 py-12 lg:py-20 border-y border-white/5 bg-white/[0.01]" data-testid="trust-bar">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-10">
        <Reveal>
          <div className="grid grid-cols-4 gap-2 sm:gap-6 md:gap-12 mb-10 sm:mb-14">
            <StatItem end={50} suffix="K+" label="Students coached" />
            <StatItem end={500} suffix="+" label="Hiring partners" />
            <StatItem end={120} suffix="+" label="Partner universities" />
            <StatItem end={34} prefix="+" label="Avg. score lift" />
          </div>
        </Reveal>
      </div>

      <p className="text-center text-[11px] sm:text-xs tracking-[0.22em] uppercase text-[#8A90A6]/70 mb-8 font-semibold">
        GRADUATES GET HIRED AT
      </p>

      <Marquee gap="gap-16 md:gap-24" className="opacity-60 hover:opacity-100 transition-opacity">
        {PARTNERS.map((p, i) => (
          <span
            key={`${p}-${i}`}
            className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight whitespace-nowrap"
          >
            {p}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
