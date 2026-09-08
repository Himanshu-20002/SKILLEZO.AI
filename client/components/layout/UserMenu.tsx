'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  Wallet,
  LineChart,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { UserAvatar } from '@/components/dashboard/common/UserAvatar';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { toast } from 'sonner';
import { useSession, signOut } from '@/lib/auth-client';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const derivedName = session?.user?.name
    || (session?.user?.email ? session.user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '')
    || 'Candidate';

  const derivedEmail = session?.user?.email || '';
  const derivedRole = (session?.user as any)?.role || 'Candidate';

  const user = session?.user
    ? {
        name: derivedName,
        email: derivedEmail,
        role: derivedRole,
        avatarUrl: session.user.image || '',
      }
    : {
        name: 'Candidate',
        email: '',
        role: 'Candidate',
        avatarUrl: '',
      };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("skillezo_token");
      }
      await signOut();
      toast.success('Logged out successfully', {
        description: 'You have been safely signed out of SKILLEZO AI.',
      });
    } catch (error) {
      toast.error('Logout error', { description: 'Failed to sign out.' });
    } finally {
      router.push('/login');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus:outline-none cursor-pointer"
        aria-expanded={isOpen}
      >
        <UserAvatar
          name={user.name}
          avatarUrl={user.avatarUrl}
          size="sm"
          showStatusBadge
        />
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{user.name}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[110px] font-medium">
            {user.role}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-900 dark:text-white' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0F172A]/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl p-2 z-50 divide-y divide-slate-100 dark:divide-slate-800/80"
          >
            {/* Section 1: User Information */}
            <div className="p-3 pb-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                  size="md"
                />
                <div className="space-y-0.5 overflow-hidden">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  <span className="inline-block text-[9px] px-2 py-0.5 rounded-full bg-[#3D5AFE]/15 text-[#3D5AFE] font-bold border border-[#3D5AFE]/30 uppercase">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Core Navigation */}
            <div className="py-1.5 space-y-0.5">
              <Link
                href="/dashboard/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <User className="w-4 h-4 text-[#3D5AFE]" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/dashboard/wallet"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-4 h-4 text-amber-500" />
                  <span>Wallet & Tokens</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Tokens
                </span>
              </Link>

              <Link
                href="/dashboard/progress-analytics"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <LineChart className="w-4 h-4 text-emerald-500" />
                <span>Progress Analytics</span>
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <Settings className="w-4 h-4 text-[#00D9C0]" />
                <span>Account Settings</span>
              </Link>
            </div>

            {/* Section 3: Appearance & Theme Selector */}
            <div className="py-2 px-1 space-y-1.5">
              <div className="px-2 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>Appearance</span>
                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 capitalize">{theme}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {(
                  [
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'system', label: 'System', icon: Laptop },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const isActive = theme === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setTheme(item.id as ThemeMode)}
                      className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#3D5AFE] text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Sign Out */}
            <div className="pt-1.5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

