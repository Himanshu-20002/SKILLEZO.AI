"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/auth/BrandLogo";
import BrandSection from "@/components/auth/BrandSection";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0B1130] text-white selection:bg-[#00D9C0] selection:text-[#0B1130]">
      {/* Background Glowing Ambient Orbs */}
      <div className="pointer-events-none fixed -left-52 -top-52 h-[650px] w-[650px] rounded-full bg-[#3D5AFE]/20 blur-[180px]" />
      <div className="pointer-events-none fixed -right-52 -bottom-52 h-[650px] w-[650px] rounded-full bg-[#00D9C0]/20 blur-[180px]" />
      <div className="pointer-events-none fixed left-1/3 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#3D5AFE]/10 blur-[200px]" />

      {/* Grid Pattern Overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Top Header Navbar */}
      <header className="relative z-20 w-full border-b border-white/5 bg-[#0B1130]/60 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <BrandLogo size="md" href="/" />

          <Link
            href="/"
            className="group flex items-center gap-2 text-xs sm:text-sm font-medium text-[#8A90A6] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Grid Content Area */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-10 py-10 lg:py-12">
        <div className="grid w-full grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand Showcase Panel (Visible on Desktop lg+) */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-6 h-full">
            <BrandSection />
          </div>

          {/* Right Column: Authentication Card Form */}
          <div className="col-span-1 lg:col-span-6 xl:col-span-6 flex justify-center w-full max-w-lg mx-auto">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
