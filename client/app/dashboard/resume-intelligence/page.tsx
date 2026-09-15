'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';

export default function ResumeIntelligenceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/resume-studio?view=analysis');
  }, [router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
        <Sparkles className="w-6 h-6 animate-pulse" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Unified Resume Studio
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Redirecting to ATS Diagnostics & AI Bullet Editor...
        </p>
      </div>
    </div>
  );
}
