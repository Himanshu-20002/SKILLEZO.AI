'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { CardHeader } from '@/components/dashboard/common/CardHeader';
import { toast } from 'sonner';

export const NotificationSettings: React.FC = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [verificationNotifs, setVerificationNotifs] = useState(true);
  const [marketingNews, setMarketingNews] = useState(false);

  const handleSave = () => {
    toast.success('Notification preferences updated');
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md space-y-6 shadow-sm dark:shadow-md">
      <CardHeader
        title="Notification Preferences"
        subtitle="Manage email digests & real-time platform alerts"
        icon={<Bell className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
      />

      <div className="space-y-4 max-w-xl">
        <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Email Security & System Alerts</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Receive critical account logins & system updates</span>
          </div>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => {
              setEmailAlerts(e.target.checked);
              handleSave();
            }}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#3D5AFE] focus:ring-[#3D5AFE]"
          />
        </label>

        <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Skill Audit & Assessment Reports</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Get notified when automated AI verification finishes</span>
          </div>
          <input
            type="checkbox"
            checked={verificationNotifs}
            onChange={(e) => {
              setVerificationNotifs(e.target.checked);
              handleSave();
            }}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#3D5AFE] focus:ring-[#3D5AFE]"
          />
        </label>

        <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Product Updates & Features</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Receive monthly AI release notes & career insights</span>
          </div>
          <input
            type="checkbox"
            checked={marketingNews}
            onChange={(e) => {
              setMarketingNews(e.target.checked);
              handleSave();
            }}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#3D5AFE] focus:ring-[#3D5AFE]"
          />
        </label>
      </div>
    </div>
  );
};
