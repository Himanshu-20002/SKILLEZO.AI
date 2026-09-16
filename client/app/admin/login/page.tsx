'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  KeyRound,
} from 'lucide-react';
import { signIn, signUp, useSession } from '@/lib/auth-client';
import BrandLogo from '@/components/auth/BrandLogo';

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if ((session?.user as any)?.role === 'admin' || session?.user?.email === 'admin@gmail.com') {
      router.replace('/admin/dashboard');
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both your admin email and password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Attempt standard signIn
      const res = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.error) {
        // If admin@gmail.com does not exist yet in Better Auth, auto-provision
        if (
          email.trim().toLowerCase() === 'admin@gmail.com' &&
          (res.error.message?.toLowerCase().includes('invalid') ||
            res.error.message?.toLowerCase().includes('found'))
        ) {
          const upRes = await signUp.email({
            email: 'admin@gmail.com',
            password,
            name: 'Super Admin',
          } as any);

          if (!upRes.error) {
            setSuccessMsg('Admin credentials provisioned successfully! Redirecting...');
            setTimeout(() => {
              window.location.href = '/admin/dashboard';
            }, 800);
            return;
          }
        }

        setErrorMsg(res.error.message || 'Invalid administrator credentials. Please check and retry.');
        return;
      }

      setSuccessMsg('Authentication verified. Launching Admin Command Center...');
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during admin authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060919] text-white flex flex-col justify-between selection:bg-[#3D5AFE]/30 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#3D5AFE]/20 via-[#4F46E5]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-40 right-10 w-[500px] h-[400px] bg-gradient-to-t from-[#00D9C0]/15 via-transparent to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <BrandLogo href="/" />
          <span className="text-xs font-mono font-semibold uppercase px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Admin Gateway
          </span>
        </div>

        <Link
          href="/dashboard"
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to App
        </Link>
      </header>

      {/* Main Admin Card */}
      <main className="w-full max-w-md mx-auto px-6 py-8 z-10">
        <div className="bg-gradient-to-b from-[#0F172A]/90 to-[#0A0E23]/95 border border-slate-800/90 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative">
          {/* Subtle Glow Ring */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#3D5AFE]/30 via-transparent to-transparent pointer-events-none opacity-50" />

          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#3D5AFE]/20 via-[#4F46E5]/20 to-[#00D9C0]/20 border border-slate-700/80 flex items-center justify-center text-[#3D5AFE] mb-4 shadow-lg">
              <ShieldCheck className="w-7 h-7 text-[#00D9C0]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Administrator Access</h1>
            <p className="text-xs text-slate-400 mt-2">
              Sign in with your administrative credentials to manage users, moderation, and system telemetry.
            </p>
          </div>

          {/* Error / Success Feedback */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-[#3D5AFE] focus:ring-1 focus:ring-[#3D5AFE] text-white text-sm placeholder-slate-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-[#3D5AFE] focus:ring-1 focus:ring-[#3D5AFE] text-white text-sm placeholder-slate-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Quick Fill Preset */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@gmail.com');
                  setPassword('Admin@123456');
                }}
                className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#00D9C0]" />
                Auto-fill test credentials
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#4F46E5] hover:from-[#324ad8] hover:to-[#4338ca] text-white font-semibold text-sm shadow-lg shadow-[#3D5AFE]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Identity...
                </>
              ) : (
                <>
                  Sign In to Admin Portal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
              Restricted area. All unauthorized attempts are logged.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-slate-600 z-10">
        &copy; {new Date().getFullYear()} SKILLEZO AI Platform. Confidential & Proprietary.
      </footer>
    </div>
  );
}
