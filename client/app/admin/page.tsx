'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { ShieldCheck } from 'lucide-react';

export default function AdminRootPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if ((session?.user as any)?.role === 'admin' || session?.user?.email === 'admin@gmail.com') {
      router.replace('/dashboard/admin');
    } else {
      router.replace('/admin/login');
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen bg-[#060919] text-white flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-[#3D5AFE]/20 border border-[#3D5AFE]/40 flex items-center justify-center text-[#3D5AFE] animate-pulse mb-4">
        <ShieldCheck className="w-6 h-6 text-[#00D9C0]" />
      </div>
      <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
        Verifying administrative authorization...
      </p>
    </div>
  );
}
