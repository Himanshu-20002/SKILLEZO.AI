'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { X, ShieldCheck } from 'lucide-react';
import BrandLogo from '@/components/auth/BrandLogo';
import { useSession } from '@/lib/auth-client';
import dynamic from 'next/dynamic';
import { sidebarSections, adminSidebarSections, opportunitiesSection } from './Sidebar';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

const SidebarTokenWidget = dynamic(
  () => import('./SidebarTokenWidget').then((mod) => mod.SidebarTokenWidget),
  { ssr: false }
);

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { unreadCount: unreadMessagesCount } = useUnreadMessages();
  const isAdmin = (session?.user as any)?.role === 'admin' || session?.user?.email?.toLowerCase() === 'admin@gmail.com';
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isOpen) return null;

  const sectionsToRender = isAdmin || isAdminRoute ? adminSidebarSections : sidebarSections;
  const currentTab = searchParams?.get('tab') || 'overview';

  const isLinkActive = (href: string) => {
    if (isAdminRoute) {
      const [targetPath, targetQuery] = href.split('?');
      if (pathname !== targetPath) return false;
      const targetTab = targetQuery ? new URLSearchParams(targetQuery).get('tab') : 'overview';
      return (targetTab || 'overview') === currentTab;
    }
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
          <div className="flex items-center gap-2">
            <BrandLogo href={isAdminRoute ? '/admin/dashboard' : '/dashboard'} />
            {isAdminRoute && (
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Admin
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
          {sectionsToRender.map((section, sIdx) => (
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

        {/* Bottom Pinned Area (Candidate only): Opportunities above AI Credits */}
        {!isAdmin && !isAdminRoute && (
          <div className="pt-2 pb-1 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1 shrink-0">
            {opportunitiesSection.title && (
              <div className="px-3 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {opportunitiesSection.title}
              </div>
            )}

            {opportunitiesSection.items.map((item) => {
              const isActive = isLinkActive(item.href);
              const Icon = item.icon;
              const isMessages = item.href === '/dashboard/messages';
              const showUnread = isMessages && unreadMessagesCount > 0;
              const displayBadge = isMessages
                ? showUnread
                  ? unreadMessagesCount > 99
                    ? '99+'
                    : String(unreadMessagesCount)
                  : null
                : item.badge;

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

                  {displayBadge && (
                    <span
                      className={`ml-auto font-bold uppercase tracking-wider ${
                        isMessages
                          ? 'text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-xs'
                          : 'text-[9px] px-1.5 py-0.5 rounded-full bg-[#00D9C0]/15 text-[#00897B] dark:text-[#00D9C0] border border-[#00D9C0]/30'
                      }`}
                    >
                      {displayBadge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom AI Token / Credit Card (Candidate only) */}
        <div className="pb-3 border-t border-slate-200/80 dark:border-slate-800/80">
          <SidebarTokenWidget onItemClick={onClose} />
        </div>
      </div>
    </div>
  );
};
