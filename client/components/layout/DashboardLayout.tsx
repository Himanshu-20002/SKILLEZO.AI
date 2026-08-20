'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileSidebar } from './MobileSidebar';
import { useSession } from '@/lib/auth-client';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1130] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-[#3D5AFE]/30 selection:text-white">
      {/* Desktop Sidebar */}
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />

      {/* Mobile Drawer */}
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Top Header */}
      <Topbar onOpenMobileSidebar={() => setMobileOpen(true)} collapsed={collapsed} />

      {/* Main View Area */}
      <main
        className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-64'
          }`}
      >
        <div className="max-w-7xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
};

