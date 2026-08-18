'use client';

import React from 'react';
import { Filter } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center">
        <Filter className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm focus:outline-none focus:border-[#3D5AFE] focus:ring-1 focus:ring-[#3D5AFE] appearance-none cursor-pointer transition-all shadow-sm"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#0B1130] text-slate-900 dark:text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute right-3 pointer-events-none text-xs text-slate-400">▼</span>
      </div>
    </div>
  );
};
