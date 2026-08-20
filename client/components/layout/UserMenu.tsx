'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  Laptop,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { UserAvatar } from '@/components/dashboard/common/UserAvatar';
import { mockCurrentUser } from '@/mock/users';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { toast } from 'sonner';
import { useSession, signOut } from '@/lib/auth-client';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const user = session?.user
    ? {
        name: session.user.name || mockCurrentUser.name,
        email: session.user.email || mockCurrentUser.email,
        role: (session.user as any).role || mockCurrentUser.role,
        avatarUrl: session.user.image || mockCurrentUser.avatarUrl,
      }
    : mockCurrentUser;

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

  const handleHelp = () => {
    setIsOpen(false);
    toast.info('Help & Support', {
      description: 'Our support team is available 24/7 at support@skillezo.ai',
    });
  };

  const handlePrivacy = () => {
    setIsOpen(false);
    toast.info('Privacy Policy', {
      description: 'SKILLEZO AI protects candidate data under strict enterprise privacy standards.',
    });
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
                href="/dashboard/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <Settings className="w-4 h-4 text-[#00D9C0]" />
                <span>Account Settings</span>
              </Link>

              <Link
                href="/account-suspended"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              >
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Security Status</span>
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

            {/* Section 4: Account Actions */}
            <div className="pt-1.5 space-y-0.5">
              <button
                onClick={handleHelp}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Help & Support</span>
              </button>

              <button
                onClick={handlePrivacy}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Privacy Policy</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer mt-1"
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
