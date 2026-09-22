'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResumePortfolioPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/resume-studio?view=audit');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
