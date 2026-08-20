'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import BrandLogo from '@/components/auth/BrandLogo';
import { sidebarNavigation, NavGroupItem } from './Sidebar';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sidebarNavigation.forEach((entry) => {
      if (entry.type === 'group') {
        const isChildActive = entry.children.some(
          (child) => pathname === child.href || pathname.startsWith(child.href)
        );
        initial[entry.id] = isChildActive;
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
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-[#080D26] border-r border-slate-800 h-full flex flex-col z-10 p-4 shadow-2xl animate-in slide-in-from-left duration-300">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 shrink-0">
          <BrandLogo href="/dashboard" />
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {sidebarNavigation.map((entry) => {
            if (entry.type === 'item') {
              const isActive =
                pathname === entry.href || (entry.href !== '/dashboard' && pathname.startsWith(entry.href));
              const Icon = entry.icon;

              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#3D5AFE]/20 text-white border-l-2 border-[#3D5AFE]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#3D5AFE]' : 'text-slate-400'}`} />
                  <span className="truncate">{entry.label}</span>

                  {entry.badge && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-[#00D9C0]/15 text-[#00D9C0] border border-[#00D9C0]/30 font-bold uppercase">
                      {entry.badge}
                    </span>
                  )}

                  {entry.badgeCount && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#3D5AFE] text-white">
                      {entry.badgeCount}
                    </span>
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isAnyChildActive
                      ? 'bg-[#3D5AFE]/10 text-white border-l-2 border-[#3D5AFE]/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <GroupIcon
                    className={`w-4 h-4 ${isAnyChildActive ? 'text-[#00D9C0]' : 'text-slate-400'}`}
                  />
                  <span className="truncate text-left flex-1 font-bold">{groupEntry.label}</span>

                  <motion.div animate={{ rotate: isGroupExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isGroupExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden pl-4 space-y-1 border-l border-slate-800 ml-4 my-1"
                    >
                      {groupEntry.children.map((child) => {
                        const isChildActive =
                          pathname === child.href || pathname.startsWith(child.href);
                        const ChildIcon = child.icon;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
                              isChildActive
                                ? 'bg-[#3D5AFE]/20 text-white font-bold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <ChildIcon
                              className={`w-3.5 h-3.5 ${
                                isChildActive ? 'text-[#00D9C0]' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{child.label}</span>

                            {child.badge && (
                              <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded-full bg-[#00D9C0]/15 text-[#00D9C0] border border-[#00D9C0]/30 font-bold uppercase">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
