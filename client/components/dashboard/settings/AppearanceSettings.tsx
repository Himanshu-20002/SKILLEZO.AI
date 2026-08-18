'use client';

import React from 'react';
import { Palette, Moon, Sun, Monitor } from 'lucide-react';
import { CardHeader } from '@/components/dashboard/common/CardHeader';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { toast } from 'sonner';

export const AppearanceSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleSelectTheme = (t: ThemeMode) => {
    setTheme(t);
    toast.success(`Theme updated to ${t.toUpperCase()}`, {
      description: 'Your preference is saved automatically.',
    });
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md space-y-6 shadow-sm dark:shadow-md">
      <CardHeader
        title="Appearance & Theme"
        subtitle="Customize interface theme and display preferences"
        icon={<Palette className="w-5 h-5 text-[#00D9C0]" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
        <button
          onClick={() => handleSelectTheme('dark')}
          className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-[#3D5AFE]/20 border-[#3D5AFE] text-[#3D5AFE] dark:text-white shadow-lg font-bold'
              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Moon className="w-6 h-6 text-[#3D5AFE]" />
          <span className="text-xs font-bold">Dark Enterprise</span>
        </button>

        <button
          onClick={() => handleSelectTheme('light')}
          className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
            theme === 'light'
              ? 'bg-[#3D5AFE]/20 border-[#3D5AFE] text-[#3D5AFE] dark:text-white shadow-lg font-bold'
              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sun className="w-6 h-6 text-amber-500" />
          <span className="text-xs font-bold">Light Mode</span>
        </button>

        <button
          onClick={() => handleSelectTheme('system')}
          className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
            theme === 'system'
              ? 'bg-[#3D5AFE]/20 border-[#3D5AFE] text-[#3D5AFE] dark:text-white shadow-lg font-bold'
              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Monitor className="w-6 h-6 text-[#00D9C0]" />
          <span className="text-xs font-bold">System Default</span>
        </button>
      </div>
    </div>
  );
};
