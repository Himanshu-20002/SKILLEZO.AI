'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Compass, UserCheck, TrendingUp, Award, ArrowUpRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const StudentPortalHeader: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-[#0E1535] text-white p-6 sm:p-10 border border-slate-800 shadow-2xl">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-12 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Greeting & Main Pitch */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Career Portal
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 backdrop-blur-md">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Target: Full-Stack Engineer
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Welcome, Alex
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
              Your AI career assistant analyzed your skill progress. You’re on track for your target role with an elevated <span className="text-emerald-400 font-semibold">78% readiness index</span>.
            </p>
          </div>

          {/* Clean Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/dashboard/ai-career-coach"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              Ask AI Coach
            </Link>
            <Link
              href="/dashboard/career-gps"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-sm transition-all duration-200 border border-slate-700/80"
            >
              <Compass className="w-4 h-4 text-slate-400" />
              Career Roadmap
            </Link>
          </div>
        </div>

        {/* Right Column: Clean Metric Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-white/5 dark:bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Employability Index
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/20">
                Top 15%
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white tracking-tight">78</span>
                <span className="text-sm font-semibold text-slate-400">/100</span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-md">
                +4 pts this week
              </span>
            </div>

            {/* Smooth Clean Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: '78%' }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Intermediate</span>
                <span className="text-indigo-300 font-medium">Goal: 85+</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Award className="w-4 h-4 text-amber-400" /> 4 Skills Verified
              </span>
              <Link href="/dashboard/employability-index" className="text-indigo-300 hover:text-white font-medium flex items-center gap-0.5">
                Full Report <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
