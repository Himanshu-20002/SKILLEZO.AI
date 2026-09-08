'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import BrandLogo from '@/components/auth/BrandLogo';
import { sidebarSections } from './Sidebar';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  if (!isOpen) return null;

  const isLinkActive = (href: string) => {
    const basePath = href.split('?')[0];
    if (basePath === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === basePath || pathname.startsWith(basePath);
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#080D26] border-r border-slate-200 dark:border-slate-800 h-full flex flex-col z-10 p-4 shadow-2xl animate-in slide-in-from-left duration-300">
        <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <BrandLogo href="/dashboard" />
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
          {sidebarSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.title}
                </div>
              )}

              {section.items.map((item) => {
                const isActive = isLinkActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20 text-[#3D5AFE] dark:text-white border-l-2 border-[#3D5AFE]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#3D5AFE]' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>

                    {item.badge && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-[#00D9C0]/15 text-[#00897B] dark:text-[#00D9C0] border border-[#00D9C0]/30 font-bold uppercase">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


