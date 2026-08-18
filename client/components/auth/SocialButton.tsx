"use client";

import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SocialButtonProps {
  provider: "google" | "linkedin";
  label?: string;
  className?: string;
}

export function SocialButton({ provider, label, className }: SocialButtonProps) {
  const handleClick = () => {
    const providerName = provider === "google" ? "Google" : "LinkedIn";
    toast.info(`${providerName} login coming soon!`, {
      description: "Frontend-only demo mode active. Better Auth integration pending.",
    });
  };

  const isGoogle = provider === "google";
  const defaultLabel = isGoogle ? "Google" : "LinkedIn";

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-xl bg-[#0B1130]/80 border border-white/10 py-3 px-4 text-sm font-medium text-white",
        "transition-all duration-200 hover:bg-[#141b4d] hover:border-white/20 hover:shadow-[0_0_20px_rgba(61,90,254,0.2)]",
        "cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/40",
        className
      )}
    >
      {isGoogle ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3c0 2.9.7 5.6 1.9 8l3.7-2.9c-.8-1.7-1.2-3.6-1.2-5.6z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
          />
        </svg>
      ) : (
        <svg className="h-4 w-4 fill-[#0A66C2]" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      )}
      <span>{label || defaultLabel}</span>
    </motion.button>
  );
}

export default SocialButton;
