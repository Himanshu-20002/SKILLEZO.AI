'use client';

import React from 'react';
import { UserCheck } from 'lucide-react';
import { CardHeader } from '@/components/dashboard/common/CardHeader';
import { mockExtendedProfile } from '@/mock/profile';
import { toast } from 'sonner';

export const ProfileSettings: React.FC = () => {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Public profile preferences saved');
  };

  return (
    <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md space-y-6 shadow-sm dark:shadow-md">
      <CardHeader
        title="Public Profile Settings"
        subtitle="Control how your profile appears to recruiters and peers"
        icon={<UserCheck className="w-5 h-5 text-[#00D9C0]" />}
      />

      <div className="space-y-4 max-w-xl">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Professional Headline</label>
          <input
            type="text"
            defaultValue={mockExtendedProfile.headline}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-[#3D5AFE]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location</label>
          <input
            type="text"
            defaultValue={mockExtendedProfile.location}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-[#3D5AFE]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bio Summary</label>
          <textarea
            rows={3}
            defaultValue={mockExtendedProfile.bio}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-[#3D5AFE]"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white text-xs font-semibold shadow-md shadow-[#3D5AFE]/20 transition-all cursor-pointer"
        >
          Save Profile Changes
        </button>
      </div>
    </form>
  );
};
