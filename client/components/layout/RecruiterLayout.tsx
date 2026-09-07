'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Briefcase,
  Layers,
  LayoutDashboard,
  Shield,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Building2,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { UserAvatar } from '@/components/dashboard/common/UserAvatar';

interface RecruiterLayoutProps {
  children: React.ReactNode;
}

export const RecruiterLayout: React.FC<RecruiterLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Recruiter';
  const displayEmail = session?.user?.email || 'recruiter@company.com';

  const navItems = [
    {
      label: 'Applicant Pipeline',
      href: '/recruiter/applications',
      icon: Users,
      badge: 'LIVE',
    },
    {
      label: 'Active Job Openings',
      href: '/dashboard/job-center',
      icon: Briefcase,
    },
    {
      label: 'Candidate View',
      href: '/dashboard',
      icon: LayoutDashboard,
      external: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B1E] text-slate-900 dark:text-white flex flex-col">
      {/* Recruiter Topbar Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0C122C]/95 border-b border-slate-200/90 dark:border-slate-800/80 backdrop-blur-xl shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Recruiter Badge */}
          <div className="flex items-center gap-4">
            <Link href="/recruiter/applications" className="flex items-center gap-2.5 group">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#3D5AFE] to-[#6C63FF] shadow-[0_0_16px_rgba(61,90,254,0.4)] group-hover:scale-105 transition-transform">
                <Zap className="h-5 w-5 text-white" fill="white" />
              </span>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                SKILL<span className="text-[#3D5AFE] dark:text-[#00D9C0]">EZO</span>
              </span>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
              <Building2 className="w-3.5 h-3.5" />
              Recruiter Workspace
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20 text-[#3D5AFE] dark:text-[#8098FF] border border-[#3D5AFE]/20 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Right Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
              <UserAvatar name={displayName} size="sm" />
              <div className="text-left leading-tight">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate max-w-[130px]">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[130px]">
                  Enterprise Hiring
                </span>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-4 bg-white dark:bg-[#0C122C] border-b border-slate-200 dark:border-slate-800 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-[#3D5AFE]/10 text-[#3D5AFE] font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600">
                      {item.badge}
                    </span>
                  )}
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
    </div>
  );
};
