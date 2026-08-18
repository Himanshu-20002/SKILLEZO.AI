"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  [key: string]: unknown;
}

export function Reveal({ children, delay = 0, y = 28, className = "", ...props }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface MaskedLinesProps {
  lines: (string | ReactNode)[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}

export function MaskedLines({ lines, className = "", lineClassName = "", delay = 0 }: MaskedLinesProps) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="reveal-mask p-2">
          <motion.span
            className={`block ${lineClassName}`}
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 0.9,
              delay: delay + i * 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
