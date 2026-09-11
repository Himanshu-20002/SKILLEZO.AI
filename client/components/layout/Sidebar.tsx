'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserCircle,
  FileText,
  Target,
  BarChart3,
  Compass,
  Award,
  GraduationCap,
  FolderGit2,
  Bot,
  Briefcase,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Zap,
  LucideIcon,
} from 'lucide-react';
import BrandLogo from '@/components/auth/BrandLogo';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const sidebarSections: NavSection[] = [
  {
    items: [
      {
        label: 'Dashboard Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'CAREER INTELLIGENCE',
    items: [
      {
        label: 'Career Profile',
        href: '/dashboard/career-profile',
        icon: UserCircle,
      },
      {
        label: 'Resume Studio',
        href: '/dashboard/resume-studio',
        icon: Sparkles,
        badge: 'NEW',
      },
      {
        label: 'Resume Intelligence',
        href: '/dashboard/resume-intelligence',
        icon: FileText,
        badge: 'AI',
      },
      {
        label: 'Skill Gap Analysis',
        href: '/dashboard/skill-gap-analysis',
        icon: Target,
      },
      {
        label: 'Employability Index',
        href: '/dashboard/employability-index',
        icon: BarChart3,
        badge: '88%',
      },
      {
        label: 'Career GPS',
        href: '/dashboard/career-gps',
        icon: Compass,
      },
    ],
  },
  {
    title: 'SKILLS & LEARNING',
    items: [
      {
        label: 'Skill Assessments',
        href: '/dashboard/assessments',
        icon: Award,
        badge: 'TEST',
      },
      {
        label: 'Learning Hub',
        href: '/dashboard/learning-hub',
        icon: GraduationCap,
      },
      {
        label: 'Projects & Portfolio',
        href: '/dashboard/projects',
        icon: FolderGit2,
      },
      {
        label: 'AI Career Coach',
        href: '/dashboard/ai-career-coach',
        icon: Bot,
        badge: 'PRO',
      },
    ],
  },
  {
    title: 'OPPORTUNITIES',
    items: [
      {
        label: 'Smart Job Center',
        href: '/dashboard/job-center',
        icon: Briefcase,
        badge: 'JOBS',
      },
      {
        label: 'Job Matches',
        href: '/dashboard/job-center?tab=recommended',
        icon: Sparkles,
        badge: 'MATCH',
      },
    ],
  },
  {
    title: 'VERIFICATION',
    items: [
      {
        label: 'Skill Verification',
        href: '/dashboard/skill-verification',
        icon: ShieldCheck,
        badge: 'VERIFIED',
      },
      {
        label: 'Certifications',
        href: '/dashboard/skill-verification',
        icon: CheckCircle2,
      },
    ],
  },
];

export const sidebarNavItems: NavItem[] = sidebarSections.flatMap((s) => s.items);

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    const basePath = href.split('?')[0];
    if (basePath === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === basePath || pathname.startsWith(basePath);
  };

  return (
    <aside
      className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-40 bg-white/95 dark:bg-[#080D26]/95 border-r border-slate-200 dark:border-slate-800/80 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header / Brand */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 shrink-0">
        {!collapsed && <BrandLogo href="/dashboard" />}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3D5AFE] to-[#00D9C0] flex items-center justify-center text-white font-bold text-lg shadow-lg">
              S
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-3 px-3 space-y-4 overflow-y-auto custom-scrollbar">
        {sidebarSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {/* Section Category Header */}
            {section.title && !collapsed && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.title}
              </div>
            )}

            {section.title && collapsed && (
              <div className="my-2 border-t border-slate-200 dark:border-white/[0.06]" />
            )}

            {/* Section Nav Items */}
            {section.items.map((item) => {
              const isActive = isLinkActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all group relative ${
                    isActive
                      ? 'bg-[#3D5AFE]/10 dark:bg-gradient-to-r dark:from-[#3D5AFE]/25 dark:to-[#3D5AFE]/5 text-[#3D5AFE] dark:text-white border-l-2 border-[#3D5AFE] shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-[#3D5AFE] dark:text-[#00D9C0]'
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                    }`}
                  />

                  {!collapsed && <span className="truncate">{item.label}</span>}

                  {!collapsed && item.badge && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-[#00D9C0]/15 text-[#00897B] dark:text-[#00D9C0] border border-[#00D9C0]/30 font-bold uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip on collapse */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Pro Banner */}
      {!collapsed && (
        <div className="p-3.5 m-3 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 text-center shrink-0 shadow-sm transition-colors">
          <div className="inline-flex p-2 rounded-xl bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20 text-[#3D5AFE] dark:text-[#00D9C0] mb-1.5">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">SKILLEZO AI</h4>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Enterprise Career Intelligence</p>
        </div>
      )}
    </aside>

  );
};

