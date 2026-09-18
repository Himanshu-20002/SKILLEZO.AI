'use client';

import React, { useState } from 'react';
import { Target, Edit3, Check, X } from 'lucide-react';

interface TargetRoleSelectorProps {
  targetRole?: string;
  onUpdateRole: (role: string | undefined) => void;
}

export const TargetRoleSelector: React.FC<TargetRoleSelectorProps> = ({
  targetRole,
  onUpdateRole,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(targetRole || '');

  const handleSave = () => {
    const trimmed = inputValue.trim();
    onUpdateRole(trimmed ? trimmed.slice(0, 200) : undefined);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(targetRole || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g. Full Stack Developer"
          maxLength={200}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="px-2 py-1 bg-transparent text-xs text-slate-900 dark:text-white outline-none w-full"
        />
        <button
          type="button"
          onClick={handleSave}
          title="Save target role"
          className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          title="Cancel"
          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl border border-indigo-200/60 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20">
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-1 rounded-md bg-indigo-600 text-white shrink-0">
          <Target className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
            Target Benchmark Role
          </span>
          <span className="block text-xs font-semibold text-slate-900 dark:text-white truncate">
            {targetRole || 'Not specified (inferred from profile)'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setInputValue(targetRole || '');
          setIsEditing(true);
        }}
        title="Edit target role"
        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/50 transition-colors cursor-pointer shrink-0"
      >
        <Edit3 className="w-3 h-3" />
        <span>Change</span>
      </button>
    </div>
  );
};
