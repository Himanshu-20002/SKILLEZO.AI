"use client";

import { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  gap?: string;
}

export function Marquee({ children, className = "", gap = "gap-8" }: MarqueeProps) {
  return (
    <div
      className={`relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] ${className}`}
    >
      <div className={`flex shrink-0 animate-marquee items-stretch ${gap} pr-6 md:pr-8 hover:[animation-play-state:paused]`}>
        {children}
      </div>
      <div
        aria-hidden="true"
        className={`flex shrink-0 animate-marquee items-stretch ${gap} pr-6 md:pr-8 hover:[animation-play-state:paused]`}
      >
        {children}
      </div>
    </div>
  );
}
