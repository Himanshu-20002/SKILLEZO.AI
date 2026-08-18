'use client';

import React from 'react';
import { User, Trash2 } from 'lucide-react';
import { CardHeader } from '@/components/dashboard/common/CardHeader';
import { mockCurrentUser } from '@/mock/users';
import { toast } from 'sonner';

export const AccountSettings: React.FC = () => {
  const handleDeleteAccount = () => {
    toast.error('Delete account modal opened (UI Prototype Mode)');
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md space-y-6 shadow-sm dark:shadow-md">
      <CardHeader
        title="Account Preferences"
        subtitle="Manage primary account identity and email settings"
        icon={<User className="w-5 h-5 text-[#3D5AFE]" />}
      />

      <div className="space-y-4 max-w-xl">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
          <input
            type="text"
            defaultValue={mockCurrentUser.name}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-[#3D5AFE]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Email Address</label>
          <input
            type="email"
            defaultValue={mockCurrentUser.email}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-[#3D5AFE]"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-rose-500">Danger Zone</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Permanently delete your account & cryptographic records</p>
          </div>

          <button
            onClick={handleDeleteAccount}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
