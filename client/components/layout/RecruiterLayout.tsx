'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Briefcase,
  LayoutDashboard,
  Menu,
  X,
  Zap,
  Plus,
  Compass,
} from 'lucide-react';
import { UserMenu } from '@/components/layout/UserMenu';
import { CreateJobModal } from '@/components/recruiter/CreateJobModal';

interface RecruiterLayoutProps {
  children: React.ReactNode;
}

export const RecruiterLayout: React.FC<RecruiterLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createJobOpen, setCreateJobOpen] = useState(false);

  const navItems = [
    {
      label: 'Overview',
      href: '/recruiter',
      icon: LayoutDashboard,
    },
    {
      label: 'Applicant Pipeline',
      href: '/recruiter/applications',
      icon: Users,
    },
    {
      label: 'Talent Sourcing',
      href: '/recruiter/talent',
      icon: Compass,
    },
    {
      label: 'Job Openings',
      href: '/recruiter/jobs',
      icon: Briefcase,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B1E] text-slate-900 dark:text-white flex flex-col">
      {/* Recruiter Topbar Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B1130]/90 border-b border-slate-200/90 dark:border-slate-800/80 backdrop-blur-xl shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Recruiter Tag */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/recruiter" className="flex items-center gap-2.5 group">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#3D5AFE] to-[#6C63FF] shadow-[0_0_16px_rgba(61,90,254,0.4)] group-hover:scale-105 transition-transform">
                <Zap className="h-5 w-5 text-white" fill="white" />
              </span>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                SKILL<span className="text-[#3D5AFE] dark:text-[#00D9C0]">EZO</span>
              </span>
            </Link>


          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
                      ? 'bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20 text-[#3D5AFE] dark:text-[#8098FF] border border-[#3D5AFE]/25 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Right Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Post Job CTA */}
            <button
              onClick={() => setCreateJobOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3D5AFE] hover:bg-[#344cd9] text-white text-xs font-bold shadow-sm shadow-[#3D5AFE]/20 transition cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Job</span>
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Interactive User Menu with Profile, Theme & Sign Out */}
            <UserMenu />

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-3 bg-white dark:bg-[#0C122C] border-b border-slate-200 dark:border-slate-800 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${isActive
                      ? 'bg-[#3D5AFE]/10 text-[#3D5AFE] font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Global Create Job Modal */}
      <CreateJobModal
        isOpen={createJobOpen}
        onClose={() => setCreateJobOpen(false)}
        onJobCreated={(newJob) => {
          setCreateJobOpen(false);
        }}
      />
    </div>
  );
};
