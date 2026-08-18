'use client';

import React from 'react';
import { Target, ChevronDown } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: string;
  roles: string[];
  onSelectRole: (role: string) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  roles,
  onSelectRole,
}) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#00D9C0]">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Target Role Evaluation</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Select target career path to analyze skill gaps</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 hidden sm:inline">
          Active Role:
        </label>
        <div className="relative">
          <select
            value={selectedRole}
            onChange={(e) => onSelectRole(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#3D5AFE] cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
