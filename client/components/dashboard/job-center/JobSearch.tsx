'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface JobSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  onClear: () => void;
}

export const JobSearch: React.FC<JobSearchProps> = ({ query, onQueryChange, onClear }) => {
  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search jobs, companies, or required skills (e.g. React, Next.js)..."
        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE] transition-all"
      />
      {query && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
