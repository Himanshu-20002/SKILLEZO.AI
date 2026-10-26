'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { LearningCategory, LearningDifficulty } from '@/types/learning-hub';

interface TrackFilterBarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  difficulty: string;
  onSelectDifficulty: (difficulty: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReset: () => void;
}

export const TrackFilterBar: React.FC<TrackFilterBarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  difficulty,
  onSelectDifficulty,
  searchQuery,
  onSearchChange,
  onReset,
}) => {
  const hasActiveFilters =
    activeCategory !== 'All' || difficulty !== 'all' || searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Search Input & Difficulty Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tracks, skills, or architectural topics..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30 focus:border-[#3D5AFE] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={difficulty}
            onChange={(e) => onSelectDifficulty(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30 focus:border-[#3D5AFE]"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-3 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 rounded-xl transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-[#3D5AFE] text-white shadow-sm shadow-[#3D5AFE]/30'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
