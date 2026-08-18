"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Toaster } from "sonner";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { TrustBar } from "@/components/site/TrustBar";
import { Features } from "@/components/site/Features";
import { HowItWorks } from "@/components/site/HowItWorks";
import { ScoreShowcase } from "@/components/site/ScoreShowcase";
import { CareerSolutions } from "@/components/site/CareerSolutions";
import { SuccessStories } from "@/components/site/SuccessStories";
import { Pricing } from "@/components/site/Pricing";
import { Resources } from "@/components/site/Resources";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Footer } from "@/components/site/Footer";

const ScoreDialog = dynamic(
  () => import("@/components/site/ScoreDialog").then((mod) => mod.ScoreDialog),
  { ssr: false }
);

export default function Home() {
  const [open, setOpen] = useState(false);
  const getScore = () => setOpen(true);

  return (
    <div className="relative min-h-screen bg-[#0B1130] text-white overflow-hidden" data-testid="home">
      <Navbar onGetScore={getScore} />
      <main>
        <Hero onGetScore={getScore} />
        <TrustBar />
        <Features />
        <HowItWorks />
        <ScoreShowcase onGetScore={getScore} />
        <CareerSolutions />
        <SuccessStories />
        <Pricing onGetScore={getScore} />
        <Resources />
        <FinalCTA onGetScore={getScore} />
      </main>
      <Footer />
      <ScoreDialog open={open} onOpenChange={setOpen} />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(11,17,48,0.9)",
            border: "1px solid rgba(0,217,192,0.3)",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}
