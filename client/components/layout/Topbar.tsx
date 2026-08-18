'use client';

import React, { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { UserMenu } from './UserMenu';
import { NotificationDropdown } from './NotificationDropdown';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
  collapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileSidebar, collapsed }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      className={`sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#0B1130]/80 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? 'md:pl-20' : 'md:pl-64'
      }`}
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu Trigger + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Breadcrumb />
        </div>

        {/* Center / Right Section: Search & User Controls */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          {/* Topbar Quick Search */}
          <div className="relative hidden md:flex items-center w-64 lg:w-80">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, assessments, candidates..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-[#3D5AFE] transition-all"
            />
          </div>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* User Profile Dropdown Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
