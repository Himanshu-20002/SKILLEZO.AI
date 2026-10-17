'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

function ApplicationsRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const appId = searchParams.get('appId') || searchParams.get('id');
    const stage = searchParams.get('stage') || searchParams.get('status');

    if (stage === 'offered' || stage === 'interview' || (appId && stage)) {
      router.replace(appId ? `/dashboard/messages?appId=${appId}` : '/dashboard/messages');
    } else {
      router.replace(appId ? `/dashboard/job-center?tab=applied&appId=${appId}` : '/dashboard/job-center?tab=applied');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-400">
      <RefreshCw className="w-6 h-6 animate-spin text-[#3D5AFE]" />
      <p className="text-xs font-semibold">Redirecting to your applications...</p>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-slate-400 text-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-[#3D5AFE]" />
        </div>
      }
    >
      <ApplicationsRedirectContent />
    </Suspense>
  );
}
