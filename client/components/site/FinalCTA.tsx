"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface FinalCTAProps {
  onGetScore: () => void;
}

export function FinalCTA({ onGetScore }: FinalCTAProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const handleClick = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      onGetScore();
    }
  };

  return (
    <section className="relative z-10 py-20 lg:py-32" data-testid="final-cta">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] signature-gradient p-10 sm:p-16 lg:p-24 text-center shadow-2xl">
            {/* Background radial shine */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 50%)",
              }}
              aria-hidden
            />

            {/* Floating top-right circle ring */}
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-8 right-8 sm:top-10 sm:right-10 h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-white/25 pointer-events-none hidden sm:block"
              aria-hidden
            />

            <div className="relative z-10">
              <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
                {isLoggedIn ? "Welcome back to SKILLEZO AI" : "Your Employability Score is waiting."}
              </h2>
              <p className="mt-4 sm:mt-6 text-white/90 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                {isLoggedIn
                  ? "Access your candidate dashboard, resume intelligence tools, and personalized career roadmaps."
                  : "Join 50,000+ students who stopped guessing and started getting hired. It's free, and it takes two minutes."}
              </p>
              <Button
                onClick={handleClick}
                data-testid="final-cta-btn"
                className="mt-8 sm:mt-10 h-14 rounded-full bg-white text-[#0B1130] hover:bg-white/90 px-9 text-base font-bold group shadow-2xl cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                {isLoggedIn ? (
                  <>
                    <LayoutDashboard className="h-5 w-5" /> Go to Dashboard
                  </>
                ) : (
                  <>
                    Get your free score
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
