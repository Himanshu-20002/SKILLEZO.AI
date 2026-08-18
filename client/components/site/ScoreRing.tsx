"use client";

import { motion } from "framer-motion";

interface ScoreRingProps {
  score?: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({ score = 87, size = 200, strokeWidth = 14 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#score-gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3D5AFE" />
            <stop offset="100%" stopColor="#00D9C0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center flex flex-col items-center">
        <span className="font-mono-num font-black text-5xl tracking-tight text-white">{score}</span>
        <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#8A90A6] mt-0.5">
          / 100 Score
        </span>
      </div>
    </div>
  );
}
