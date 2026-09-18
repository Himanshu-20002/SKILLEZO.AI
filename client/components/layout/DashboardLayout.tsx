'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileSidebar } from './MobileSidebar';
import { useSession, authClient } from '@/lib/auth-client';
import { apiFetch } from '@/lib/api';
import { Lock, LogOut } from 'lucide-react';
import { CoachFloatingWidget } from '@/components/dashboard/ai-career-coach';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSuspended, setIsSuspended] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const searchError = new URLSearchParams(window.location.search).get('error');
      return (
        window.sessionStorage.getItem('account_suspended') === 'true' ||
        searchError === 'FORBIDDEN' ||
        searchError?.toLowerCase().includes('suspend') === true
      );
    }
    return false;
  });

  const rawUser = session?.user as any;
  const isAdmin = rawUser?.role === 'admin' || session?.user?.email?.toLowerCase() === 'admin@gmail.com';

  // Strict route isolation: Admins cannot access candidate routes, unauthenticated visitors redirected to login
  useEffect(() => {
    if (isPending) return;

    // Check if URL has error from OAuth suspension
    const searchError = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('error') : null;
    if (searchError === 'FORBIDDEN' || searchError?.toLowerCase().includes('suspend')) {
      setIsSuspended(true);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('account_suspended', 'true');
      }
      return;
    }

    if (isAdmin && !pathname.startsWith('/admin')) {
      router.replace('/admin/dashboard');
      return;
    }

    if (!isAdmin && pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      router.replace('/dashboard');
      return;
    }

    // Unauthenticated guest users cannot view the dashboard
    if (!session?.user && !isSuspended && typeof window !== 'undefined' && window.sessionStorage.getItem('account_suspended') !== 'true') {
      router.replace('/login');
    }
  }, [isAdmin, pathname, isPending, router, session?.user, isSuspended]);

  // Real-time check for account suspension
  useEffect(() => {
    let isMounted = true;

    // Check if session storage or URL query already flagged suspended
    if (typeof window !== 'undefined') {
      const searchError = new URLSearchParams(window.location.search).get('error');
      if (window.sessionStorage.getItem('account_suspended') === 'true' || searchError === 'FORBIDDEN' || searchError?.toLowerCase().includes('suspend')) {
        setIsSuspended(true);
      }
    }

    async function verifySuspension() {
      try {
        const res = await apiFetch<{ success: boolean; data: { isSuspended: boolean; accountStatus: string; authenticated?: boolean } }>('/api/user/status');
        if (isMounted) {
          if (res?.data?.isSuspended) {
            setIsSuspended(true);
            if (typeof window !== 'undefined') {
              window.sessionStorage.setItem('account_suspended', 'true');
            }
          } else if (res?.data?.authenticated) {
            setIsSuspended(false);
            if (typeof window !== 'undefined') {
              window.sessionStorage.removeItem('account_suspended');
            }
          }
        }
      } catch (err: any) {
        if (err?.code === 'ACCOUNT_SUSPENDED' || err?.status === 403) {
          if (isMounted) setIsSuspended(true);
        }
      }
    }

    if (!isPending) {
      verifySuspension();
    }

    const handleSuspendedEvent = () => setIsSuspended(true);
    window.addEventListener('account-suspended', handleSuspendedEvent);

    return () => {
      isMounted = false;
      window.removeEventListener('account-suspended', handleSuspendedEvent);
    };
  }, [isPending]);

  // Handle logout for suspended users
  const handleSuspendedLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('skillezo_token');
        sessionStorage.removeItem('account_suspended');
      }
      await authClient.signOut();
      router.replace('/login');
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#0B1130] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-[#3D5AFE]/30 selection:text-white">
      {/* Background Dashboard Content (blurred and non-interactive when suspended) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSuspended ? 'filter blur-[5px] pointer-events-none select-none opacity-60' : ''
        }`}
        aria-hidden={isSuspended}
      >
        {/* Desktop Sidebar */}
        <React.Suspense fallback={<aside className="hidden md:flex w-64 fixed top-0 left-0 bottom-0 bg-white dark:bg-[#080D26]" />}>
          <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
        </React.Suspense>

        {/* Mobile Drawer */}
        <React.Suspense fallback={null}>
          <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        </React.Suspense>

        {/* Top Header */}
        <Topbar onOpenMobileSidebar={() => setMobileOpen(true)} collapsed={collapsed} />

        {/* Main View Area */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
            collapsed ? 'md:ml-20' : 'md:ml-64'
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>

        {/* Global Floating AI Career Coach Assistant Widget */}
        {!isAdmin && !isSuspended && <CoachFloatingWidget />}
      </div>

      {/* Centered Glassmorphism Lock Screen Overlay when user is suspended */}
      {isSuspended && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 dark:bg-[#070b1e]/75 backdrop-blur-[6px] animate-in fade-in duration-300">
          {/* Ambient radial glowing backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-red-500/25 via-rose-500/15 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Frosted Glass Card */}
          <div className="relative max-w-lg w-full rounded-3xl p-8 sm:p-10 bg-white/85 dark:bg-[#0c1236]/90 backdrop-blur-2xl border border-white/60 dark:border-red-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] text-center space-y-6 overflow-hidden">
            {/* Internal ambient corner glows */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/20 dark:bg-red-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 dark:bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Lock Icon with Glowing Ring */}
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 via-rose-500/15 to-red-600/25 border border-red-500/40 flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8 text-red-500" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase bg-red-500/10 px-3 py-1 rounded-full border border-red-500/25">
                Access Restricted
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Account Suspended
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                Your Skillezo account has been suspended by an administrator. All candidate dashboard features, assessments, and applications are locked.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left text-xs text-slate-600 dark:text-slate-300">
              <span className="text-[11px] text-slate-400 block font-medium">Logged in account:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-white truncate block">
                {session?.user?.email}
              </span>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                href="/account-suspended"
                className="w-full py-3 px-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Account Suspension Notice</span>
              </Link>

              <button
                onClick={handleSuspendedLogout}
                className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

