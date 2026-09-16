"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

interface SocialButtonProps {
  provider: "google" | "linkedin";
  label?: string;
  className?: string;
}

export function SocialButton({ provider, label, className }: SocialButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (provider === "google") {
      try {
        setIsLoading(true);
        toast.loading("Redirecting to Google Sign-In...", { id: "google-auth" });
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const callbackURL = origin ? `${origin}/dashboard` : "/dashboard";
        const errorCallbackURL = origin ? `${origin}/account-suspended` : "/account-suspended";
        await authClient.signIn.social({
          provider: "google",
          callbackURL,
          errorCallbackURL,
        });
      } catch (err: any) {
        toast.error(err?.message || "Google sign-in failed. Please try again.", { id: "google-auth" });
        setIsLoading(false);
      }
      return;
    }

    toast.info("LinkedIn login coming soon!", {
      description: "LinkedIn authentication will be available in an upcoming release.",
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
      disabled={isLoading}
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-xl bg-[#0B1130]/80 border border-white/10 py-3 px-4 text-sm font-medium text-white",
        "transition-all duration-200 hover:bg-[#141b4d] hover:border-white/20 hover:shadow-[0_0_20px_rgba(61,90,254,0.2)]",
        "cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/40 disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
      ) : isGoogle ? (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      ) : (
        <svg className="h-5 w-5 fill-[#0A66C2] shrink-0" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      )}
      <span>{isLoading ? "Connecting..." : label || defaultLabel}</span>
    </motion.button>
  );
}

export default SocialButton;
