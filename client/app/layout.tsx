import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "SKILLEZO.AI — Know Your Employability Score. Get Hired.",
  description: "AI career intelligence that benchmarks your profile against live hiring data, calculates your Employability Index, and provides a step-by-step Career GPS.",
  keywords: ["AI Career Intelligence", "Employability Score", "Resume Analyzer", "Career GPS", "Job Readiness"],
  openGraph: {
    title: "SKILLEZO.AI — AI Career Intelligence",
    description: "Know your score, close the gap, get hired.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B1130] text-slate-900 dark:text-white selection:bg-[#3D5AFE]/30 selection:text-white transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
