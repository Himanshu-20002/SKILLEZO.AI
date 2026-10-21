'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AssessmentsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/skill-verification#assessments');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#3D5AFE] border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Redirecting to Skill Verification Hub...
        </p>
      </div>
    </div>
  );
}
