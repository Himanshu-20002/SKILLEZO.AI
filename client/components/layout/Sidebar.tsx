'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  GraduationCap,
  FileText,
  Target,
  BarChart3,
  Compass,
  UserCheck,
  Briefcase,
  LucideIcon,
} from 'lucide-react';
import BrandLogo from '@/components/auth/BrandLogo';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export interface NavSingleItem {
  type?: 'item';
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeCount?: number;
}

export interface NavGroupItem {
  type: 'group';
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  children: {
    label: string;
    href: string;
    icon: LucideIcon;
    badge?: string;
  }[];
}

export type NavEntry = NavSingleItem | NavGroupItem;

export const sidebarNavigation: NavEntry[] = [
  {
    type: 'item',
    label: 'Dashboard Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    type: 'item',
    label: 'Student Portal Hub',
    href: '/dashboard/student-portal',
    icon: GraduationCap,
    badge: 'CORE',
  },
  {
    type: 'item',
    label: 'Smart Job Center',
    href: '/dashboard/job-center',
    icon: Briefcase,
    badge: 'JOBS',
  },
  {
    type: 'item',
    label: 'Career Profile',
    href: '/dashboard/profile',
    icon: UserCheck,
  },
  {
    type: 'item',
    label: 'AI Resume Intelligence',
    href: '/dashboard/resume-intelligence',
    icon: FileText,
  },
  {
    type: 'item',
    label: 'Skill Gap Analysis',
    href: '/dashboard/skill-gap-analysis',
    icon: Target,
  },
  {
    type: 'item',
    label: 'Employability Score',
    href: '/dashboard/employability-index',
    icon: BarChart3,
  },
  {
    type: 'item',
    label: 'Career GPS Roadmap',
    href: '/dashboard/career-gps',
    icon: Compass,
  },
  {
    type: 'item',
    label: 'Skill Verification',
    href: '/dashboard/skill-verification',
    icon: Award,
    badge: 'VERIFIED',
  },
];

export const sidebarNavItems: NavSingleItem[] = sidebarNavigation.flatMap((entry) =>
  entry.type === 'group'
    ? entry.children.map((child) => ({
        type: 'item' as const,
        label: child.label,
        href: child.href,
        icon: child.icon,
        badge: child.badge,
      }))
    : [entry]
);

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sidebarNavigation.forEach((entry) => {
      if (entry.type === 'group') {
        const isChildActive = entry.children.some(
          (child) => pathname === child.href || pathname.startsWith(child.href)
        );
        initial[entry.id] = isChildActive || true;
      }
    });
    return initial;
  });

  useEffect(() => {
    sidebarNavigation.forEach((entry) => {
      if (entry.type === 'group') {
        const isChildActive = entry.children.some(
          (child) => pathname === child.href || pathname.startsWith(child.href)
        );
        if (isChildActive) {
          setOpenGroups((prev) => ({ ...prev, [entry.id]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    if (collapsed) {
      onToggleCollapse();
    }
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
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
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        {sidebarNavigation.map((entry) => {
          if (entry.type === 'item') {
            const isActive =
              pathname === entry.href || (entry.href !== '/dashboard' && pathname.startsWith(entry.href));
            const Icon = entry.icon;

            return (
              <Link
                key={entry.href}
                href={entry.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-[#3D5AFE]/10 dark:bg-gradient-to-r dark:from-[#3D5AFE]/25 dark:to-[#3D5AFE]/5 text-[#3D5AFE] dark:text-white border-l-2 border-[#3D5AFE] shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#3D5AFE]' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                  }`}
                />

                {!collapsed && <span className="truncate">{entry.label}</span>}

                {!collapsed && entry.badge && (
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-[#00D9C0]/15 text-[#00897B] dark:text-[#00D9C0] border border-[#00D9C0]/30 font-bold uppercase tracking-wider">
                    {entry.badge}
                  </span>
                )}

                {/* Tooltip on collapse */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
                    {entry.label}
                  </div>
                )}
              </Link>
            );
          }

          // GROUP ITEM
          const groupEntry = entry as NavGroupItem;
          const isGroupExpanded = !!openGroups[groupEntry.id];
          const isAnyChildActive = groupEntry.children.some(
            (child) => pathname === child.href || pathname.startsWith(child.href)
          );
          const GroupIcon = groupEntry.icon;

          return (
            <div key={groupEntry.id} className="space-y-1">
              <button
                onClick={() => toggleGroup(groupEntry.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                  isAnyChildActive
                    ? 'bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-white border-l-2 border-[#3D5AFE]/80'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <GroupIcon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isAnyChildActive ? 'text-[#3D5AFE] dark:text-[#00D9C0]' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                  }`}
                />

                {!collapsed && <span className="truncate text-left flex-1 font-bold">{groupEntry.label}</span>}

                {!collapsed && groupEntry.badge && (
                  <span className="mr-1 text-[9px] px-1.5 py-0.5 rounded-full bg-[#3D5AFE]/15 text-[#3D5AFE] border border-[#3D5AFE]/30 font-bold uppercase">
                    {groupEntry.badge}
                  </span>
                )}

                {!collapsed && (
                  <motion.div
                    animate={{ rotate: isGroupExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </motion.div>
                )}

                {/* Tooltip on collapse */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
                    {groupEntry.label}
                  </div>
                )}
              </button>

              {/* Group Children List */}
              {!collapsed && (
                <AnimatePresence initial={false}>
                  {isGroupExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden pl-4 space-y-1 border-l border-slate-200 dark:border-slate-800/80 ml-4 my-1"
                    >
                      {groupEntry.children.map((child) => {
                        const isChildActive =
                          pathname === child.href || pathname.startsWith(child.href);
                        const ChildIcon = child.icon;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all group ${
                              isChildActive
                                ? 'bg-[#3D5AFE]/10 dark:bg-gradient-to-r dark:from-[#3D5AFE]/25 dark:to-transparent text-[#3D5AFE] dark:text-white font-bold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <ChildIcon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isChildActive ? 'text-[#3D5AFE] dark:text-[#00D9C0]' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                              }`}
                            />
                            <span className="truncate">{child.label}</span>

                            {child.badge && (
                              <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded-full bg-[#00D9C0]/15 text-[#00897B] dark:text-[#00D9C0] border border-[#00D9C0]/30 font-bold uppercase">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Pro Banner */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-xl bg-slate-50 dark:bg-gradient-to-b dark:from-[#3D5AFE]/15 dark:to-transparent border border-slate-200 dark:border-[#3D5AFE]/20 text-center shrink-0">
          <div className="inline-flex p-1.5 rounded-lg bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#00D9C0] mb-1">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Student Portal</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Career & Job Portal</p>
        </div>
      )}
    </aside>
  );
};
